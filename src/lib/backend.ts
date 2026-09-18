import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import type { Doc, Id } from "../convex/_generated/dataModel";
import type { CartLine } from "./store";
import type { OrderStatus } from "./data";
import { orderStatus, orderProgress } from "./store";

/* Canonical product types — the Convex DB is the single source of truth. */

export type Restaurant = {
  id: string;
  name: string;
  emoji: string;
  cuisine: string;
  rating: number;
  etaMin: number;
  deliveryFee: number;
  accent: string;
  heroDish: string;
};

export type MenuItem = {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  emoji: string;
  juice: number;
  tags: string[];
};

export type OrderLike = {
  createdAt: number;
  durationMs: number;
};

export type UiOrder = Doc<"orders"> & {
  id: Id<"orders">;
  status: OrderStatus;
  progress: number;
  remainingMs: number;
};

export function toUiOrder(order: Doc<"orders">, now: number): UiOrder {
  return {
    ...order,
    id: order._id,
    status: orderStatus(order),
    progress: orderProgress(order),
    remainingMs: Math.max(0, order.createdAt + order.durationMs - now),
  };
}

/** Reactive list of the signed-in user's orders (newest first); undefined while loading. */
export function useMyOrders(userId: string | undefined) {
  return useQuery(api.orders.listOrders, userId ? { userId } : "skip");
}

export function useRestaurants() {
  return useQuery(api.orders.listRestaurants, {});
}

export function useMenu(restaurantId: string | undefined) {
  return useQuery(api.orders.getMenu, restaurantId ? { restaurantId } : "skip");
}

export function useBestsellers() {
  return useQuery(api.orders.getBestsellers, {});
}

export function usePlaceOrder() {
  return useMutation(api.orders.placeOrder);
}

export function placeOrderArgs(input: {
  userId: string;
  restaurantId: string;
  lines: CartLine[];
  address: string;
}) {
  return {
    userId: input.userId,
    restaurantId: input.restaurantId,
    lines: input.lines.map((l) => ({
      itemId: l.itemId,
      name: l.name,
      emoji: l.emoji,
      price: l.price,
      qty: l.qty,
    })),
    address: input.address,
  };
}

/* Fallback kitchens for the landing page while the DB seeds (never blocks render). */

export const FALLBACK_RESTAURANTS: Restaurant[] = [
  {
    id: "big-bun",
    name: "Big Bun Society",
    emoji: "🍔",
    cuisine: "Smash burgers",
    rating: 4.9,
    etaMin: 18,
    deliveryFee: 0,
    accent: "#ff5c1f",
    heroDish: "Double Smash Supreme",
  },
  {
    id: "poke-pop",
    name: "Poke Pop Lab",
    emoji: "🍣",
    cuisine: "Poke & bowls",
    rating: 4.8,
    etaMin: 24,
    deliveryFee: 1.99,
    accent: "#2fa843",
    heroDish: "Salmon Sunrise Bowl",
  },
  {
    id: "noodle-nirvana",
    name: "Noodle Nirvana",
    emoji: "🍜",
    cuisine: "Noodles & dumplings",
    rating: 4.7,
    etaMin: 27,
    deliveryFee: 2.49,
    accent: "#f5a623",
    heroDish: "Midnight Miso Ramen",
  },
  {
    id: "taco-turbo",
    name: "Taco Turbo",
    emoji: "🌮",
    cuisine: "Street tacos",
    rating: 4.9,
    etaMin: 15,
    deliveryFee: 0,
    accent: "#f43f6e",
    heroDish: "Al Pastor Trio",
  },
];
