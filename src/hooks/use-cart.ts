"use client";

import { useState, useEffect, useCallback } from "react";

export type CartItem = {
  menuItemId: string;
  name: string;
  quantity: number;
};

type CartData = {
  eventId: string | null;
  items: CartItem[];
};

const CART_KEY = "streetcat_cart";

function loadCart(): CartData {
  if (typeof window === "undefined") return { eventId: null, items: [] };
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return { eventId: null, items: [] };
    const parsed = JSON.parse(raw);
    // Handle old format (array)
    if (Array.isArray(parsed)) return { eventId: null, items: parsed };
    return parsed;
  } catch {
    return { eventId: null, items: [] };
  }
}

function saveCart(data: CartData) {
  localStorage.setItem(CART_KEY, JSON.stringify(data));
}

// Global listeners so multiple components stay in sync
const listeners = new Set<() => void>();
function notify() {
  listeners.forEach((fn) => fn());
}

export function useCart() {
  const [cart, setCart] = useState<CartData>({ eventId: null, items: [] });

  useEffect(() => {
    setCart(loadCart());
    const update = () => setCart(loadCart());
    listeners.add(update);
    return () => {
      listeners.delete(update);
    };
  }, []);

  const addItem = useCallback(
    (menuItemId: string, name: string, eventId: string) => {
      const current = loadCart();
      // If switching events, clear old cart
      if (current.eventId && current.eventId !== eventId) {
        const newCart = {
          eventId,
          items: [{ menuItemId, name, quantity: 1 }],
        };
        saveCart(newCart);
        setCart(newCart);
        notify();
        return;
      }
      current.eventId = eventId;
      const existing = current.items.find((i) => i.menuItemId === menuItemId);
      if (existing) {
        existing.quantity += 1;
      } else {
        current.items.push({ menuItemId, name, quantity: 1 });
      }
      saveCart(current);
      setCart({ ...current, items: [...current.items] });
      notify();
    },
    []
  );

  const removeItem = useCallback((menuItemId: string) => {
    const current = loadCart();
    const existing = current.items.find((i) => i.menuItemId === menuItemId);
    if (existing) {
      existing.quantity -= 1;
      if (existing.quantity <= 0) {
        current.items = current.items.filter(
          (i) => i.menuItemId !== menuItemId
        );
      }
      if (current.items.length === 0) {
        current.eventId = null;
      }
      saveCart(current);
      setCart({ ...current, items: [...current.items] });
    }
    notify();
  }, []);

  const clearCart = useCallback(() => {
    const empty = { eventId: null, items: [] };
    saveCart(empty);
    setCart(empty);
    notify();
  }, []);

  const totalItems = cart.items.reduce((sum, i) => sum + i.quantity, 0);

  const getQuantity = useCallback(
    (menuItemId: string) =>
      cart.items.find((i) => i.menuItemId === menuItemId)?.quantity || 0,
    [cart.items]
  );

  return {
    items: cart.items,
    eventId: cart.eventId,
    addItem,
    removeItem,
    clearCart,
    totalItems,
    getQuantity,
  };
}
