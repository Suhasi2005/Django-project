from django.shortcuts import render
from .models import Product, Banner, Category
from django.conf import settings
User = settings.AUTH_USER_MODEL

def home(request):
    products = Product.objects.filter(available=True)[:12]
    banners = Banner.objects.filter(active=True)
    categories = Category.objects.all()
    
    context = {
        'products': products,
        'banners': banners,
        'categories': categories,
    }
    return render(request, 'app/home.html', context)

def product_detail(request, slug):
    product = Product.objects.get(slug=slug)
    related_products = Product.objects.filter(category=product.category).exclude(id=product.id)[:4]
    
    context = {
        'product': product,
        'related_products': related_products,
    }
    return render(request, 'app/product_detail.html', context)