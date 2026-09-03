# OneStop Disposables

A full-stack e-commerce app for a disposable-products online store: a Django + Django REST Framework backend (catalog, session-based auth, cart, checkout) paired with a React frontend that consumes it.

## Features
- Custom user model with session-based auth, exposed both as Django views (`account` app) and a JSON auth API (register/login/logout/me) with real CSRF protection
- Product catalog with categories, stock tracking, and promotional banners
- Cart and checkout as a REST API: add/update/remove items, then check out into an `Order` in one atomic transaction that validates stock, snapshots price/name onto each `OrderItem`, decrements stock, and empties the cart
- Order history scoped per user (a user can only ever see their own orders)
- React frontend: product browsing with category filters, product detail, cart, checkout, and order history — all talking to the API over CORS with session cookies + CSRF
- Server-rendered storefront pages via Django templates also still available (`app` app)

## Tech Stack
**Backend:** Python, Django, Django REST Framework, django-cors-headers, SQLite (dev)
**Frontend:** React, Vite, React Router

## Project Structure
```
account/, app/, oneStop_Disposables/   # Django project (backend)
frontend/                              # React app (Vite)
```

## API Overview
All endpoints are under `/api/`.

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/auth/csrf/` | GET | Public | Sets the CSRF cookie; call once on app load |
| `/api/auth/register/` | POST | Public | Create an account and log in |
| `/api/auth/login/` | POST | Public | Log in |
| `/api/auth/logout/` | POST | Required | Log out |
| `/api/auth/me/` | GET | Public | Current user, or 401 if not logged in |
| `/api/categories/` | GET | Public | List categories |
| `/api/products/` | GET | Public | List available products (`?category=<slug>` to filter) |
| `/api/products/<slug>/` | GET | Public | Product detail |
| `/api/cart/` | GET | Required | View the current user's cart |
| `/api/cart/items/` | POST | Required | Add a product to the cart (`product_id`, `quantity`) |
| `/api/cart/items/<id>/` | PATCH / DELETE | Required | Update quantity / remove a cart item |
| `/api/checkout/` | POST | Required | Convert the cart into an order |
| `/api/orders/` | GET | Required | List the current user's past orders |
| `/api/orders/<order_number>/` | GET | Required | Order detail |

## Run the backend
```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```
Backend runs at `http://127.0.0.1:8000`.

## Run the frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs at `http://localhost:5173` and talks to the backend above (CORS/CSRF are already configured for this pair of origins in `settings.py`). Copy `frontend/.env.example` to `frontend/.env` to point it at a different backend URL.

## Run tests
```bash
python manage.py test
```
