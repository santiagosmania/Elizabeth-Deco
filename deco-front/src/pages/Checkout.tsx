import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Checkout() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(""); // Para mensajes flotantes

  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const total = cart.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
  const cantidad = cart.reduce((sum: number, item: any) => sum + item.quantity, 0);

  const validarEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Determinar si todos los campos son válidos
  const camposValidos = 
    nombre.trim() !== "" && 
    apellido.trim() !== "" && 
    validarEmail(email) && 
    cart.length > 0;

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3000); // desaparece después de 3 segundos
  };

  const pagar = async () => {
    if (!nombre.trim() || !apellido.trim() || !email.trim()) {
      showNotification("Por favor completá todos los campos");
      return;
    }
    if (!validarEmail(email)) {
      showNotification("Por favor ingresá un email válido");
      return;
    }
    if (cart.length === 0) {
      showNotification("Carrito vacío");
      return;
    }

    try {
      setLoading(true);
      const items = cart.map((p: any) => ({
        producto_id: p.id,
        name: p.name,
        price: p.price,
        cantidad: p.quantity,
      }));

      const res = await fetch("http://localhost:8000/mercadopago/preferencia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente: `${nombre} ${apellido}`,
          email,
          items,
        }),
      });

      const data = await res.json();
      if (!data.init_point) {
        showNotification("Mercado Pago no devolvió link de pago");
        console.error(data);
        return;
      }

      window.location.href = data.init_point;
    } catch (e) {
      console.error(e);
      showNotification("Error conectando con Mercado Pago");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pink-50 flex justify-center items-center p-6 relative">
      
      {/* Notificación flotante */}
      {notification && (
        <div className="absolute top-5 left-1/2 transform -translate-x-1/2 bg-pink-400 text-white px-6 py-3 rounded-xl shadow-lg animate-slide-down">
          {notification}
        </div>
      )}

      {/* Contenedor principal */}
      <div className="flex flex-col lg:flex-row w-full max-w-5xl gap-6">

        {/* Formulario */}
        <div className="flex-1 bg-white p-10 rounded-2xl shadow-xl">
          <h1 className="text-3xl font-bold text-pink-400 mb-6 text-center">💳 Información del cliente</h1>

          <input
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => {
              const value = e.target.value;
              if (/^[a-zA-ZáéíóúÁÉÍÓÚüÜ\s]*$/.test(value)) {
                setNombre(value);
              }
            }}
            className="border w-full p-2 rounded mb-3 focus:ring-2 focus:ring-pink-400"
          />

          <input
            placeholder="Apellido"
            value={apellido}
            onChange={(e) => {
              const value = e.target.value;
              if (/^[a-zA-ZáéíóúÁÉÍÓÚüÜ\s]*$/.test(value)) {
                setApellido(value);
              }
            }}
            className="border w-full p-2 rounded mb-3 focus:ring-2 focus:ring-pink-400"
          />

          <input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border w-full p-2 rounded mb-3 focus:ring-2 focus:ring-pink-400"
          />
        </div>

        {/* Resumen + botón */}
        <div className="w-full lg:w-80 bg-white p-6 rounded-2xl shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold text-pink-400 mb-4">Resumen del carrito</h2>
            <div className="flex justify-between mb-2">
              <span>Cantidad de productos:</span>
              <span>{cantidad}</span>
            </div>
            <div className="flex justify-between font-bold text-lg mb-6">
              <span>Total:</span>
              <span>${total}</span>
            </div>
          </div>

          <button
            disabled={!camposValidos || loading}
            onClick={pagar}
            className={`w-full py-3 rounded-xl text-lg font-semibold transition ${
              camposValidos ? "bg-pink-400 hover:bg-pink-500 text-white" : "bg-gray-300 text-gray-600 cursor-not-allowed"
            }`}
          >
            {loading ? "Redirigiendo..." : "Pagar con Mercado Pago"}
          </button>
          <button
            onClick={() => navigate("/")}
            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-pink-400 text-pink-400 rounded-xl shadow hover:bg-pink-50 transition-all font-semibold"
          >
            <span className="text-lg">←</span>
            Volver al inicio
          </button>

        </div>
      </div>

      {/* Animación simple */}
      <style>
        {`
          @keyframes slide-down {
            0% { transform: translateY(-50px); opacity: 0; }
            100% { transform: translateY(0); opacity: 1; }
          }
          .animate-slide-down {
            animation: slide-down 0.3s ease-out;
          }
        `}
      </style>
    </div>
  );
}
