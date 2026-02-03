import { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Checkout from "./pages/Checkout";

type Product = {
  stock: number;
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
};

type CartItem = Product & {
  quantity: number;
};

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [notify, setNotify] = useState<string | null>(null); // mensaje de toast
  const navigate = useNavigate();

  // 👉 TRAER PRODUCTOS DESDE DJANGO
  useEffect(() => {
    fetch("http://localhost:8000/productos/tienda")
      .then((res) => res.json())
      .then((data) => {
        const mapped = data.map((p: any) => ({
          id: p.id,
          name: p.nombre,
          description: p.descripcion,
          price: p.precio,
          stock: p.stock,
          image: "https://picsum.photos/400?" + p.id,
        }));
        setProducts(mapped);
      })
      .catch(console.error);
  }, []);

  // 👉 Mostrar notificación temporal
  const showNotify = (message: string) => {
    setNotify(message);
    setTimeout(() => setNotify(null), 1000);
  };

  // 👉 Agregar al carrito, sumando si ya existe y restando stock
  const addToCart = (p: Product) => {
    if (p.stock <= 0) {
      showNotify("❌ No hay stock disponible");
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.id === p.id);
      if (existing) {
        return prev.map((item) =>
          item.id === p.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...p, quantity: 1 }];
    });

    // Reducir stock en products
    setProducts((prev) =>
      prev.map((item) =>
        item.id === p.id ? { ...item, stock: item.stock - 1 } : item
      )
    );

    // Notificación de agregado
    showNotify(`✅ ${p.name} agregado al carrito`);
  };

  // 👉 Incrementar cantidad
  const increment = (id: number) => {
    const product = products.find((p) => p.id === id);
    if (!product || product.stock <= 0) {
      showNotify("❌ No hay stock disponible");
      return;
    }

    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );

    setProducts((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, stock: item.stock - 1 } : item
      )
    );

    showNotify(`✅ ${product.name} agregado al carrito`);
  };

  // 👉 Decrementar cantidad
  const decrement = (id: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );

    // Reponer stock
    const cartItem = cart.find((item) => item.id === id);
    if (cartItem) {
      setProducts((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, stock: item.stock + 1 } : item
        )
      );
    }
  };

  // 👉 Eliminar item completo
  const removeFromCart = (id: number) => {
    const cartItem = cart.find((item) => item.id === id);
    if (cartItem) {
      // Reponer stock
      setProducts((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, stock: item.stock + cartItem.quantity }
            : item
        )
      );
    }
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  // 👉 Vaciar carrito
  const clearCart = () => {
    setProducts((prev) =>
      prev.map((p) => {
        const cartItem = cart.find((c) => c.id === p.id);
        return cartItem ? { ...p, stock: p.stock + cartItem.quantity } : p;
      })
    );
    setCart([]);
  };

  const total = cart.reduce((a, b) => a + b.price * b.quantity, 0);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="min-h-screen bg-pink-50 p-4 sm:p-8 relative">
            {/* 🔔 Toast flotante */}
            {notify && (
              <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50 animate-slide-down">
                {notify}
              </div>
            )}

            <button
              onClick={() => setOpen(true)}
              className="fixed top-4 right-4 bg-pink-400 text-white px-4 py-2 rounded-full shadow-lg z-50"
            >
              🛒 {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </button>

            <h1 className="text-2xl sm:text-4xl font-bold text-center text-pink-400 mb-6 sm:mb-10">
              Elizabeth Deco 🌸
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition"
                >
                  <img src={p.image} className="h-48 w-full object-cover" />

                  <div className="p-4">
                    <h3 className="font-semibold text-lg">{p.name}</h3>

                    <p className="text-sm text-gray-500">{p.description}</p>

                    <p className="font-bold mt-2">${p.price}</p>

                    <p className="text-sm text-gray-400">
                      {p.stock > 0 ? `Stock: ${p.stock}` : "Agotado"}
                    </p>

                    <button
                      onClick={() => addToCart(p)}
                      disabled={p.stock <= 0}
                      className={`mt-3 w-full py-2 rounded-xl transition ${
                        p.stock > 0
                          ? "bg-pink-400 text-white hover:bg-pink-500"
                          : "bg-gray-300 text-gray-600 cursor-not-allowed"
                      }`}
                    >
                      {p.stock > 0 ? "Agregar al carrito" : "Sin stock"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Carrito */}
            {open && (
              <div
                onClick={() => setOpen(false)}
                className="fixed inset-0 bg-black/30 z-40"
              />
            )}

            <div
              className={`fixed top-0 right-0 h-full w-full sm:w-80 bg-white shadow-xl p-5 z-50 transition-transform duration-300 ${
                open ? "translate-x-0" : "translate-x-full"
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-pink-400">🛒 Carrito</h2>
                <button
                  onClick={() => setOpen(false)}
                  className="text-pink-400 text-xl"
                >
                  ✕
                </button>
              </div>

              {cart.length === 0 && (
                <p className="text-center text-gray-400 text-sm">
                  Carrito vacío
                </p>
              )}

              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between mb-2 items-center text-sm"
                >
                  <span>
                    {item.name} x {item.quantity}
                  </span>

                  <div className="flex gap-2 items-center">
                    <button
                      onClick={() => decrement(item.id)}
                      className="px-2 py-1 bg-pink-100 text-pink-400 rounded"
                    >
                      -
                    </button>
                    <button
                      onClick={() => increment(item.id)}
                      className="px-2 py-1 bg-pink-100 text-pink-400 rounded"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-pink-400 ml-2"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}

              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="w-full border border-pink-400 text-pink-400 py-2 rounded-xl mb-3 hover:bg-pink-50 transition"
                >
                  Vaciar carrito 🗑️
                </button>
              )}

              <div className="border-t mt-4 pt-4">
                <p className="font-bold">Total: ${total}</p>

               <button
                    onClick={() => {
                      if (cart.length === 0) {
                        showNotify("❌ El carrito está vacío");
                        return;
                      }
                      localStorage.setItem("cart", JSON.stringify(cart));
                      navigate("/checkout");
                    }}
                    className="mt-4 w-full bg-pink-400 py-2 text-white rounded-xl hover:bg-pink-500 transition"
                  >
                    Comprar
                </button>

              </div>
            </div>

            {/* Animación slide-down */}
            <style>
              {`
                @keyframes slide-down {
                  0% { opacity: 0; transform: translateY(-20px); }
                  100% { opacity: 1; transform: translateY(0); }
                }
                .animate-slide-down {
                  animation: slide-down 0.3s ease-out;
                }
              `}
            </style>
          </div>
        }
      />

      <Route path="/checkout" element={<Checkout />} />
    </Routes>
  );
}
