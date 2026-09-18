import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  restaurants: defineTable({
    id: v.string(),
    name: v.string(),
    emoji: v.string(),
    cuisine: v.string(),
    rating: v.number(),
    etaMin: v.number(),
    deliveryFee: v.number(),
    accent: v.string(),
    heroDish: v.string(),
  }).index("by_restaurant_id", ["id"]),

  menuItems: defineTable({
    id: v.string(),
    restaurantId: v.string(),
    name: v.string(),
    description: v.string(),
    price: v.number(),
    emoji: v.string(),
    juice: v.number(),
    tags: v.array(v.string()),
    // partner-managed items can be switched off without deleting them
    available: v.optional(v.boolean()),
  }).index("by_restaurant_id", ["restaurantId"]),

  orders: defineTable({
    userId: v.string(),
    restaurantId: v.string(),
    restaurantName: v.string(),
    lines: v.array(
      v.object({
        itemId: v.string(),
        name: v.string(),
        emoji: v.string(),
        price: v.number(),
        qty: v.number(),
      })
    ),
    itemsTotal: v.number(),
    deliveryFee: v.number(),
    total: v.number(),
    address: v.string(),
    riderName: v.string(),
    riderInitials: v.string(),
    riderRating: v.number(),
    riderVehicle: v.string(),
    createdAt: v.number(),
    durationMs: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_restaurant", ["restaurantId"]),

  // links a signed-in partner account to the kitchen it owns
  partners: defineTable({
    userId: v.string(),
    restaurantId: v.string(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_restaurant", ["restaurantId"]),

  // real OTP auth: one row per human, upserted on first successful login
  users: defineTable({
    email: v.string(),
    name: v.string(),
    createdAt: v.number(),
    lastLoginAt: v.optional(v.number()),
  }).index("by_email", ["email"]),

  // hashed 6-digit login codes; only the latest unconsumed code per email counts
  authCodes: defineTable({
    email: v.string(),
    codeHash: v.string(),
    attempts: v.number(),
    consumed: v.boolean(),
    createdAt: v.number(),
    expiresAt: v.number(),
  }).index("by_email", ["email"]),

  // bearer tokens for signed-in devices (30-day expiry, cleaned on sign-out)
  sessions: defineTable({
    userId: v.id("users"),
    token: v.string(),
    createdAt: v.number(),
    expiresAt: v.number(),
  }).index("by_token", ["token"]),
});
