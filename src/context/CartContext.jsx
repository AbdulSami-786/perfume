/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  applyDiscount,
  FREE_SHIPPING_THRESHOLD,
  PROMO_CODE,
  PROMO_RATE,
  SHIPPING_FEE,
} from '../lib/site';

const CartContext = createContext(null);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
};

const readStorage = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

export const CartProvider = ({ children }) => {
  // Lazy initialisers: the cart is restored synchronously, so it can never be
  // overwritten by an empty first render.
  const [cartItems, setCartItems] = useState(() => {
    const stored = readStorage('cart', []);
    return Array.isArray(stored) ? stored : [];
  });
  const [promoApplied, setPromoApplied] = useState(() => readStorage('promo', false) === true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    try { localStorage.setItem('cart', JSON.stringify(cartItems)); } catch { /* storage unavailable */ }
  }, [cartItems]);

  useEffect(() => {
    try { localStorage.setItem('promo', JSON.stringify(promoApplied)); } catch { /* storage unavailable */ }
  }, [promoApplied]);

  // Pass the raw catalogue product — the sale discount is applied here, once.
  const addToCart = useCallback((product, quantity = 1, { openDrawer = true } = {}) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [
        ...prev,
        {
          ...product,
          originalPrice: product.price,
          price: applyDiscount(product.price),
          quantity,
        },
      ];
    });
    if (openDrawer) setDrawerOpen(true);
  }, []);

  const removeFromCart = useCallback(
    (id) => setCartItems((prev) => prev.filter((item) => item.id !== id)),
    []
  );

  const updateQuantity = useCallback(
    (id, quantity) =>
      setCartItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item))
      ),
    []
  );

  const clearCart = useCallback(() => {
    setCartItems([]);
    setPromoApplied(false);
  }, []);

  const applyPromo = useCallback((code) => {
    const ok = code.trim().toUpperCase() === PROMO_CODE;
    if (ok) setPromoApplied(true);
    return ok;
  }, []);

  const removePromo = useCallback(() => setPromoApplied(false), []);

  const totals = useMemo(() => {
    const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const promoDiscount = promoApplied ? Math.round(subtotal * PROMO_RATE) : 0;
    const afterDiscount = subtotal - promoDiscount;
    const shippingCost = cartItems.length === 0 || afterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    const savings = cartItems.reduce(
      (sum, i) => sum + ((i.originalPrice ?? i.price) - i.price) * i.quantity,
      0
    );
    return {
      cartCount,
      subtotal,
      promoDiscount,
      shippingCost,
      savings,
      grandTotal: afterDiscount + shippingCost,
      freeShippingRemaining: Math.max(0, FREE_SHIPPING_THRESHOLD - afterDiscount),
    };
  }, [cartItems, promoApplied]);

  const value = {
    cartItems,
    cartTotal: totals.subtotal,
    ...totals,
    promoApplied,
    drawerOpen,
    openDrawer: () => setDrawerOpen(true),
    closeDrawer: () => setDrawerOpen(false),
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    applyPromo,
    removePromo,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
