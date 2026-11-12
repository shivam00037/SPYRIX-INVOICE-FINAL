import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { apiRequest } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);

  const refreshSession = useCallback(async () => {
    const token = localStorage.getItem('spyrix_token');
    if (!token) {
      setSession(null);
      setChecking(false);
      return;
    }
    try {
      const result = await apiRequest('/auth/me');
      setSession(result);
    } catch {
      localStorage.removeItem('spyrix_token');
      setSession(null);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    if (session?.business?.invoiceDesign && Object.keys(session.business.invoiceDesign).length) {
      localStorage.setItem('spyrix_invoice_design', JSON.stringify(session.business.invoiceDesign));
      if (session.business.invoiceDesign.templateId) localStorage.setItem('spyrix_invoice_template', session.business.invoiceDesign.templateId);
    }
  }, [session?.business?.id, session?.business?.invoiceDesign]);

  useEffect(() => {
    refreshSession();
    const onUnauthorized = () => setSession(null);
    window.addEventListener('spyrix:unauthorized', onUnauthorized);
    return () => window.removeEventListener('spyrix:unauthorized', onUnauthorized);
  }, [refreshSession]);

  const login = async (email, password) => {
    const result = await apiRequest('/auth/login', {
      method: 'POST', body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('spyrix_token', result.token);
    setSession(result);
    return result;
  };

  const register = async (payload) => {
    const result = await apiRequest('/auth/register', {
      method: 'POST', body: JSON.stringify(payload),
    });
    localStorage.setItem('spyrix_token', result.token);
    setSession(result);
    return result;
  };

  const logout = () => {
    localStorage.removeItem('spyrix_token');
    setSession(null);
  };

  const value = useMemo(() => ({ session, user: session?.user, business: session?.business, checking, login, register, logout, refreshSession }), [session, checking, refreshSession]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
