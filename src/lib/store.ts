import { useSyncExternalStore } from "react";
import type { OrderStatus } from "./data";
import { ORDER_FLOW } from "./data";

/* ---------------- tiny external store helpers ---------------- */

type Listener = () => void;

function makeStore<T>(initial: T) {
  let state = initial;
  const listeners = new Set<Listener>();
  return {
    get: () => state,
    set: (next: T) => {
      state = next;
      listeners.forEach((l) => l());
    },
    subscribe: (l: Listener) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
  };
}

function useStoreValue<T>(store: ReturnType<typeof makeStore<T>>): T {
  return useSyncExternalStore(store.subscribe, store.get, store.get);
}

/* ---------------- session (mock auth, localStorage) ---------------- */

export type SessionUser = { name: string; email: string; initials: string; id: string };

const SESSION_KEY = "menumoto.session";

const sessionStore = makeStore<SessionUser | null>(readSession());

function readSession(): SessionUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}

export function getSession() {
  return sessionStore.get();
}

export function signIn(name: string, email: string): SessionUser {
  const existing = readSession();
  const user: SessionUser = {
    // stable id per browser so Convex orders keep belonging to the same user
    id: existing?.id ?? `u-${crypto.randomUUID()}`,
    name: name.trim() || "Juicy Rider",
    email: email.trim() || "hungry@menumoto.app",
    initials: (name.trim()[0] || "J").toUpperCase(),
  };
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } catch {
    /* ignore */
  }
  sessionStore.set(user);
  return user;
}

export function signOut() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
  sessionStore.set(null);
}

export function useSession() {
  return useStoreValue(sessionStore);
}

/* ---------------- cart (local) ---------------- */

export type Cart = {
  restaurantId: string | null;
  lines: CartLine[];
};

export type CartLine = {
  itemId: string;
  name: string;
  emoji: string;
  price: number;
  qty: number;
};

const cartStore = makeStore<Cart>({ restaurantId: null, lines: [] });

export type AddToCartInput = {
  id: string;
  restaurantId: string;
  name: string;
  emoji: string;
  price: number;
};

export function addItem(item: AddToCartInput) {
  const cart = cartStore.get();
  if (cart.restaurantId && cart.restaurantId !== item.restaurantId) {
    cartStore.set({ restaurantId: item.restaurantId, lines: [{ ...lineFor(item), qty: 1 }] });
    return;
  }
  const existing = cart.lines.find((l) => l.itemId === item.id);
  const lines = existing
    ? cart.lines.map((l) => (l.itemId === item.id ? { ...l, qty: l.qty + 1 } : l))
    : [...cart.lines, lineFor(item)];
  cartStore.set({ restaurantId: item.restaurantId, lines });
}

function lineFor(item: AddToCartInput): CartLine {
  return {
    itemId: item.id,
    name: item.name,
    emoji: item.emoji,
    price: item.price,
    qty: 1,
  };
}

export function changeQty(itemId: string, delta: number) {
  const cart = cartStore.get();
  const lines = cart.lines
    .map((l) => (l.itemId === itemId ? { ...l, qty: l.qty + delta } : l))
    .filter((l) => l.qty > 0);
  cartStore.set({ restaurantId: lines.length ? cart.restaurantId : null, lines });
}

export function removeLine(itemId: string) {
  const cart = cartStore.get();
  const lines = cart.lines.filter((l) => l.itemId !== itemId);
  cartStore.set({ restaurantId: lines.length ? cart.restaurantId : null, lines });
}

export function clearCart() {
  cartStore.set({ restaurantId: null, lines: [] });
}

export function cartCount(): number {
  return cartStore.get().lines.reduce((n, l) => n + l.qty, 0);
}

export function useCart() {
  return useStoreValue(cartStore);
}

/* ---------------- order status helpers (shared client/server timing) ---------------- */

export type OrderLike = {
  createdAt: number;
  durationMs: number;
};

export function orderStatus(order: OrderLike): OrderStatus {
  const elapsed = Date.now() - order.createdAt;
  const progress = elapsed / order.durationMs;
  if (progress >= 1) return "delivered";
  const idx = Math.min(ORDER_FLOW.length - 2, Math.floor(progress * (ORDER_FLOW.length - 1)));
  return ORDER_FLOW[idx];
}

export function orderProgress(order: OrderLike): number {
  return Math.min(1, (Date.now() - order.createdAt) / order.durationMs);
}
