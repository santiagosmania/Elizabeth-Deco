from django.http import JsonResponse
from django.db import models
from .models import Producto, Precio, Oferta, Orden, OrdenItem
from django.utils import timezone
import json

def tienda(request):
    productos = Producto.objects.filter(activo=True)
    result = []

    for p in productos:
        # Precio activo
        precio_obj = Precio.objects.filter(
            producto=p, activo=True
        ).order_by('-fecha_desde').first()

        # Oferta activa
        ahora = timezone.now()
        oferta = Oferta.objects.filter(
            producto=p,
            activa=True,
            fecha_inicio__lte=ahora
        ).filter(
            models.Q(fecha_fin__isnull=True) | models.Q(fecha_fin__gte=ahora)
        ).first()

        precio_final = precio_obj.precio if precio_obj else 0
        if oferta:
            precio_final = precio_final * (1 - oferta.descuento / 100)

        result.append({
            'id': p.id,
            'nombre': p.nombre,
            'descripcion': p.descripcion,
            'precio': precio_final,
            'stock': p.stock,
        })

    return JsonResponse(result, safe=False)


def checkout(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        orden = Orden.objects.create(
            nombre_cliente=data['nombre_cliente'],
            total=data['total'],
        )
        for item in data['items']:
            OrdenItem.objects.create(
                orden=orden,
                producto_id=item['id'],
                precio_unitario=item['price'],
                cantidad=item['quantity'],
            )
            # Descontar stock
            producto = Producto.objects.get(id=item['id'])
            producto.stock -= item['quantity']
            producto.save()

        return JsonResponse({'mensaje': 'Orden creada', 'orden_id': orden.id})

    return JsonResponse({'error': 'Método no permitido'}, status=405)