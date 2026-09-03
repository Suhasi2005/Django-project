import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import OrderDetail from './pages/OrderDetail';
import Orders from './pages/Orders';
import ProductDetail from './pages/ProductDetail';
import ProductList from './pages/ProductList';
import Register from './pages/Register';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<ProductList />} />
              <Route path="/products/:slug" element={<ProductDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/cart"
                element={(
                  <ProtectedRoute>
                    <Cart />
                  </ProtectedRoute>
                )}
              />
              <Route
                path="/checkout"
                element={(
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                )}
              />
              <Route
                path="/orders"
                element={(
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                )}
              />
              <Route
                path="/orders/:orderNumber"
                element={(
                  <ProtectedRoute>
                    <OrderDetail />
                  </ProtectedRoute>
                )}
              />
            </Routes>
          </main>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
