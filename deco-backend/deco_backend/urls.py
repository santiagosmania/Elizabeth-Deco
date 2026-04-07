from django.contrib import admin
from django.urls import path
from productos import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('productos/tienda', views.tienda),
    path('productos/checkout', views.checkout),
]