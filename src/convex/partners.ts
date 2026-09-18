import { mutation, query } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";
import { v } from "convex/values";

const EMOJI_CHOICES = ["🍔", "🍣", "🍜", "🌮", "🍕", "🥗", "🥐", "🌯", "🥙", "🍩"];
const ACCENT_CHOICES = ["#ff5c1f", "#2fa843", "#f5a623", "#f43f6e", "#8fe04a", "#ffd23f"];

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "kitchen"
  );
}

function pickAccent(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return ACCENT_CHOICES[hash % ACCENT_CHOICES.length];
}

/* ---------------- partner account ---------------- */

export const getPartner = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("partners")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
  },
});

export const registerKitchen = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    cuisine: v.string(),
    emoji: v.string(),
    etaMin: v.number(),
    deliveryFee: v.number(),
  },
  returns: v.object({ restaurantId: v.string() }),
  handler: async (ctx, args) => {
    const name = args.name.trim();
    if (name.length < 3) throw new Error("Kitchen name needs at least 3 characters");
    if (name.length > 40) throw new Error("Kitchen name is too long (max 40)");
    const cuisine = args.cuisine.trim();
    if (cuisine.length < 3) throw new Error("Tell customers what you cook (min 3 characters)");
    if (!EMOJI_CHOICES.includes(args.emoji)) throw new Error("Pick a kitchen icon");
    if (args.etaMin < 5 || args.etaMin > 90) throw new Error("ETA must be between 5 and 90 minutes");
    if (args.deliveryFee < 0 || args.deliveryFee > 10) throw new Error("Delivery fee must be between $0 and $10");

    const existing = await ctx.db
      .query("partners")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
    if (existing) throw new Error("You already run a kitchen on JuicyBruh");

    // unique, readable handle: slug, then slug-2, slug-3…
    const base = slugify(name);
    let id = base;
    let n = 2;
    while (await ctx.db.query("restaurants").withIndex("by_restaurant_id", (q) => q.eq("id", id)).first()) {
      id = `${base}-${n++}`;
    }

    await ctx.db.insert("restaurants", {
      id,
      name,
      emoji: args.emoji,
      cuisine,
      rating: 5.0,
      etaMin: Math.round(args.etaMin),
      deliveryFee: Math.round(args.deliveryFee * 100) / 100,
      accent: pickAccent(name),
      heroDish: "",
    });

    await ctx.db.insert("partners", {
      userId: args.userId,
      restaurantId: id,
      createdAt: Date.now(),
    });

    return { restaurantId: id };
  },
});

/* ---------------- ownership helper ---------------- */

async function requireOwnership(
  ctx: QueryCtx,
  userId: string,
  restaurantId: string
): Promise<void> {
  const partner = await ctx.db
    .query("partners")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();
  if (!partner || partner.restaurantId !== restaurantId) {
    throw new Error("Not your kitchen");
  }
}

/* ---------------- profile ---------------- */

export const updateKitchen = mutation({
  args: {
    userId: v.string(),
    restaurantId: v.string(),
    name: v.optional(v.string()),
    cuisine: v.optional(v.string()),
    emoji: v.optional(v.string()),
    etaMin: v.optional(v.number()),
    deliveryFee: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireOwnership(ctx, args.userId, args.restaurantId);
    const restaurant = await ctx.db
      .query("restaurants")
      .withIndex("by_restaurant_id", (q) => q.eq("id", args.restaurantId))
      .first();
    if (!restaurant) throw new Error("Kitchen not found");

    const patch: Partial<typeof restaurant> = {};
    if (args.name !== undefined) {
      const name = args.name.trim();
      if (name.length < 3 || name.length > 40) throw new Error("Name must be 3–40 characters");
      patch.name = name;
    }
    if (args.cuisine !== undefined) {
      const cuisine = args.cuisine.trim();
      if (cuisine.length < 3) throw new Error("Cuisine needs at least 3 characters");
      patch.cuisine = cuisine;
    }
    if (args.emoji !== undefined) {
      if (!EMOJI_CHOICES.includes(args.emoji)) throw new Error("Pick a valid kitchen icon");
      patch.emoji = args.emoji;
    }
    if (args.etaMin !== undefined) {
      if (args.etaMin < 5 || args.etaMin > 90) throw new Error("ETA must be between 5 and 90 minutes");
      patch.etaMin = Math.round(args.etaMin);
    }
    if (args.deliveryFee !== undefined) {
      if (args.deliveryFee < 0 || args.deliveryFee > 10) throw new Error("Delivery fee must be between $0 and $10");
      patch.deliveryFee = Math.round(args.deliveryFee * 100) / 100;
    }

    await ctx.db.patch(restaurant._id, patch);
    return null;
  },
});

/* ---------------- menu items ---------------- */

const itemFields = {
  name: v.string(),
  description: v.string(),
  price: v.number(),
  emoji: v.string(),
  juice: v.number(),
  tags: v.array(v.string()),
};

export const addMenuItem = mutation({
  args: {
    userId: v.string(),
    restaurantId: v.string(),
    ...itemFields,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireOwnership(ctx, args.userId, args.restaurantId);

    const name = args.name.trim();
    if (name.length < 2) throw new Error("Dish name needs at least 2 characters");
    const description = args.description.trim();
    if (description.length < 10) throw new Error("Description needs at least 10 characters");
    if (args.price <= 0 || args.price > 100) throw new Error("Price must be between $0.01 and $100");
    if (args.juice < 0 || args.juice > 100) throw new Error("Juice must be 0–100");
    const validTags = ["bestseller", "veg", "spicy", "new"];
    for (const t of args.tags) {
      if (!validTags.includes(t)) throw new Error(`Unknown tag: ${t}`);
    }

    // unique item id within the kitchen
    const base = slugify(name);
    let id = `${args.restaurantId}-${base}`;
    let n = 2;
    const existing = await ctx.db
      .query("menuItems")
      .withIndex("by_restaurant_id", (q) => q.eq("restaurantId", args.restaurantId))
      .collect();
    const taken = new Set(existing.map((e) => e.id));
    while (taken.has(id)) id = `${args.restaurantId}-${base}-${n++}`;

    await ctx.db.insert("menuItems", {
      id,
      restaurantId: args.restaurantId,
      name,
      description,
      price: Math.round(args.price * 100) / 100,
      emoji: args.emoji,
      juice: Math.round(args.juice),
      tags: args.tags,
      available: true,
    });
    return null;
  },
});

export const updateMenuItem = mutation({
  args: {
    userId: v.string(),
    restaurantId: v.string(),
    itemId: v.string(),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    available: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireOwnership(ctx, args.userId, args.restaurantId);
    const item = await ctx.db
      .query("menuItems")
      .withIndex("by_restaurant_id", (q) => q.eq("restaurantId", args.restaurantId))
      .collect()
      .then((items) => items.find((i) => i.id === args.itemId));
    if (!item) throw new Error("Dish not found");

    const patch: Partial<typeof item> = {};
    if (args.name !== undefined) {
      const name = args.name.trim();
      if (name.length < 2) throw new Error("Dish name needs at least 2 characters");
      patch.name = name;
    }
    if (args.description !== undefined) {
      const description = args.description.trim();
      if (description.length < 10) throw new Error("Description needs at least 10 characters");
      patch.description = description;
    }
    if (args.price !== undefined) {
      if (args.price <= 0 || args.price > 100) throw new Error("Price must be between $0.01 and $100");
      patch.price = Math.round(args.price * 100) / 100;
    }
    if (args.available !== undefined) patch.available = args.available;

    await ctx.db.patch(item._id, patch);
    return null;
  },
});

export const deleteMenuItem = mutation({
  args: { userId: v.string(), restaurantId: v.string(), itemId: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireOwnership(ctx, args.userId, args.restaurantId);
    const item = await ctx.db
      .query("menuItems")
      .withIndex("by_restaurant_id", (q) => q.eq("restaurantId", args.restaurantId))
      .collect()
      .then((items) => items.find((i) => i.id === args.itemId));
    if (!item) throw new Error("Dish not found");
    await ctx.db.delete(item._id);
    return null;
  },
});

export { EMOJI_CHOICES, ACCENT_CHOICES };
