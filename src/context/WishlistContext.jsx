/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../lib/api';

const WishlistContext = createContext(null);

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used inside <WishlistProvider>');
  return ctx;
};

const readLocal = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem('wishlist') || '[]');
    return Array.isArray(parsed) ? parsed.map(Number) : [];
  } catch {
    return [];
  }
};

// Works for everyone (saved on this device). When logged in, it also syncs to the account
// so the wishlist follows the customer to other devices.
export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [ids, setIds] = useState(readLocal);
  const syncedFor = useRef(null); // email the current list has been merged with

  useEffect(() => {
    try { localStorage.setItem('wishlist', JSON.stringify(ids)); } catch { /* storage unavailable */ }
  }, [ids]);

  // On login: merge the server list with whatever was saved on this device.
  useEffect(() => {
    if (!user) { syncedFor.current = null; return undefined; }
    let alive = true;
    api('getWishlist')
      .then((d) => {
        if (!alive) return;
        setIds((prev) => [...new Set([...prev, ...d.ids])]);
        syncedFor.current = user.email;
      })
      .catch(() => { /* stay local-only */ });
    return () => { alive = false; };
  }, [user]);

  // After a merge, push every change to the account (debounced).
  useEffect(() => {
    if (!user || syncedFor.current !== user.email) return undefined;
    const t = setTimeout(() => { api('saveWishlist', { ids }).catch(() => {}); }, 600);
    return () => clearTimeout(t);
  }, [ids, user]);

  const toggle = useCallback(
    (id) => setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])),
    []
  );
  const has = useCallback((id) => ids.includes(id), [ids]);

  const value = useMemo(() => ({ ids, toggle, has, count: ids.length }), [ids, toggle, has]);
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};
