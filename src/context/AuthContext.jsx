/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, apiConfigured, getToken, setToken } from '../lib/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // True only while we are validating a saved login token on first load.
  const [loading, setLoading] = useState(() => apiConfigured && Boolean(getToken()));

  useEffect(() => {
    if (!apiConfigured || !getToken()) return undefined;
    let alive = true;
    api('me')
      .then((d) => alive && setUser(d.user))
      .catch((err) => {
        // Expired / invalid token → sign out. Network errors keep the token for next time.
        if (err.code === 'SERVER') setToken(null);
      })
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);

  const startSession = useCallback((data) => {
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const login = useCallback(async (email, password) => startSession(await api('login', { email, password })), [startSession]);
  const signup = useCallback(async (form) => startSession(await api('signup', form)), [startSession]);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (form) => {
    const data = await api('updateProfile', form);
    setUser(data.user);
    return data.user;
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, signup, logout, updateProfile }),
    [user, loading, login, signup, logout, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
