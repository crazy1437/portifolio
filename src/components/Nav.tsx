import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingCart, Menu as MenuIcon, X, Bike, ChevronDown, LogOut, Package } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useCart, useSession, signOut } from "../lib/store";

export default function Nav() {
  const cart = useCart();
  const session = useSession();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const count = cart.lines.reduce((n, l) => n + l.qty, 0);
  const prevCount = useRef(count);

  // bounce the cart bubble when items land in it
  useEffect(() => {
    prevCount.current = count;
  }, [count]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // close overlays on navigation
  useEffect(() => {
    setOpen(false);
    setMenuOpen(false);
  }, [location.pathname, location.search]);

  return (
    <header className="sticky top-0 z-50 border-b-2 border-pulp-950 bg-cream-50/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="group flex items-center gap-2" aria-label="MenuMoto home">
          <span className="grid h-10 w-10 place-items-center rounded-2xl border-2 border-pulp-950 bg-pepper-500 text-cream-50 shadow-chunky-sm transition-transform group-hover:animate-wobble">
            <Bike className="h-5 w-5" strokeWidth={2.75} />
          </span>
          <span className="font-display text-2xl font-black tracking-tight">
            Menu<span className="text-pepper-500">Moto</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {[
            { to: "/#how", label: "How it works" },
            { to: "/#kitchens", label: "Kitchens" },
            { to: "/#juicy", label: "Why juicy" },
          ].map((l) => (
            <a key={l.to} href={l.to} className="group relative rounded-xl px-4 py-2 font-bold hover:bg-cream-200">
              {l.label}
              <span className="absolute inset-x-3 bottom-1 h-0.5 origin-left scale-x-0 rounded-full bg-pepper-500 transition-transform group-hover:scale-x-100" />
            </a>
          ))}
          <Link to="/order" className="group relative rounded-xl px-4 py-2 font-bold hover:bg-cream-200">
            Order now
            <span className="absolute inset-x-3 bottom-1 h-0.5 origin-left scale-x-0 rounded-full bg-pepper-500 transition-transform group-hover:scale-x-100" />
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {session ? (
            <div className="relative hidden md:block" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-1.5 rounded-xl border-2 border-pulp-950 bg-white px-3 py-2 font-extrabold shadow-chunky-sm transition-all hover:-translate-y-0.5 hover:shadow-chunky active:translate-y-0 active:shadow-none"
              >
                <span className="grid h-6 w-6 place-items-center rounded-lg bg-pepper-500 text-xs font-black text-cream-50">
                  {session.initials}
                </span>
                {session.name.split(" ")[0]}
                <ChevronDown className={`h-4 w-4 transition-transform ${menuOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-52 overflow-hidden rounded-2xl border-2 border-pulp-950 bg-white shadow-chunky-md"
                  >
                    <div className="border-b border-pulp-950/10 px-4 py-2.5">
                      <p className="truncate text-xs font-bold text-pulp-700">{session.email}</p>
                    </div>
                    <Link
                      to="/track"
                      className="flex items-center gap-2 px-4 py-2.5 font-bold hover:bg-cream-100"
                    >
                      <Package className="h-4 w-4" /> Orders & tracking
                    </Link>
                    <button
                      onClick={() => {
                        signOut();
                        navigate("/");
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-left font-bold text-berry-500 hover:bg-cream-100"
                    >
                      <LogOut className="h-4 w-4" /> Sign out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link to="/auth?returnTo=/order" className="btn-pepper btn-pepper-hover hidden !px-5 !py-2 text-sm md:inline-flex">
              Sign in
            </Link>
          )}

          <Link
            to="/order"
            aria-label={`Cart, ${count} items`}
            className="relative grid h-11 w-11 place-items-center rounded-2xl border-2 border-pulp-950 bg-white shadow-chunky-sm transition-transform hover:-translate-y-0.5"
          >
            <ShoppingCart className="h-5 w-5" strokeWidth={2.5} />
            <AnimatePresence>
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.25, 1] }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 0.35 }}
                  className="absolute -right-1.5 -top-1.5 grid h-6 min-w-6 place-items-center rounded-full border-2 border-pulp-950 bg-berry-400 px-1 text-xs font-black text-white"
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          <button
            className="grid h-11 w-11 place-items-center rounded-2xl border-2 border-pulp-950 bg-white shadow-chunky-sm md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t-2 border-pulp-950 bg-cream-100 md:hidden"
          >
            <div className="flex flex-col gap-1 p-4">
              <a href="/#how" onClick={() => setOpen(false)} className="rounded-xl px-3 py-2.5 font-bold hover:bg-cream-200">
                How it works
              </a>
              <a href="/#kitchens" onClick={() => setOpen(false)} className="rounded-xl px-3 py-2.5 font-bold hover:bg-cream-200">
                Kitchens
              </a>
              <Link to="/order" onClick={() => setOpen(false)} className="rounded-xl px-3 py-2.5 font-bold hover:bg-cream-200">
                Order now
              </Link>
              <Link to="/track" onClick={() => setOpen(false)} className="rounded-xl px-3 py-2.5 font-bold hover:bg-cream-200">
                Orders & tracking
              </Link>
              {session ? (
                <button
                  onClick={() => {
                    signOut();
                    navigate("/");
                  }}
                  className="mt-1 flex items-center gap-2 rounded-xl px-3 py-2.5 text-left font-bold text-berry-500 hover:bg-cream-200"
                >
                  <LogOut className="h-4 w-4" /> Sign out ({session.name})
                </button>
              ) : (
                <Link to="/auth?returnTo=/order" onClick={() => setOpen(false)} className="btn-pepper btn-pepper-hover mt-2">
                  Sign in
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
