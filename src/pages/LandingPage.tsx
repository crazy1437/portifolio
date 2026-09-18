import { Suspense, lazy } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Flame,
  Timer,
  Sparkles,
  MapPin,
  Star,
  Leaf,
  Zap,
  BadgeCheck,
  Truck,
} from "lucide-react";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import { money } from "../lib/data";
import { FALLBACK_RESTAURANTS, useBestsellers, useRestaurants } from "../lib/backend";

const HeroScene = lazy(() => import("../three/HeroScene"));

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
};

const MARQUEE_ITEMS = [
  "🛵 15-min average",
  "🍔 Smash burgers",
  "🍜 18-hour broth",
  "🌮 Street tacos",
  "🍣 Poke bowls",
  "🧊 Ice-cold shakes",
  "🔥 Cooked to order",
  "💚 Zero-fee zones",
];

const FALLBACK_MENUS = [
  {
    id: "bb-1",
    restaurantId: "big-bun",
    name: "Double Smash Supreme",
    description: "Two seared patties, molten cheddar, pickles, secret sauce.",
    price: 11.9,
    emoji: "🍔",
    juice: 97,
  },
  {
    id: "nn-1",
    restaurantId: "noodle-nirvana",
    name: "Midnight Miso Ramen",
    description: "18-hour broth, chashu, soft egg, black garlic oil.",
    price: 14.5,
    emoji: "🍜",
    juice: 98,
  },
  {
    id: "tt-1",
    restaurantId: "taco-turbo",
    name: "Al Pastor Trio",
    description: "Trompo pork, pineapple, onion, cilantro.",
    price: 10.9,
    emoji: "🌮",
    juice: 96,
  },
  {
    id: "pp-1",
    restaurantId: "poke-pop",
    name: "Salmon Sunrise Bowl",
    description: "Sashimi salmon, mango, edamame, yuzu dressing.",
    price: 13.5,
    emoji: "🍣",
    juice: 94,
  },
];

export default function LandingPage() {
  const dbRestaurants = useRestaurants();
  const dbBestsellers = useBestsellers();
  const kitchens = dbRestaurants && dbRestaurants.length > 0 ? dbRestaurants : FALLBACK_RESTAURANTS;
  const bestsellers = dbBestsellers && dbBestsellers.length > 0 ? dbBestsellers : FALLBACK_MENUS;

  return (
    <div className="overflow-x-clip">
      <Nav />

      {/* ============ HERO ============ */}
      <section className="relative min-h-[92vh] overflow-hidden border-b-2 border-pulp-950 bg-gradient-to-b from-mango-300 via-cream-100 to-cream-50">
        <Suspense fallback={null}>
          <HeroScene />
        </Suspense>

        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(253,251,245,0.9)_100%)]" />
        </div>

        <div className="pointer-events-none relative z-10 mx-auto flex min-h-[92vh] max-w-7xl flex-col items-center justify-center px-4 pb-20 pt-24 text-center sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="eyebrow bg-white/80 backdrop-blur"
          >
            <Flame className="h-3.5 w-3.5 text-pepper-500" /> Hot rides, juicier food
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.08 }}
            className="mt-6 font-display text-[13vw] font-black leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl"
          >
            Hungry?
            <br />
            <span className="relative inline-block text-pepper-500">
              Watch it ride.
              <svg
                className="absolute -bottom-3 left-0 w-full"
                viewBox="0 0 300 14"
                fill="none"
                preserveAspectRatio="none"
              >
                <motion.path
                  d="M4 10 C 60 2, 150 2, 296 8"
                  stroke="#241a12"
                  strokeWidth="6"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.7, delay: 0.7 }}
                />
              </svg>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-7 max-w-xl text-lg font-bold text-pulp-800 sm:text-xl"
          >
            JuicyBruh sends real scooters through a real (tiny 3D) city to bring you
            smash burgers, midnight ramen and street tacos in minutes.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.32 }}
            className="pointer-events-auto mt-9 flex flex-wrap items-center justify-center gap-4"
          >
            <Link to="/order" className="btn-pepper btn-pepper-hover text-lg">
              Start an order <ArrowRight className="h-5 w-5" />
            </Link>
            <a href="#how" className="btn-cream btn-cream-hover text-lg">
              See how it works
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="pointer-events-auto mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-extrabold text-pulp-800"
          >
            <span className="flex items-center gap-2">
              <Star className="h-4 w-4 fill-mango-500 text-mango-500" /> 4.9 from 12k riders
            </span>
            <span className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-pepper-500" /> 15 min average
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-guac-500" /> 40+ neighborhoods
            </span>
          </motion.div>
        </div>

        <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.6 }}
            className="rounded-full border-2 border-pulp-950 bg-white px-4 py-1.5 text-xs font-black uppercase tracking-widest shadow-chunky-sm"
          >
            Scroll for juice ↓
          </motion.div>
        </div>
      </section>

      {/* ============ MARQUEE ============ */}
      <section className="border-b-2 border-pulp-950 bg-pulp-950 py-4">
        <div className="flex overflow-hidden">
          <div className="flex shrink-0 animate-marquee items-center gap-10 pr-10">
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
              <span key={i} className="whitespace-nowrap font-display text-xl font-black text-cream-100">
                {item} <span className="ml-8 text-pepper-500">•</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section className="section-pad mx-auto max-w-7xl py-20 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <motion.div {...fadeUp} className="eyebrow bg-mango-300">
            <Sparkles className="h-3.5 w-3.5" /> Why JuicyBruh
          </motion.div>
          <motion.h2 {...fadeUp} className="mt-4 font-display text-4xl font-black sm:text-5xl">
            Built different. <span className="text-pepper-500">Built juicy.</span>
          </motion.h2>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Timer,
              color: "bg-pepper-500",
              title: "15 minutes, flat",
              body: "Scooters are pre-positioned by hungry-hour predictions. Your food leaves the kitchen before you finish paying.",
            },
            {
              icon: Flame,
              color: "bg-mango-400",
              title: "Fresh off the flame",
              body: "Nothing sits under a lamp. Kitchens start cooking when the rider is 4 minutes out, not 40.",
            },
            {
              icon: MapPin,
              color: "bg-guac-500",
              title: "Watch every turn",
              body: "A live 3D map follows your rider street by street, with honest ETAs that update in real time.",
            },
          ].map((f, i) => (
            <motion.div key={i} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.08 }}>
              <div className="card-pop card-pop-hover group h-full p-7">
                <div className={`inline-grid h-14 w-14 place-items-center rounded-2xl border-2 border-pulp-950 text-cream-50 shadow-chunky-sm ${f.color}`}>
                  <f.icon className="h-7 w-7" strokeWidth={2.5} />
                </div>
                <h3 className="mt-5 font-display text-2xl font-black">{f.title}</h3>
                <p className="mt-2 font-semibold text-pulp-700">{f.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section id="how" className="border-y-2 border-pulp-950 bg-cream-100 py-20 sm:py-28">
        <div className="section-pad mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <motion.div {...fadeUp} className="eyebrow bg-zest-300">
                <Zap className="h-3.5 w-3.5" /> How it works
              </motion.div>
              <motion.h2 {...fadeUp} className="mt-4 font-display text-4xl font-black sm:text-5xl">
                From tap to table in <span className="text-pepper-500">three sprints</span>
              </motion.h2>
              <ol className="mt-10 space-y-6">
                {[
                  { n: "01", title: "Pick your juicy poison", body: "Smash burgers, poke bowls, midnight ramen or street tacos — all cooking right now." },
                  { n: "02", title: "Pay in one tap", body: "No accounts-within-accounts. Tap, done, rider assigned before your phone locks." },
                  { n: "03", title: "Watch the 3D city", body: "Follow your scooter in live 3D. Door knock right when the Animation says it will." },
                ].map((s, i) => (
                  <motion.li key={i} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.08 }} className="flex gap-5">
                    <span className="font-display text-4xl font-black text-pepper-500 text-outline">{s.n}</span>
                    <div>
                      <h3 className="font-display text-xl font-black">{s.title}</h3>
                      <p className="mt-1 font-semibold text-pulp-700">{s.body}</p>
                    </div>
                  </motion.li>
                ))}
              </ol>
              <motion.div {...fadeUp} className="mt-10">
                <Link to="/order" className="btn-pepper btn-pepper-hover">
                  I'm in — feed me <ArrowRight className="h-5 w-5" />
                </Link>
              </motion.div>
            </div>

            <motion.div {...fadeUp} className="relative">
              <div className="card-pop relative overflow-hidden p-8">
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-mango-300/60 blur-2xl" />
                <div className="relative space-y-4">
                  {[
                    { emoji: "🧾", label: "Order placed", time: "0:00", done: true },
                    { emoji: "🍳", label: "Kitchen fired up", time: "0:45", done: true },
                    { emoji: "🛍️", label: "Bag sealed", time: "6:12", done: true },
                    { emoji: "🛵", label: "Rider flying", time: "9:30", done: false },
                    { emoji: "🎉", label: "At your door", time: "14:58", done: false },
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl border-2 border-pulp-950 text-xl shadow-chunky-sm ${step.done ? "bg-zest-400" : "bg-white"}`}>
                        {step.emoji}
                      </span>
                      <div className="flex-1">
                        <div className="flex justify-between font-extrabold">
                          <span>{step.label}</span>
                          <span className="text-pulp-700">{step.time}</span>
                        </div>
                        <div className="mt-1.5 h-2.5 overflow-hidden rounded-full border-2 border-pulp-950 bg-cream-200">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: step.done ? "100%" : "35%" }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.9, delay: 0.2 + i * 0.12 }}
                            className={`h-full ${step.done ? "bg-guac-400" : "bg-pepper-500"}`}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 rounded-2xl border-2 border-dashed border-pulp-950/40 bg-cream-50 p-4 text-center text-sm font-bold text-pulp-700">
                  Your rider: <span className="text-pepper-500">Nia</span> · 4.98★ · “Traffic? Never heard of it.”
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============ KITCHENS ============ */}
      <section id="kitchens" className="section-pad mx-auto max-w-7xl py-20 sm:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <motion.div {...fadeUp} className="eyebrow bg-berry-400 text-white">
              <BadgeCheck className="h-3.5 w-3.5" /> The kitchens
            </motion.div>
            <motion.h2 {...fadeUp} className="mt-4 font-display text-4xl font-black sm:text-5xl">
              Four kitchens, <span className="text-pepper-500">zero filler</span>
            </motion.h2>
          </div>
          <motion.div {...fadeUp}>
            <Link to="/order" className="btn-mango btn-mango-hover">
              See full menus <ArrowRight className="h-5 w-5" />
            </Link>
          </motion.div>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {kitchens.map((r, i) => (
            <motion.div key={r.id} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.07 }}>
              <Link
                to={`/order/${r.id}`}
                className="card-pop card-pop-hover block h-full overflow-hidden"
              >
                <div
                  className="relative flex h-36 items-center justify-center border-b-2 border-pulp-950"
                  style={{ background: `linear-gradient(135deg, ${r.accent}33, ${r.accent}66)` }}
                >
                  <motion.span
                    className="text-6xl drop-shadow-lg"
                    whileHover={{ scale: 1.15, rotate: -6 }}
                  >
                    {r.emoji}
                  </motion.span>
                  <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full border-2 border-pulp-950 bg-white px-2.5 py-0.5 text-xs font-black">
                    <Star className="h-3 w-3 fill-mango-500 text-mango-500" /> {r.rating}
                  </span>
                  {r.deliveryFee === 0 && (
                    <span className="absolute right-3 top-3 rounded-full border-2 border-pulp-950 bg-zest-400 px-2.5 py-0.5 text-xs font-black">
                      Free delivery
                    </span>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-display text-xl font-black">{r.name}</h3>
                  <p className="mt-1 text-sm font-bold text-pulp-700">{r.cuisine}</p>
                  <div className="mt-4 flex items-center justify-between text-sm font-extrabold">
                    <span className="flex items-center gap-1.5">
                      <Timer className="h-4 w-4 text-pepper-500" /> {r.etaMin} min
                    </span>
                    <span className="rounded-lg bg-cream-200 px-2 py-1">
                      {r.deliveryFee === 0 ? "Free" : money(r.deliveryFee)}
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============ JUICY STATS / QUOTES ============ */}
      <section id="juicy" className="border-y-2 border-pulp-950 bg-pepper-500 py-20 text-cream-50 sm:py-28">
        <div className="section-pad mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <motion.h2 {...fadeUp} className="font-display text-4xl font-black sm:text-5xl">
                12,000+ humans fed. <br />
                <span className="text-mango-300">0 soggy fries.</span>
              </motion.h2>
              <motion.p {...fadeUp} className="mt-5 max-w-md text-lg font-bold text-cream-100/90">
                We obsess over the last four minutes, because that's where juice goes to die.
                Insulated boxes, suspension-tuned routes, and riders who treat every taco like a trophy.
              </motion.p>
              <motion.div {...fadeUp} className="mt-8 grid grid-cols-3 gap-4">
                {[
                  { k: "4.9★", v: "Rider rating" },
                  { k: "98.2%", v: "On-time rides" },
                  { k: "15 min", v: "Median delivery" },
                ].map((s, i) => (
                  <div key={i} className="rounded-2xl border-2 border-pulp-950 bg-pepper-600 p-4 text-center shadow-chunky-sm">
                    <div className="font-display text-2xl font-black text-mango-300">{s.k}</div>
                    <div className="mt-1 text-xs font-extrabold uppercase tracking-wider">{s.v}</div>
                  </div>
                ))}
              </motion.div>
            </div>
            <div className="space-y-5">
              {[
                { q: "The 3D tracker is genuinely addictive. I cheer for my scooter.", a: "Maya T.", e: "🛵" },
                { q: "Burger arrived still crackling. I don't understand the physics.", a: "Dev K.", e: "🍔" },
                { q: "Ordered ramen in a storm. Broth arrived angry and perfect.", a: "Lena R.", e: "🍜" },
              ].map((t, i) => (
                <motion.blockquote key={i} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.08 }}>
                  <div className="card-pop bg-cream-50 !text-pulp-950 p-6">
                    <div className="flex items-start gap-4">
                      <span className="text-3xl">{t.e}</span>
                      <div>
                        <p className="font-bold">“{t.q}”</p>
                        <footer className="mt-2 text-sm font-extrabold text-pepper-500">— {t.a}</footer>
                      </div>
                    </div>
                  </div>
                </motion.blockquote>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ MENU TEASER ============ */}
      <section className="section-pad mx-auto max-w-7xl py-20 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <motion.div {...fadeUp} className="eyebrow bg-guac-300">
            <Leaf className="h-3.5 w-3.5" /> Today's juiciest
          </motion.div>
          <motion.h2 {...fadeUp} className="mt-4 font-display text-4xl font-black sm:text-5xl">
            Straight from the pass
          </motion.h2>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {bestsellers.map((m, i) => (
            <motion.div key={m.id} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.06 }}>
              <Link
                to={`/order/${m.restaurantId}`}
                className="card-pop card-pop-hover group flex h-full flex-col p-6"
              >
                <span className="text-5xl transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-6">{m.emoji}</span>
                <h3 className="mt-4 font-display text-xl font-black leading-snug">{m.name}</h3>
                <p className="mt-2 flex-1 text-sm font-semibold text-pulp-700">{m.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-display text-2xl font-black">{money(m.price)}</span>
                  <span className="flex items-center gap-1.5 rounded-full bg-mango-300/50 px-2.5 py-1 text-xs font-black uppercase tracking-wider">
                    <Flame className="h-3.5 w-3.5 text-pepper-500" /> {m.juice}% juicy
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="section-pad mx-auto max-w-7xl pb-24">
        <motion.div {...fadeUp}>
          <div className="relative overflow-hidden rounded-[2.5rem] border-2 border-pulp-950 bg-mango-300 p-10 text-center shadow-chunky-md sm:p-16">
            <motion.div
              className="absolute -left-8 -top-8 text-8xl opacity-30"
              animate={{ rotate: [0, 12, 0] }}
              transition={{ repeat: Infinity, duration: 5 }}
            >
              🍔
            </motion.div>
            <motion.div
              className="absolute -bottom-6 -right-4 text-8xl opacity-30"
              animate={{ rotate: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 6 }}
            >
              🌮
            </motion.div>
            <Truck className="mx-auto h-10 w-10" />
            <h2 className="mx-auto mt-4 max-w-2xl font-display text-4xl font-black leading-tight sm:text-6xl">
              Your next meal is <span className="text-pepper-500">15 minutes</span> away
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-lg font-bold text-pulp-800">
              Sign in, tap once, and watch a tiny scooter make a tiny dream come true.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link to="/auth?returnTo=/order" className="btn-pepper btn-pepper-hover text-lg">
                Get feeding <ArrowRight className="h-5 w-5" />
              </Link>
              <Link to="/order" className="btn-cream btn-cream-hover text-lg">
                Browse kitchens
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
