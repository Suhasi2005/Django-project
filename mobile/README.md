# OneStop Disposables — Mobile (React Native)

A React Native (Expo) client for the same Django REST API used by the [web frontend](../frontend) — product browsing, cart, checkout, and order history, on a phone.

## Why this exists
Rather than build a throwaway demo app, this reuses the project's real backend: the same `Product`/`Cart`/`Order` models and endpoints that power the web app. The only backend addition needed was a **token-based auth API** (`/api/auth/token/...`), since a mobile app has no cookie jar the way a browser does — see `account/api_views.py` in the backend for the session-vs-token split and why they're kept as separate endpoints rather than disabling CSRF globally.

## Tech Stack
React Native, Expo, React Navigation, AsyncStorage

## Setup
```bash
cd mobile
npm install
```

## Point it at your backend
Edit `src/api.js` — `API_BASE` depends on **where the app is running relative to the Django server**:

| Running on | Use |
|---|---|
| Android emulator | `http://10.0.2.2:8000` (already the default) |
| iOS simulator | `http://127.0.0.1:8000` (already the default fallback) |
| Physical phone (Expo Go) | Your computer's LAN IP, e.g. `http://192.168.1.5:8000` — phone and computer must be on the same Wi-Fi |

Also make sure the Django backend is actually running (`python manage.py runserver 0.0.0.0:8000` — the `0.0.0.0` matters for physical-device testing, otherwise the server only accepts connections from the same machine).

## Run
```bash
npx expo start
```
Then press `a` for Android emulator, `i` for iOS simulator, or scan the QR code with the **Expo Go** app on a physical phone.

## Screens
Product list (with category filter) → Product detail → Cart → Checkout → Order confirmation / Order history — plus Login and Register.
