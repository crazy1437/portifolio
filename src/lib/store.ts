import { useSyncExternalStore } from "react";
import { api } from "../convex/_generated/api";
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

/* ---------------- session (real OTP auth via Convex) ---------------- */

export type SessionUser = { id: string; name: string; email: string; initials: string };
export type RawSession = { token: string; user: SessionUser };

const SESSION_KEY = "juicybruh.session.v2";

const sessionStore = makeStore<RawSession | null>(readSession());

function readSession(): RawSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as RawSession) : null;
  } catch {
    return null;
  }
}

function persist(raw: RawSession | null) {
  try {
    if (raw) localStorage.setItem(SESSION_KEY, JSON.stringify(raw));
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

export function getSession(): SessionUser | null {
  return sessionStore.get()?.user ?? null;
}

export function getSessionToken(): string | null {
  return sessionStore.get()?.token ?? null;
}

/** Store the session returned by verifyOtp. */
export function setSession(token: string, user: { id: string; email: string; name: string }) {
  const trimmed = user.name.trim();
  const first = trimmed.split(" ")[0]?.[0] ?? "J";
  const second = trimmed.split(" ")[1]?.[0] ?? "";
  const session: RawSession = {
    token,
    user: {
      id: user.id,
      name: trimmed || "Juicy Rider",
      email: user.email,
      initials: (first + second).toUpperCase(),
    },
  };
  persist(session);
  sessionStore.set(session);
}

export function useSession(): SessionUser | null {
  const raw = useSyncExternalStore(sessionStore.subscribe, sessionStore.get, () => null);
  return raw?.user ?? null;
}

export function useSessionToken(): string | null {
  return useSyncExternalStore(sessionStore.subscribe, sessionStore.get, () => null)?.token ?? null;
}

/* --------- Convex bridge (client is attached once from main.tsx) --------- */

type MinimalConvexClient = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- bridge for api.auth.* refs only
  query: (fn: any, args?: any) => Promise<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- bridge for api.auth.* refs only
  mutation: (fn: any, args?: any) => Promise<any>;
};

let convex: MinimalConvexClient | null = null;

export function attachConvexClient(client: MinimalConvexClient) {
  convex = client;
  // if a stored token was revoked/expired server-side, drop the local session
  const raw = sessionStore.get();
  if (!raw) return;
  client
    .query(api.auth.me, { token: raw.token })
    .then((me) => {
      if (!me) {
        persist(null);
        sessionStore.set(null);
      }
    })
    .catch(() => {
      /* offline: keep the optimistic session */
    });
}

export function signOut() {
  const raw = sessionStore.get();
  persist(null);
  sessionStore.set(null);
  // best-effort server-side revocation; local session is already cleared
  if (raw && convex) {
    void convex.mutation(api.auth.signOutSession, { token: raw.token }).catch(() => {});
  }
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
  return useStoreValue2(cartStore);
}

function useStoreValue2<T>(store: ReturnType<typeof makeStore<T>>): T {
  return useSyncExternalStore(store.subscribe, store.get, store.get);
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
