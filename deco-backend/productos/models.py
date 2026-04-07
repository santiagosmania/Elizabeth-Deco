from django.db import models


class Categoria(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(null=True, blank=True)
    activa = models.BooleanField(default=True)
    create_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nombre

    class Meta:
        db_table = 'categorias'
        managed = False


class Producto(models.Model):
    nombre = models.CharField(max_length=150)
    descripcion = models.TextField()
    categoria = models.ForeignKey(
        Categoria,
        on_delete=models.CASCADE,
        db_column='categoria_id'  
    )
    stock = models.IntegerField()
    activo = models.BooleanField(default=True)
    create_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nombre

    class Meta:
        db_table = 'productos'
        managed = False


class Precio(models.Model):
    producto = models.ForeignKey(
        Producto,
        on_delete=models.CASCADE,
        db_column='producto_id'
    )
    precio = models.IntegerField()
    activo = models.BooleanField(default=True)
    fecha_desde = models.DateTimeField(auto_now_add=True)
    fecha_hasta = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'precios'
        managed = False


class Oferta(models.Model):
    producto = models.ForeignKey(
        Producto,
        on_delete=models.CASCADE,
        db_column='producto_id'
    )
    descuento = models.IntegerField()
    activa = models.BooleanField(default=True)
    fecha_inicio = models.DateTimeField()
    fecha_fin = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'ofertas'
        managed = False


class Orden(models.Model):
    ESTADOS = [
        ('pendiente', 'Pendiente'),
        ('aprobada', 'Aprobada'),
        ('pagada', 'Pagada'),
        ('cancelada', 'Cancelada'),
    ]

    nombre_cliente = models.CharField(max_length=200)
    total = models.DecimalField(max_digits=12, decimal_places=2)
    estado = models.CharField(max_length=20, choices=ESTADOS, default='pendiente')
    create_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ordenes'
        managed = False


class OrdenItem(models.Model):
    orden = models.ForeignKey(
        Orden,
        on_delete=models.CASCADE,
        db_column='orden_id'
    )
    producto = models.ForeignKey(
        Producto,
        on_delete=models.CASCADE,
        db_column='producto_id'
    )
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=2)
    cantidad = models.IntegerField()

    class Meta:
        db_table = 'orden_items'
        managed = False