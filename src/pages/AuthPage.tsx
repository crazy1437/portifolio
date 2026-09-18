import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Bike, ArrowRight, Flame, Timer } from "lucide-react";
import { getSession, signIn, useSession } from "../lib/store";

export default function AuthPage() {
  const session = useSession();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const returnTo = params.get("returnTo") || "/order";
  const decodedReturnTo = (() => {
    try {
      const decoded = decodeURIComponent(returnTo);
      return decoded.startsWith("/") ? decoded : "/order";
    } catch {
      return "/order";
    }
  })();

  if (session) {
    return <Navigate to={decodedReturnTo} replace />;
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Tell us your name so the rider knows who to feed.");
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      setError("That email looks undercooked — try again.");
      return;
    }
    signIn(name, email);
    navigate(decodedReturnTo, { replace: true });
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* form side */}
      <div className="relative flex items-center justify-center px-4 py-16 sm:px-8">
        <Link
          to="/"
          className="absolute left-5 top-5 z-10 inline-flex items-center gap-2 font-extrabold text-pulp-700 transition-colors hover:text-pepper-500"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl border-2 border-pulp-950 bg-pepper-500 text-cream-50 shadow-chunky-sm">
            <Bike className="h-4 w-4" strokeWidth={2.75} />
          </span>
          JuicyBruh
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="eyebrow bg-mango-300">
            <Flame className="h-3.5 w-3.5 text-pepper-500" /> 15 seconds to signup
          </div>
          <h1 className="mt-4 font-display text-4xl font-black leading-tight sm:text-5xl">
            Hungry? <span className="text-pepper-500">Let's ride.</span>
          </h1>
          <p className="mt-3 font-bold text-pulp-700">
            One tiny form stands between you and a perfectly tracked 3D delivery.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <div>
              <label htmlFor="name" className="text-sm font-black uppercase tracking-wider text-pulp-700">
                Your name
              </label>
              <input
                id="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError("");
                }}
                placeholder="Juicy McRider"
                className="mt-1.5 w-full rounded-2xl border-2 border-pulp-950 bg-white px-4 py-3 font-bold shadow-chunky-sm outline-none transition-shadow placeholder:text-pulp-700/40 focus:shadow-chunky"
              />
            </div>
            <div>
              <label htmlFor="email" className="text-sm font-black uppercase tracking-wider text-pulp-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder="you@hungry.app"
                className="mt-1.5 w-full rounded-2xl border-2 border-pulp-950 bg-white px-4 py-3 font-bold shadow-chunky-sm outline-none transition-shadow placeholder:text-pulp-700/40 focus:shadow-chunky"
              />
            </div>

            {error && (
              <motion.p
                initial={{ x: -8 }}
                animate={{ x: [0, -8, 8, -6, 6, 0] }}
                className="rounded-xl border-2 border-berry-500 bg-berry-400/10 px-4 py-2.5 text-sm font-bold text-berry-500"
              >
                {error}
              </motion.p>
            )}

            <button type="submit" className="btn-pepper btn-pepper-hover w-full text-lg">
              Start ordering <ArrowRight className="h-5 w-5" />
            </button>
            <p className="text-center text-xs font-bold text-pulp-700/70">
              Demo auth — nothing is sent anywhere, ever.
            </p>
          </form>
        </motion.div>
      </div>

      {/* juice side */}
      <div className="relative hidden overflow-hidden border-l-2 border-pulp-950 bg-gradient-to-br from-mango-300 via-pepper-400 to-pepper-600 lg:block">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute left-[10%] top-[15%] h-40 w-40 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-[10%] right-[15%] h-56 w-56 rounded-full bg-mango-300 blur-3xl" />
        </div>
        <motion.div
          animate={{ y: [0, -14, 0], rotate: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 4.5 }}
          className="absolute left-[12%] top-[20%] text-8xl drop-shadow-xl"
        >
          🍔
        </motion.div>
        <motion.div
          animate={{ y: [0, 12, 0], rotate: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 5.2 }}
          className="absolute bottom-[18%] left-[38%] text-7xl drop-shadow-xl"
        >
          🌮
        </motion.div>
        <motion.div
          animate={{ y: [0, -10, 0], rotate: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 4.1 }}
          className="absolute right-[14%] top-[38%] text-8xl drop-shadow-xl"
        >
          🛵
        </motion.div>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 3.6 }}
          className="absolute bottom-[35%] right-[32%] text-6xl drop-shadow-xl"
        >
          🍜
        </motion.div>

        <div className="absolute inset-0 flex flex-col items-center justify-center px-12 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="max-w-md font-display text-5xl font-black leading-tight text-cream-50 drop-shadow-md"
          >
            12,000+ humans fed.
            <br />
            <span className="text-mango-300">0 soggy fries.</span>
          </motion.h2>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="mt-8 flex gap-3"
          >
            <span className="flex items-center gap-2 rounded-2xl border-2 border-pulp-950 bg-cream-50 px-4 py-2 text-sm font-black shadow-chunky-sm">
              <Timer className="h-4 w-4 text-pepper-500" /> 15 min avg
            </span>
            <span className="flex items-center gap-2 rounded-2xl border-2 border-pulp-950 bg-cream-50 px-4 py-2 text-sm font-black shadow-chunky-sm">
              <Flame className="h-4 w-4 text-pepper-500" /> Cooked to order
            </span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
