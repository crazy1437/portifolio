export type OrderStatus = "confirmed" | "cooking" | "pickup" | "riding" | "arriving" | "delivered";

export type Rider = {
  name: string;
  vehicle: "scooter" | "bike";
  rating: number;
  initials: string;
};

export const RIDERS: Rider[] = [
  { name: "Nia", vehicle: "scooter", rating: 4.98, initials: "N" },
  { name: "Momo", vehicle: "bike", rating: 4.92, initials: "M" },
  { name: "Jet", vehicle: "scooter", rating: 5.0, initials: "J" },
];

export const ORDER_FLOW: OrderStatus[] = ["confirmed", "cooking", "pickup", "riding", "arriving", "delivered"];

export const STATUS_META: Record<OrderStatus, { label: string; blurb: string; emoji: string }> = {
  confirmed: { label: "Order confirmed", blurb: "The kitchen got your order.", emoji: "🧾" },
  cooking: { label: "Cooking", blurb: "Sizzling at full volume.", emoji: "🍳" },
  pickup: { label: "Picked up", blurb: "Bag sealed, rider briefed.", emoji: "🛍️" },
  riding: { label: "Riding", blurb: "Weaving through traffic.", emoji: "🛵" },
  arriving: { label: "Arriving", blurb: "One street away. Get the door!", emoji: "📍" },
  delivered: { label: "Delivered", blurb: "Enjoy every juicy bite.", emoji: "🎉" },
};

export function money(n: number): string {
  return `$${n.toFixed(2)}`;
}

export function fmtEta(msRemaining: number): string {
  const mins = Math.max(0, Math.ceil(msRemaining / 60000));
  if (mins === 0) return "Any second";
  return `${mins} min`;
}
