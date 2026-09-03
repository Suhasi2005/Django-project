import { createContext, useContext, useEffect, useState } from 'react';
import { api, getToken, setToken } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const me = await api.get('/api/auth/token/me/');
        setUser(me);
      } catch {
        await setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function login(username, password) {
    const data = await api.post('/api/auth/token/login/', { username, password });
    await setToken(data.token);
    setUser(data.user);
    return data.user;
  }

  async function register(payload) {
    const data = await api.post('/api/auth/token/register/', payload);
    await setToken(data.token);
    setUser(data.user);
    return data.user;
  }

  async function logout() {
    try {
      await api.post('/api/auth/token/logout/');
    } finally {
      await setToken(null);
      setUser(null);
    }
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
