import { createContext, useContext, useEffect, useState } from 'react';
import { api, ensureCsrfCookie } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      await ensureCsrfCookie();
      try {
        const me = await api.get('/api/auth/me/');
        setUser(me);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function login(username, password) {
    const me = await api.post('/api/auth/login/', { username, password });
    setUser(me);
    return me;
  }

  async function register(payload) {
    const me = await api.post('/api/auth/register/', payload);
    setUser(me);
    return me;
  }

  async function logout() {
    await api.post('/api/auth/logout/');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
