# OneStop Disposables — Django + DRF Backend

An e-commerce backend for a disposable-products online store: catalog, cart, and checkout, built with Django's MVT for the storefront pages and a Django REST Framework API for cart/checkout/order operations.

## Features
- Custom user model with session-based auth (`account` app)
- Product catalog with categories, stock tracking, and promotional banners
- Cart and checkout as a REST API: add/update/remove items, then check out into an `Order` in one atomic transaction that validates stock, snapshots price/name onto each `OrderItem`, decrements stock, and empties the cart
- Order history scoped per user (a user can only ever see their own orders)
- Server-rendered storefront pages via Django templates (`app` app)

## Tech Stack
Python, Django, Django REST Framework, SQLite (dev), Django templates (HTML/CSS)

## API Overview
All endpoints are under `/api/`.

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/categories/` | GET | Public | List categories |
| `/api/products/` | GET | Public | List available products (`?category=<slug>` to filter) |
| `/api/products/<slug>/` | GET | Public | Product detail |
| `/api/cart/` | GET | Required | View the current user's cart |
| `/api/cart/items/` | POST | Required | Add a product to the cart (`product_id`, `quantity`) |
| `/api/cart/items/<id>/` | PATCH / DELETE | Required | Update quantity / remove a cart item |
| `/api/checkout/` | POST | Required | Convert the cart into an order |
| `/api/orders/` | GET | Required | List the current user's past orders |
| `/api/orders/<order_number>/` | GET | Required | Order detail |

## Run locally
```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

## Run tests
```bash
python manage.py test
```
