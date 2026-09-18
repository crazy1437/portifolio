import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Flame,
  Minus,
  Plus,
  ShoppingBag,
  Star,
  Timer,
  Trash2,
  X,
  Check,
  MapPin,
  Repeat,
  Crown,
} from "lucide-react";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { money } from "../lib/data";
import { addItem, changeQty, clearCart, removeLine, useCart, useSession } from "../lib/store";
import { placeOrderArgs, useMenu, usePlaceOrder, useRestaurants } from "../lib/backend";
import { useToast } from "../components/Toaster";

export default function OrderPage() {
  const { restaurantId } = useParams();
  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {!restaurantId ? <KitchenGrid /> : <KitchenMenu restaurantId={restaurantId} />}
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}

/* ---------------- kitchen grid ---------------- */

function KitchenGrid() {
  const restaurants = useRestaurants();

  if (restaurants === undefined) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-72" />
        ))}
      </div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <div className="card-pop mx-auto max-w-md p-10 text-center">
        <div className="text-6xl">🍳</div>
        <h2 className="mt-4 font-display text-2xl font-black">Kitchens are warming up…</h2>
        <p className="mt-2 font-semibold text-pulp-700">
          The database is seeding. Give it a second and refresh.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="text-center">
        <div className="eyebrow bg-mango-300">Pick a kitchen</div>
        <h1 className="mt-3 font-display text-4xl font-black sm:text-5xl">
          What are we <span className="text-pepper-500">craving?</span>
        </h1>
      </div>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {restaurants.map((r, i) => (
          <motion.div
            key={r._id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.45 }}
          >
            <Link to={`/order/${r.id}`} className="card-pop card-pop-hover block h-full overflow-hidden">
              <div
                className="flex h-40 items-center justify-center border-b-2 border-pulp-950"
                style={{ background: `linear-gradient(135deg, ${r.accent}33, ${r.accent}66)` }}
              >
                <motion.span className="text-7xl" whileHover={{ scale: 1.15, rotate: -8 }}>
                  {r.emoji}
                </motion.span>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-display text-xl font-black">{r.name}</h2>
                  <span className="flex shrink-0 items-center gap-1 text-sm font-black">
                    <Star className="h-4 w-4 fill-mango-500 text-mango-500" /> {r.rating}
                  </span>
                </div>
                <p className="mt-1 text-sm font-bold text-pulp-700">{r.cuisine}</p>
                <div className="mt-4 flex items-center justify-between text-sm font-extrabold">
                  <span className="flex items-center gap-1.5">
                    <Timer className="h-4 w-4 text-pepper-500" /> {r.etaMin} min
                  </span>
                  <span className="rounded-lg bg-cream-200 px-2 py-1">
                    {r.deliveryFee === 0 ? "Free delivery" : money(r.deliveryFee)}
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </>
  );
}

/* ---------------- menu for one kitchen ---------------- */

type MenuFilter = "all" | "bestseller" | "veg" | "spicy" | "new";

function KitchenMenu({ restaurantId }: { restaurantId: string }) {
  const restaurants = useRestaurants();
  const menu = useMenu(restaurantId);
  const [filter, setFilter] = useState<MenuFilter>("all");
  const restaurant = restaurants?.find((r) => r.id === restaurantId);

  if (restaurant && menu) {
    return <MenuContent restaurant={restaurant} menu={menu} filter={filter} setFilter={setFilter} />;
  }

  if (restaurants !== undefined && !restaurant) {
    return (
      <div className="card-pop mx-auto max-w-md p-10 text-center">
        <div className="text-6xl">🤔</div>
        <h2 className="mt-4 font-display text-2xl font-black">Kitchen not found</h2>
        <p className="mt-2 font-semibold text-pulp-700">
          That kitchen isn't on the menu. Try one of ours.
        </p>
        <Link to="/order" className="btn-pepper btn-pepper-hover mt-6">
          Back to kitchens
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="skeleton h-64" />
      ))}
    </div>
  );
}

function MenuContent({
  restaurant,
  menu,
  filter,
  setFilter,
}: {
  restaurant: NonNullable<ReturnType<typeof useRestaurants>>[number];
  menu: NonNullable<ReturnType<typeof useMenu>>;
  filter: MenuFilter;
  setFilter: (f: MenuFilter) => void;
}) {
  const bestsellers = useMemo(() => menu.filter((m) => m.tags.includes("bestseller")), [menu]);
  const filtered = useMemo(
    () => (filter === "all" ? menu : menu.filter((m) => m.tags.includes(filter))),
    [menu, filter]
  );

  return (
    <>
      <Link
        to="/order"
        className="inline-flex items-center gap-2 font-extrabold text-pulp-700 transition-colors hover:text-pepper-500"
      >
        <ArrowLeft className="h-4 w-4" /> All kitchens
      </Link>

      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-pop mt-5 flex flex-wrap items-center gap-6 p-6 sm:p-8"
        style={{ background: `linear-gradient(120deg, ${restaurant.accent}22, #ffffff 55%)` }}
      >
        <motion.span
          className="text-7xl"
          animate={{ rotate: [0, -6, 6, 0] }}
          transition={{ repeat: Infinity, duration: 5 }}
        >
          {restaurant.emoji}
        </motion.span>
        <div className="min-w-52 flex-1">
          <h1 className="font-display text-3xl font-black sm:text-4xl">{restaurant.name}</h1>
          <p className="mt-1 font-bold text-pulp-700">{restaurant.cuisine}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-sm font-extrabold">
            <span className="flex items-center gap-1 rounded-lg border-2 border-pulp-950 bg-white px-2.5 py-1">
              <Star className="h-4 w-4 fill-mango-500 text-mango-500" /> {restaurant.rating}
            </span>
            <span className="flex items-center gap-1 rounded-lg border-2 border-pulp-950 bg-white px-2.5 py-1">
              <Timer className="h-4 w-4 text-pepper-500" /> {restaurant.etaMin} min
            </span>
            <span className="rounded-lg border-2 border-pulp-950 bg-white px-2.5 py-1">
              {restaurant.deliveryFee === 0 ? "Free delivery" : `${money(restaurant.deliveryFee)} delivery`}
            </span>
          </div>
        </div>
      </motion.header>

      {bestsellers.length > 0 && (
        <div className="no-scrollbar mt-6 flex gap-3 overflow-x-auto pb-1">
          {bestsellers.map((b) => (
            <div
              key={b._id}
              className="flex min-w-64 shrink-0 items-center gap-3 rounded-2xl border-2 border-pulp-950 bg-mango-300/40 p-3"
            >
              <span className="text-3xl">{b.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1 truncate text-sm font-black">
                  <Crown className="h-3.5 w-3.5 shrink-0 text-pepper-600" /> {b.name}
                </p>
                <p className="text-xs font-bold text-pulp-700">{money(b.price)}</p>
              </div>
              <button
                onClick={() => addItem(b)}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border-2 border-pulp-950 bg-white shadow-chunky-sm transition-all hover:-translate-y-0.5 hover:shadow-chunky active:translate-y-0 active:shadow-none"
                aria-label={`Add ${b.name}`}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="no-scrollbar mt-8 flex gap-2 overflow-x-auto pb-1">
        {(["all", "bestseller", "veg", "spicy", "new"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={`whitespace-nowrap rounded-2xl border-2 border-pulp-950 px-4 py-2 text-sm font-extrabold capitalize transition-all ${
              filter === f
                ? "bg-pulp-950 text-cream-50 shadow-chunky-sm"
                : "bg-white hover:-translate-y-0.5 hover:bg-cream-100"
            }`}
          >
            {f === "all" ? "Everything" : f === "veg" ? "Garden" : f}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((item) => (
            <MenuCard key={item._id} item={item} />
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}

function MenuCard({
  item,
}: {
  item: NonNullable<ReturnType<typeof useMenu>>[number];
}) {
  const toast = useToast();
  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94 }}
      transition={{ duration: 0.3 }}
      className="card-pop card-pop-hover flex flex-col p-6"
    >
      <div className="flex items-start justify-between">
        <motion.span
          className="text-5xl"
          whileHover={{ scale: 1.15, rotate: -8 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {item.emoji}
        </motion.span>
        <div className="flex flex-wrap justify-end gap-1.5">
          {item.tags.map((t) => (
            <span
              key={t}
              className={`rounded-full border-2 border-pulp-950 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                t === "bestseller"
                  ? "bg-mango-300"
                  : t === "spicy"
                    ? "bg-pepper-400 text-white"
                    : t === "veg"
                      ? "bg-guac-300"
                      : "bg-berry-400 text-white"
              }`}
            >
              {t}
            </span>
          ))}
        </div>
      </div>
      <h3 className="mt-4 font-display text-xl font-black leading-snug">{item.name}</h3>
      <p className="mt-1.5 flex-1 text-sm font-semibold text-pulp-700">{item.description}</p>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-pulp-700">
          <span className="flex items-center gap-1">
            <Flame className="h-3.5 w-3.5 text-pepper-500" /> juicy meter
          </span>
          <span>{item.juice}%</span>
        </div>
        <div className="mt-1.5 h-2.5 overflow-hidden rounded-full border-2 border-pulp-950 bg-cream-200">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${item.juice}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="h-full bg-gradient-to-r from-mango-400 to-pepper-500"
          />
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <span className="font-display text-2xl font-black">{money(item.price)}</span>
        <button
          onClick={() => {
            addItem(item);
            toast(`${item.emoji} ${item.name} added`, "success");
          }}
          className="btn-mango btn-mango-hover !px-4 !py-2 text-sm"
        >
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>
    </motion.article>
  );
}

/* ---------------- cart drawer ---------------- */

function CartDrawer() {
  const cart = useCart();
  const session = useSession();
  const placeOrder = usePlaceOrder();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [address, setAddress] = useState("420 Sizzle Heights, Apt 3B");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const count = cart.lines.reduce((n, l) => n + l.qty, 0);
  const itemsTotal = cart.lines.reduce((n, l) => n + l.price * l.qty, 0);
  const restaurants = useRestaurants();
  const restaurant = restaurants?.find((r) => r.id === cart.restaurantId);
  const deliveryFee = count > 0 ? (restaurant?.deliveryFee ?? 0) : 0;
  const freeDeliveryGap = restaurant && restaurant.deliveryFee > 0 ? Math.max(0, 25 - itemsTotal) : 0;

  // close on Escape + lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const submitOrder = async () => {
    if (!session || placing || count === 0) return;
    setPlacing(true);
    setError("");
    try {
      const { orderId } = await placeOrder(
        placeOrderArgs({
          userId: session.id,
          restaurantId: cart.restaurantId!,
          lines: cart.lines,
          address: address.trim() || "Picked up at the kitchen",
        })
      );
      clearCart();
      setOpen(false);
      setCheckingOut(false);
      toast("Order placed! Rider assigned 🛵", "success");
      navigate(`/track/${orderId}`);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Something burned in the kitchen. Try again.";
      setError(message);
      toast(message, "error");
      setPlacing(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {count > 0 && !open && (
          <motion.button
            initial={{ y: 90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 90, opacity: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-2xl border-2 border-pulp-950 bg-pepper-500 px-6 py-3.5 font-black text-cream-50 shadow-chunky-md transition-transform hover:-translate-y-0.5 hover:bg-pepper-600"
          >
            <ShoppingBag className="h-5 w-5" />
            {count} item{count > 1 ? "s" : ""} · {money(itemsTotal + deliveryFee)}
            <span className="rounded-xl bg-white/20 px-2 py-0.5 text-sm">View</span>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-pulp-950/40 backdrop-blur-[2px]"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              initial={{ x: "110%" }}
              animate={{ x: 0 }}
              exit={{ x: "110%" }}
              transition={{ type: "spring", damping: 26, stiffness: 260 }}
              role="dialog"
              aria-label="Your basket"
              className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l-2 border-pulp-950 bg-cream-50"
            >
              <div className="flex items-center justify-between border-b-2 border-pulp-950 p-5">
                <h2 className="font-display text-2xl font-black">
                  Your basket {count > 0 && <span className="text-pepper-500">({count})</span>}
                </h2>
                <button
                  onClick={() => setOpen(false)}
                  className="grid h-10 w-10 place-items-center rounded-xl border-2 border-pulp-950 bg-white shadow-chunky-sm active:translate-y-0.5 active:shadow-none"
                  aria-label="Close cart"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5">
                {count === 0 ? (
                  <div className="mt-16 text-center">
                    <motion.div
                      className="text-7xl"
                      animate={{ rotate: [0, 8, -8, 0] }}
                      transition={{ repeat: Infinity, duration: 3 }}
                    >
                      🛒
                    </motion.div>
                    <p className="mt-4 font-display text-xl font-black">Basket's feeling light</p>
                    <p className="mt-1 font-semibold text-pulp-700">Add something juicy to get rolling.</p>
                    <button onClick={() => setOpen(false)} className="btn-mango btn-mango-hover mt-6">
                      Browse the menu
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="mb-4 flex items-center gap-2 rounded-2xl border-2 border-pulp-950 bg-white px-3 py-2.5">
                      <MapPin className="h-4 w-4 shrink-0 text-pepper-500" />
                      <input
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full bg-transparent text-sm font-bold outline-none"
                        placeholder="Delivery address"
                        aria-label="Delivery address"
                      />
                    </div>
                    <ul className="space-y-3">
                      {cart.lines.map((l) => (
                        <motion.li
                          key={l.itemId}
                          layout
                          initial={{ opacity: 0, x: 30 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 30 }}
                          className="flex items-center gap-3 rounded-2xl border-2 border-pulp-950 bg-white p-3 shadow-chunky-sm"
                        >
                          <span className="text-3xl">{l.emoji}</span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-extrabold">{l.name}</p>
                            <p className="text-sm font-bold text-pulp-700">{money(l.price * l.qty)}</p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => changeQty(l.itemId, -1)}
                              className="grid h-8 w-8 place-items-center rounded-lg border-2 border-pulp-950 bg-cream-100 active:translate-y-0.5"
                              aria-label={`One less ${l.name}`}
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-6 text-center font-black">{l.qty}</span>
                            <button
                              onClick={() => changeQty(l.itemId, 1)}
                              className="grid h-8 w-8 place-items-center rounded-lg border-2 border-pulp-950 bg-cream-100 active:translate-y-0.5"
                              aria-label={`One more ${l.name}`}
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => removeLine(l.itemId)}
                              className="ml-1 grid h-8 w-8 place-items-center rounded-lg border-2 border-pulp-950 bg-white text-berry-500 active:translate-y-0.5"
                              aria-label={`Remove ${l.name}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </motion.li>
                      ))}
                    </ul>
                  </>
                )}
              </div>

              {count > 0 && (
                <div className="border-t-2 border-pulp-950 bg-cream-100 p-5">
                  <div className="space-y-1.5 text-sm font-extrabold">
                    <div className="flex justify-between">
                      <span>
                        {restaurant?.emoji} {restaurant?.name ?? "Kitchen"}
                      </span>
                      <span>
                        {count} item{count > 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Items</span>
                      <span>{money(itemsTotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery</span>
                      <span className={deliveryFee === 0 ? "text-guac-500" : ""}>
                        {deliveryFee === 0 ? "FREE" : money(deliveryFee)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t-2 border-dashed border-pulp-950/30 pt-2 text-base">
                      <span className="font-display text-lg font-black">Total</span>
                      <span className="font-display text-lg font-black">{money(itemsTotal + deliveryFee)}</span>
                    </div>
                  </div>

                  {freeDeliveryGap > 0 && (
                    <p className="mt-2 rounded-xl bg-zest-300/50 px-3 py-2 text-xs font-bold text-pulp-800">
                      Add {money(freeDeliveryGap)} more for free delivery 🛵
                    </p>
                  )}

                  {error && (
                    <p className="mt-3 rounded-xl border-2 border-berry-500 bg-berry-400/10 px-3 py-2 text-sm font-bold text-berry-500">
                      {error}
                    </p>
                  )}

                  {!checkingOut ? (
                    <button onClick={() => setCheckingOut(true)} className="btn-pepper btn-pepper-hover mt-4 w-full">
                      Checkout · {money(itemsTotal + deliveryFee)}
                    </button>
                  ) : (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <div className="mt-4 rounded-2xl border-2 border-pulp-950 bg-white p-3 text-sm font-bold">
                        Paying with <span className="text-pepper-500">JuicyBruh Mock Pay</span> — no card needed in
                        this demo.
                      </div>
                      <button
                        onClick={submitOrder}
                        disabled={placing}
                        className="btn-pepper btn-pepper-hover mt-3 w-full disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {placing ? (
                          <>
                            <motion.span
                              animate={{ rotate: 360 }}
                              transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                            >
                              <Timer className="h-5 w-5" />
                            </motion.span>
                            Firing up the kitchen…
                          </>
                        ) : (
                          <>
                            <Check className="h-5 w-5" /> Place order
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setCheckingOut(false)}
                        className="mt-2 w-full py-1 text-sm font-bold text-pulp-700 hover:text-pepper-500"
                      >
                        back
                      </button>
                    </motion.div>
                  )}

                  {cart.restaurantId && (
                    <button
                      onClick={() => {
                        clearCart();
                        toast("Basket cleared", "success");
                      }}
                      className="mt-3 flex w-full items-center justify-center gap-1.5 py-1 text-xs font-bold text-pulp-700/70 hover:text-berry-500"
                    >
                      <Repeat className="h-3 w-3" /> start over
                    </button>
                  )}
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
