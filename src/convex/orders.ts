import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { RIDERS } from "../lib/data";
import type { Id } from "./_generated/dataModel";

/* Seed data: restaurants + menu live in the database so the whole flow is
   Convex-backed. Seeding is idempotent. */

export const seedIfEmpty = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const restaurants = [
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

    const existingRestaurants = new Set(
      (await ctx.db.query("restaurants").collect()).map((r) => r.id)
    );
    for (const r of restaurants) {
      if (!existingRestaurants.has(r.id)) {
        await ctx.db.insert("restaurants", r);
      }
    }

    const menu = [
      { id: "bb-1", restaurantId: "big-bun", name: "Double Smash Supreme", description: "Two seared patties, molten cheddar, pickles, secret sauce.", price: 11.9, emoji: "🍔", juice: 97, tags: ["bestseller", "spicy"] },
      { id: "bb-2", restaurantId: "big-bun", name: "Sunset Bacon Melt", description: "Bacon, smoked gouda, caramelized onion, chipotle mayo.", price: 12.9, emoji: "🥓", juice: 92, tags: ["bestseller"] },
      { id: "bb-3", restaurantId: "big-bun", name: "Garden Cruncher", description: "Crispy halloumi, avocado smash, hot honey.", price: 10.5, emoji: "🥬", juice: 88, tags: ["veg", "new"] },
      { id: "bb-4", restaurantId: "big-bun", name: "Crinkle Fries", description: "Golden, crinkled, dangerously salted.", price: 4.2, emoji: "🍟", juice: 85, tags: [] },
      { id: "bb-5", restaurantId: "big-bun", name: "Mango Chili Shake", description: "Alphonso mango, lime, a whisper of chili.", price: 6.5, emoji: "🥤", juice: 90, tags: ["new"] },
      { id: "pp-1", restaurantId: "poke-pop", name: "Salmon Sunrise Bowl", description: "Sashimi salmon, mango, edamame, yuzu dressing.", price: 13.5, emoji: "🐠", juice: 94, tags: ["bestseller"] },
      { id: "pp-2", restaurantId: "poke-pop", name: "Tuna Neon Bowl", description: "Ahi tuna, cucumber ribbons, sesame, sriracha aioli.", price: 14.0, emoji: "🍣", juice: 91, tags: ["spicy"] },
      { id: "pp-3", restaurantId: "poke-pop", name: "Tofu Garden Bowl", description: "Crispy tofu, pickled daikon, avocado, miso-lime.", price: 11.5, emoji: "🥗", juice: 89, tags: ["veg"] },
      { id: "pp-4", restaurantId: "poke-pop", name: "Mochi Trio", description: "Matcha, mango and lychee mochi.", price: 5.9, emoji: "🍡", juice: 87, tags: ["new"] },
      { id: "nn-1", restaurantId: "noodle-nirvana", name: "Midnight Miso Ramen", description: "18-hour broth, chashu, soft egg, black garlic oil.", price: 14.5, emoji: "🍜", juice: 98, tags: ["bestseller"] },
      { id: "nn-2", restaurantId: "noodle-nirvana", name: "Fire Wok Udon", description: "Thick udon, chili crisp, scallion inferno.", price: 13.0, emoji: "🌶️", juice: 95, tags: ["spicy"] },
      { id: "nn-3", restaurantId: "noodle-nirvana", name: "Dumpling Dozen", description: "Twelve pan-fried dumplings, black vinegar dip.", price: 9.9, emoji: "🥟", juice: 93, tags: ["bestseller"] },
      { id: "nn-4", restaurantId: "noodle-nirvana", name: "Cold Sesame Soba", description: "Chilled soba, sesame, crunchy cucumber.", price: 10.9, emoji: "🥢", juice: 84, tags: ["veg"] },
      { id: "tt-1", restaurantId: "taco-turbo", name: "Al Pastor Trio", description: "Trompo pork, pineapple, onion, cilantro.", price: 10.9, emoji: "🌮", juice: 96, tags: ["bestseller"] },
      { id: "tt-2", restaurantId: "taco-turbo", name: "Baja Fish Tacos", description: "Beer-battered cod, slaw, lime crema.", price: 12.5, emoji: "🐟", juice: 92, tags: ["new"] },
      { id: "tt-3", restaurantId: "taco-turbo", name: "Mushroom Barbacoa", description: "Oyster mushroom barbacoa, salsa verde.", price: 10.5, emoji: "🍄", juice: 90, tags: ["veg", "spicy"] },
      { id: "tt-4", restaurantId: "taco-turbo", name: "Elote Cup", description: "Charred corn, cotija, lime, tajín.", price: 4.9, emoji: "🌽", juice: 88, tags: [] },
    ];

    const existingMenu = new Set(
      (await ctx.db.query("menuItems").collect()).map((m) => m.id)
    );
    for (const m of menu) {
      if (!existingMenu.has(m.id)) {
        await ctx.db.insert("menuItems", m);
      }
    }

    return null;
  },
});

export const listRestaurants = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("restaurants").collect();
  },
});

export const getMenu = query({
  args: { restaurantId: v.string() },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("menuItems")
      .withIndex("by_restaurant_id", (q) => q.eq("restaurantId", args.restaurantId))
      .collect();
    // customers only ever see available items
    return items.filter((i) => i.available !== false);
  },
});

export const getOwnerMenu = query({
  args: { restaurantId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("menuItems")
      .withIndex("by_restaurant_id", (q) => q.eq("restaurantId", args.restaurantId))
      .collect();
  },
});

export const getBestsellers = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query("menuItems").collect();
    return items.filter((i) => i.tags.includes("bestseller")).slice(0, 4);
  },
});

/* ---------------- orders ---------------- */

const lineValidator = v.object({
  itemId: v.string(),
  name: v.string(),
  emoji: v.string(),
  price: v.number(),
  qty: v.number(),
});

export const placeOrder = mutation({
  args: {
    userId: v.string(),
    restaurantId: v.string(),
    lines: v.array(lineValidator),
    address: v.string(),
  },
  returns: v.object({ orderId: v.id("orders") }),
  handler: async (ctx, args) => {
    const restaurant = await ctx.db
      .query("restaurants")
      .withIndex("by_restaurant_id", (q) => q.eq("id", args.restaurantId))
      .first();
    if (!restaurant) throw new Error("Unknown restaurant");

    // validate + price server-side: the menu is the single source of truth
    const menu = await ctx.db
      .query("menuItems")
      .withIndex("by_restaurant_id", (q) => q.eq("restaurantId", args.restaurantId))
      .collect();
    const byId = new Map(menu.filter((m) => m.available !== false).map((m) => [m.id, m]));

    let itemsTotal = 0;
    const pricedLines = args.lines.map((line) => {
      const item = byId.get(line.itemId);
      if (!item) {
        throw new Error(
          `Sorry — ${line.name} is no longer on the menu. Remove it and try again.`,
        );
      }
      if (line.qty <= 0 || !Number.isInteger(line.qty)) {
        throw new Error("Invalid quantity");
      }
      itemsTotal += item.price * line.qty;
      return {
        itemId: item.id,
        name: item.name,
        price: item.price,
        qty: line.qty,
        emoji: item.emoji,
      };
    });

    const rider = RIDERS[Math.floor(Math.random() * RIDERS.length)];
    const durationMs = restaurant.etaMin * 60 * 1000;

    const orderId = await ctx.db.insert("orders", {
      userId: args.userId,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      lines: pricedLines,
      itemsTotal,
      deliveryFee: restaurant.deliveryFee,
      total: itemsTotal + restaurant.deliveryFee,
      address: args.address,
      riderName: rider.name,
      riderInitials: rider.initials,
      riderRating: rider.rating,
      riderVehicle: rider.vehicle,
      createdAt: Date.now(),
      durationMs,
    });

    return { orderId };
  },
});

export const listKitchenOrders = query({
  args: { restaurantId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_restaurant", (q) => q.eq("restaurantId", args.restaurantId))
      .order("desc")
      .take(30);
  },
});

export const listOrders = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(20);
  },
});

export const getOrder = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.orderId);
  },
});
