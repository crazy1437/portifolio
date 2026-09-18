import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  Copy,
  MapPin,
  PartyPopper,
  Star,
  Timer,
  History,
} from "lucide-react";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { ORDER_FLOW, STATUS_META, fmtEta, money } from "../lib/data";
import { useSession } from "../lib/store";
import { toUiOrder, useMyOrders, useRestaurants } from "../lib/backend";
import { useToast } from "../components/Toaster";
import type { Id } from "../convex/_generated/dataModel";

const TrackingScene = lazy(() => import("../three/TrackingScene"));

export default function TrackPage() {
  const { orderId } = useParams();
  const session = useSession();
  const orders = useMyOrders(session?.id);
  const navigate = useNavigate();

  if (orders === undefined) {
    return (
      <div className="min-h-screen">
        <Nav />
        <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="skeleton h-96" />
        </main>
        <Footer />
      </div>
    );
  }

  const order = (orderId ? orders.find((o) => o._id === orderId) : undefined) ?? orders[0];

  if (!order) {
    return (
      <div className="min-h-screen">
        <Nav />
        <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 text-center">
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 2.5 }} className="text-8xl">
            🛵
          </motion.div>
          <h1 className="mt-6 font-display text-4xl font-black">No orders in flight</h1>
          <p className="mt-3 max-w-sm font-bold text-pulp-700">
            Once you place an order, your rider appears here — in glorious 3D.
          </p>
          <Link to="/order" className="btn-pepper btn-pepper-hover mt-8">
            Order something juicy
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return <TrackLive key={order._id} orderId={order._id as Id<"orders">} orders={orders} onPick={(id) => navigate(`/track/${id}`)} />;
}

function TrackLive({
  orderId,
  orders,
  onPick,
}: {
  orderId: Id<"orders">;
  orders: NonNullable<ReturnType<typeof useMyOrders>>;
  onPick: (id: string) => void;
}) {
  const restaurants = useRestaurants();
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const [, setTick] = useState(0);

  // re-render every second so ETA + 3D progress stay live
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const order = orders.find((o) => o._id === orderId);
  // recomputed on every tick — this is what keeps the scooter moving
  const ui = order ? toUiOrder(order, Date.now()) : null;

  const pieces = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 0.8,
        duration: 2.4 + Math.random() * 2,
        emoji: ["🎉", "🍔", "🌮", "🍜", "🍣", "🥤", "🍟"][i % 7],
        size: 18 + Math.random() * 22,
      })),
    []
  );

  if (!ui) {
    return (
      <div className="min-h-screen">
        <Nav />
        <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="skeleton h-96" />
        </main>
        <Footer />
      </div>
    );
  }

  const accent = restaurants?.find((r) => r.id === ui.restaurantId)?.accent ?? "#ff5c1f";
  const delivered = ui.status === "delivered";
  const statusIdx = ORDER_FLOW.indexOf(ui.status);

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(ui.id);
      setCopied(true);
      toast("Order ID copied", "success");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast("Couldn't copy — select it manually", "error");
    }
  };

  return (
    <div className="min-h-screen">
      <Nav />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Link
          to="/order"
          className="inline-flex items-center gap-2 font-extrabold text-pulp-700 transition-colors hover:text-pepper-500"
        >
          <ArrowLeft className="h-4 w-4" /> Order more
        </Link>

        <div className="mt-4 grid gap-6 lg:grid-cols-5">
          {/* 3D map */}
          <section className="card-pop relative order-2 h-[420px] overflow-hidden lg:order-1 lg:col-span-3">
            <div className="absolute inset-0 bg-gradient-to-br from-zest-300/50 via-cream-100 to-mango-300/40" />
            <Suspense fallback={null}>
              <TrackingScene progress={ui.progress} accent={accent} />
            </Suspense>
            <div className="pointer-events-none absolute inset-x-4 top-4 flex items-start justify-between gap-2">
              <div className="rounded-2xl border-2 border-pulp-950 bg-white/90 px-4 py-2 shadow-chunky-sm backdrop-blur">
                <p className="text-xs font-black uppercase tracking-widest text-pulp-700">
                  {delivered ? "Delivered" : "ETA"}
                </p>
                <p className="font-display text-2xl font-black">
                  {delivered ? "🎉 Enjoy!" : fmtEta(ui.remainingMs)}
                </p>
              </div>
              <div className="rounded-2xl border-2 border-pulp-950 bg-white/90 px-4 py-2 text-right shadow-chunky-sm backdrop-blur">
                <p className="text-xs font-black uppercase tracking-widest text-pulp-700">Kitchen</p>
                <p className="font-display text-lg font-black">{ui.restaurantName}</p>
              </div>
            </div>
            <div className="pointer-events-none absolute inset-x-4 bottom-4 rounded-2xl border-2 border-pulp-950 bg-white/90 px-4 py-3 shadow-chunky-sm backdrop-blur">
              <div className="flex items-center justify-between gap-2 text-sm font-extrabold">
                <span className="flex min-w-0 items-center gap-2">
                  <MapPin className="h-4 w-4 shrink-0 text-pepper-500" />
                  <span className="truncate">{ui.address}</span>
                </span>
                <span className="shrink-0">{Math.round(ui.progress * 100)}% there</span>
              </div>
              <div className="mt-2 h-3 overflow-hidden rounded-full border-2 border-pulp-950 bg-cream-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-mango-400 to-pepper-500 transition-[width] duration-1000 ease-linear"
                  style={{ width: `${ui.progress * 100}%` }}
                />
              </div>
            </div>
          </section>

          {/* side panel */}
          <section className="order-1 space-y-5 lg:order-2 lg:col-span-2">
            <div className="card-pop p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-pulp-700">
                    {STATUS_META[ui.status].blurb}
                  </p>
                  <h1 className="mt-1 font-display text-3xl font-black">
                    {STATUS_META[ui.status].emoji} {STATUS_META[ui.status].label}
                  </h1>
                </div>
                <motion.span
                  className="text-5xl"
                  animate={delivered ? { scale: [1, 1.25, 1], rotate: [0, 10, -10, 0] } : {}}
                  transition={{ repeat: delivered ? Infinity : 0, duration: 1.6 }}
                >
                  {STATUS_META[ui.status].emoji}
                </motion.span>
              </div>

              <button
                onClick={copyId}
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg border-2 border-pulp-950/15 bg-cream-100 px-2.5 py-1 font-mono text-xs font-bold text-pulp-700 transition-colors hover:border-pulp-950/40 hover:text-pulp-950"
                title="Copy order ID"
              >
                {ui.id}
                {copied ? <Check className="h-3.5 w-3.5 text-guac-500" /> : <Copy className="h-3.5 w-3.5" />}
              </button>

              <div className="mt-5 space-y-3">
                {ORDER_FLOW.map((s, i) => {
                  const done = i < statusIdx;
                  const current = i === statusIdx;
                  return (
                    <div key={s} className="flex items-center gap-3">
                      <span
                        className={`relative grid h-10 w-10 shrink-0 place-items-center rounded-xl border-2 border-pulp-950 text-lg ${
                          done ? "bg-guac-400" : current ? "bg-mango-300" : "bg-white"
                        }`}
                      >
                        {done ? "✓" : STATUS_META[s].emoji}
                        {current && !delivered && (
                          <span className="absolute inset-0 animate-pulse-ring rounded-xl border-2 border-pepper-500" />
                        )}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className={`font-extrabold ${current ? "text-pepper-500" : done ? "text-pulp-950" : "text-pulp-700/60"}`}>
                          {STATUS_META[s].label}
                        </p>
                        <p className="text-xs font-bold text-pulp-700/70">{STATUS_META[s].blurb}</p>
                      </div>
                      {current && (
                        <motion.span
                          animate={{ opacity: [1, 0.4, 1] }}
                          transition={{ repeat: Infinity, duration: 1.2 }}
                          className="shrink-0 rounded-lg bg-pepper-500 px-2 py-0.5 text-xs font-black text-cream-50"
                        >
                          NOW
                        </motion.span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="card-pop p-6">
              <h2 className="font-display text-xl font-black">Your rider</h2>
              <div className="mt-4 flex items-center gap-4">
                <motion.div
                  animate={{ rotate: [0, -4, 4, 0] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border-2 border-pulp-950 font-display text-2xl font-black text-cream-50 shadow-chunky-sm"
                  style={{ background: accent }}
                >
                  {ui.riderInitials}
                </motion.div>
                <div className="min-w-0 flex-1">
                  <p className="font-black">{ui.riderName}</p>
                  <p className="flex items-center gap-1 text-sm font-bold text-pulp-700">
                    <Star className="h-3.5 w-3.5 shrink-0 fill-mango-500 text-mango-500" /> {ui.riderRating} ·{" "}
                    {ui.riderVehicle}
                  </p>
                </div>
                <span className="shrink-0 rounded-xl border-2 border-pulp-950 bg-mango-300 px-3 py-1.5 text-xs font-black uppercase tracking-wider">
                  {ui.riderVehicle === "scooter" ? "🛵 Pro" : "🚲 Pro"}
                </span>
              </div>
            </div>

            <div className="card-pop p-6">
              <h2 className="font-display text-xl font-black">Order summary</h2>
              <ul className="mt-3 space-y-2 text-sm font-bold">
                {ui.lines.map((l) => (
                  <li key={l.itemId} className="flex items-center justify-between gap-2">
                    <span className="min-w-0">
                      {l.emoji} {l.qty}× {l.name}
                    </span>
                    <span className="shrink-0">{money(l.price * l.qty)}</span>
                  </li>
                ))}
                <li className="flex items-center justify-between text-pulp-700">
                  <span>Delivery</span>
                  <span>{ui.deliveryFee === 0 ? "FREE" : money(ui.deliveryFee)}</span>
                </li>
                <li className="flex items-center justify-between border-t-2 border-dashed border-pulp-950/30 pt-2 font-display text-base font-black">
                  <span>Total</span>
                  <span>{money(ui.total)}</span>
                </li>
              </ul>
              <div className="mt-4 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-pulp-700">
                <Timer className="h-3.5 w-3.5" /> placed{" "}
                {new Date(ui.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>

            {/* order history from Convex */}
            {orders.length > 1 && (
              <div className="card-pop p-6">
                <h2 className="flex items-center gap-2 font-display text-xl font-black">
                  <History className="h-5 w-5 text-pepper-500" /> Order history
                </h2>
                <ul className="mt-3 space-y-2">
                  {orders.map((o) => {
                    const oui = toUiOrder(o, Date.now());
                    const active = o._id === orderId;
                    return (
                      <li key={o._id}>
                        <button
                          onClick={() => onPick(o._id)}
                          className={`flex w-full items-center justify-between gap-2 rounded-2xl border-2 px-3 py-2.5 text-left text-sm font-bold transition-all ${
                            active
                              ? "border-pulp-950 bg-mango-300/50"
                              : "border-pulp-950/15 bg-white hover:-translate-y-0.5 hover:border-pulp-950/40"
                          }`}
                        >
                          <span className="min-w-0 truncate">
                            {STATUS_META[oui.status].emoji} {o.restaurantName}
                          </span>
                          <span className="flex shrink-0 items-center gap-2 text-xs text-pulp-700">
                            {money(o.total)}
                            <span className="rounded-md bg-cream-200 px-1.5 py-0.5 font-black uppercase tracking-wider">
                              {oui.status}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
      <Confetti show={delivered} pieces={pieces} />
    </div>
  );
}

function Confetti({
  show,
  pieces,
}: {
  show: boolean;
  pieces: { id: number; x: number; delay: number; duration: number; emoji: string; size: number }[];
}) {
  return (
    <AnimatePresence>
      {show && (
        <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
          {pieces.map((p) => (
            <motion.span
              key={p.id}
              initial={{ y: -60, opacity: 1, rotate: 0 }}
              animate={{ y: "110vh", rotate: 360 }}
              exit={{ opacity: 0 }}
              transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "linear" }}
              style={{ left: `${p.x}%`, fontSize: p.size }}
              className="absolute top-0"
            >
              {p.emoji}
            </motion.span>
          ))}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute inset-x-4 top-24 mx-auto w-fit rounded-2xl border-2 border-pulp-950 bg-mango-300 px-6 py-3 font-display text-2xl font-black shadow-chunky-md"
          >
            <span className="flex items-center gap-2">
              <PartyPopper className="h-6 w-6" /> Delivered. Go get it!
            </span>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
