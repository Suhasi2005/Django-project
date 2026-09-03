import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart(null);
      return;
    }
    try {
      const data = await api.get('/api/cart/');
      setCart(data);
    } catch {
      setCart(null);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  async function addItem(productId, quantity = 1) {
    const data = await api.post('/api/cart/items/', { product_id: productId, quantity });
    setCart(data);
  }

  async function updateItem(itemId, quantity) {
    const data = await api.patch(`/api/cart/items/${itemId}/`, { quantity });
    setCart(data);
  }

  async function removeItem(itemId) {
    const data = await api.delete(`/api/cart/items/${itemId}/`);
    setCart(data);
  }

  return (
    <CartContext.Provider value={{ cart, refreshCart, addItem, updateItem, removeItem, setCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
