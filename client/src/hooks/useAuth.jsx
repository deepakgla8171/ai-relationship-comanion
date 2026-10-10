import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getToken, setToken, removeToken } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(getToken());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const initAuth = async () => {
    setLoading(true);
    try {
      const existingToken = getToken();
      if (existingToken) {
        const res = await api.auth.getMe();
        if (res.success && res.user) {
          setUser(res.user);
          setLoading(false);
          return;
        }
      }

      // If no valid session, auto-initialize as Demo Guest
      const guestRes = await api.auth.guestLogin();
      if (guestRes.success && guestRes.token) {
        setToken(guestRes.token);
        setTokenState(guestRes.token);
        setUser(guestRes.user);
      }
    } catch (err) {
      console.warn('Auth auto-init note:', err.message);
      // Try guest login again in case token expired
      try {
        const guestRes = await api.auth.guestLogin();
        if (guestRes.success) {
          setToken(guestRes.token);
          setTokenState(guestRes.token);
          setUser(guestRes.user);
        }
      } catch (guestErr) {
        setError(guestErr.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.auth.login(credentials);
      if (res.success) {
        setToken(res.token);
        setTokenState(res.token);
        setUser(res.user);
        return res;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.auth.register(userData);
      if (res.success) {
        setToken(res.token);
        setTokenState(res.token);
        setUser(res.user);
        return res;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const guestLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.auth.guestLogin();
      if (res.success) {
        setToken(res.token);
        setTokenState(res.token);
        setUser(res.user);
        return res;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    removeToken();
    setTokenState(null);
    setUser(null);
    // Re-initialize guest mode
    initAuth();
  };

  const refreshUser = async () => {
    try {
      const res = await api.auth.getMe();
      if (res.success && res.user) {
        setUser(res.user);
      }
    } catch (err) {
      console.error('Refresh user failed:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        register,
        guestLogin,
        logout,
        refreshUser,
        isGuest: user?.isGuest ?? true
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
