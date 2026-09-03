# OneStop Disposables

A full-stack e-commerce platform for a disposable-products online store: one Django + Django REST Framework backend serving **three** clients — a React web app, a React Native mobile app, and the original server-rendered Django templates.

## Features
- Custom user model with **two** auth schemes off the same backend: session + CSRF for the browser-based web app, and token auth for the React Native app (which has no cookie jar) — see `account/api_views.py` for why these are kept as separate endpoints rather than weakening CSRF globally
- Product catalog with categories, stock tracking, and promotional banners
- Cart and checkout as a REST API: add/update/remove items, then check out into an `Order` in one atomic transaction that validates stock, snapshots price/name onto each `OrderItem`, decrements stock, and empties the cart
- Order history scoped per user (a user can only ever see their own orders)
- **Web** (`frontend/`): product browsing with category filters, product detail, cart, checkout, and order history
- **Mobile** (`mobile/`): the same flow as native screens, built with React Native + Expo
- Server-rendered storefront pages via Django templates also still available (`app` app)

## Tech Stack
**Backend:** Python, Django, Django REST Framework, django-cors-headers, SQLite (dev)
**Web:** React, Vite, React Router
**Mobile:** React Native, Expo, React Navigation

## Project Structure
```
account/, app/, oneStop_Disposables/   # Django project (backend)
frontend/                              # React web app (Vite)
mobile/                                # React Native app (Expo)
```

## API Overview
All endpoints are under `/api/`.

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/auth/csrf/` | GET | Public | Sets the CSRF cookie for the web app; call once on app load |
| `/api/auth/register/` | POST | Public | Create an account and log in (web, session-based) |
| `/api/auth/login/` | POST | Public | Log in (web, session-based) |
| `/api/auth/logout/` | POST | Required | Log out (web) |
| `/api/auth/me/` | GET | Public | Current user, or 401 if not logged in (web) |
| `/api/auth/token/register/` | POST | Public | Create an account, returns a bearer token (mobile) |
| `/api/auth/token/login/` | POST | Public | Log in, returns a bearer token (mobile) |
| `/api/auth/token/logout/` | POST | Required | Invalidate the current token (mobile) |
| `/api/auth/token/me/` | GET | Required | Current user (mobile) |
| `/api/categories/` | GET | Public | List categories |
| `/api/products/` | GET | Public | List available products (`?category=<slug>` to filter) |
| `/api/products/<slug>/` | GET | Public | Product detail |
| `/api/cart/` | GET | Required | View the current user's cart |
| `/api/cart/items/` | POST | Required | Add a product to the cart (`product_id`, `quantity`) |
| `/api/cart/items/<id>/` | PATCH / DELETE | Required | Update quantity / remove a cart item |
| `/api/checkout/` | POST | Required | Convert the cart into an order |
| `/api/orders/` | GET | Required | List the current user's past orders |
| `/api/orders/<order_number>/` | GET | Required | Order detail |

"Required" endpoints accept **either** a session cookie + CSRF header (web) **or** an `Authorization: Token <key>` header (mobile) — both authentication classes are enabled globally in `REST_FRAMEWORK.DEFAULT_AUTHENTICATION_CLASSES`.

## Run the backend
```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```
Backend runs at `http://127.0.0.1:8000`.

## Run the web app
```bash
cd frontend
npm install
npm run dev
```
Runs at `http://localhost:5173` and talks to the backend above (CORS/CSRF already configured for this pair of origins in `settings.py`). Copy `frontend/.env.example` to `frontend/.env` to point it at a different backend URL.

## Run the mobile app
```bash
cd mobile
npm install
npx expo start
```
See `mobile/README.md` for how to point it at the backend depending on whether you're using an emulator or a physical phone.

## Run tests
```bash
python manage.py test
```
