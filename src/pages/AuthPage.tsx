import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useAction, useMutation } from "convex/react";
import { ArrowRight, ArrowLeft, Flame, MailCheck, Timer } from "lucide-react";
import { api } from "../convex/_generated/api";
import { JuicyMark } from "../components/Logo";
import { setSession, useSession } from "../lib/store";

const RESEND_SECONDS = 30;

export default function AuthPage() {
  const session = useSession();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const requestOtp = useAction(api.auth.requestOtp);
  const verifyOtp = useMutation(api.auth.verifyOtp);

  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);
  const codeRef = useRef<HTMLInputElement>(null);

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

  // resend countdown
  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setInterval(() => setResendIn((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [resendIn]);

  const validEmail = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim());

  const sendCode = async () => {
    setError("");
    if (!validEmail) {
      setError("That email looks undercooked — try again.");
      return;
    }
    setSending(true);
    try {
      const res = await requestOtp({ email: email.trim() });
      setStep("code");
      setResendIn(RESEND_SECONDS);
      setCode("");
      if (res.devCode) {
        setDevCode(res.devCode);
        setCode(res.devCode);
      } else {
        setDevCode(null);
      }
      setTimeout(() => codeRef.current?.focus(), 80);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't send the code. Try again.");
    } finally {
      setSending(false);
    }
  };

  const submitEmail = (e: React.FormEvent) => {
    e.preventDefault();
    void sendCode();
  };

  const submitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (code.replace(/\D/g, "").length !== 6) {
      setError("Enter the 6-digit code from your email.");
      return;
    }
    setVerifying(true);
    try {
      const res = await verifyOtp({ email: email.trim(), code });
      if (res === null) {
        setError("That code didn't take. Try again.");
        setCode("");
        return;
      }
      if (!res.ok) {
        setError(res.message);
        setCode("");
        if (res.locked) {
          // code is dead — drop back so the user can request a fresh one
          setStep("email");
          setDevCode(null);
        }
        return;
      }
      setSession(res.token, res.user);
      navigate(decodedReturnTo, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "That code didn't take. Drop back and try again.");
      setCode("");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* form side */}
      <div className="relative flex items-center justify-center px-4 py-16 sm:px-8">
        <Link
          to="/"
          className="absolute left-5 top-5 z-10 inline-flex items-center gap-2 font-extrabold text-pulp-700 transition-colors hover:text-pepper-500"
        >
          <JuicyMark className="h-9 w-9" />
          JuicyBruh
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <AnimatePresence mode="wait">
            {step === "email" ? (
              <motion.div
                key="email"
                initial={{ opacity: 0, x: -18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
                transition={{ duration: 0.22 }}
              >
                <div className="eyebrow bg-mango-300">
                  <Flame className="h-3.5 w-3.5 text-pepper-500" /> One code, zero passwords
                </div>
                <h1 className="mt-4 font-display text-4xl font-black leading-tight sm:text-5xl">
                  Hungry? <span className="text-pepper-500">Let's ride.</span>
                </h1>
                <p className="mt-3 font-bold text-pulp-700">
                  Enter your email and we'll send a 6-digit login code. No passwords to forget.
                </p>

                <form onSubmit={submitEmail} className="mt-8 space-y-4">
                  <div>
                    <label htmlFor="email" className="text-sm font-black uppercase tracking-wider text-pulp-700">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
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

                  <button
                    type="submit"
                    disabled={sending}
                    className="btn-pepper btn-pepper-hover w-full text-lg disabled:opacity-60"
                  >
                    {sending ? "Sending code…" : "Send my code"} <ArrowRight className="h-5 w-5" />
                  </button>
                  <p className="text-center text-xs font-bold text-pulp-700/70">
                    We email you a one-time code. It expires in 10 minutes.
                  </p>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="code"
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 18 }}
                transition={{ duration: 0.22 }}
              >
                <div className="eyebrow bg-zest-300">
                  <MailCheck className="h-3.5 w-3.5 text-pulp-900" /> Check your inbox
                </div>
                <h1 className="mt-4 font-display text-4xl font-black leading-tight sm:text-5xl">
                  What's the <span className="text-pepper-500">code?</span>
                </h1>
                <p className="mt-3 font-bold text-pulp-700">
                  Sent to <span className="text-pulp-950">{email.trim()}</span>.{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setStep("email");
                      setError("");
                      setCode("");
                    }}
                    className="font-extrabold text-pepper-500 underline underline-offset-2 hover:text-pepper-600"
                  >
                    Change email
                  </button>
                </p>

                {devCode && (
                  <div className="mt-5 rounded-2xl border-2 border-dashed border-pulp-950/40 bg-cream-100 px-4 py-3">
                    <p className="text-xs font-black uppercase tracking-wider text-pulp-700">
                      Demo mode — no email key configured
                    </p>
                    <p className="mt-1 font-display text-2xl font-black tracking-[0.3em] text-pepper-500">
                      {devCode}
                    </p>
                  </div>
                )}

                <form onSubmit={submitCode} className="mt-6 space-y-4">
                  <div>
                    <label htmlFor="otp" className="text-sm font-black uppercase tracking-wider text-pulp-700">
                      6-digit code
                    </label>
                    <input
                      id="otp"
                      ref={codeRef}
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      value={code}
                      onChange={(e) => {
                        setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
                        setError("");
                      }}
                      placeholder="••••••"
                      className="mt-1.5 w-full rounded-2xl border-2 border-pulp-950 bg-white px-4 py-3 text-center font-display text-3xl font-black tracking-[0.45em] shadow-chunky-sm outline-none transition-shadow placeholder:tracking-[0.45em] placeholder:text-pulp-700/30 focus:shadow-chunky"
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

                  <button
                    type="submit"
                    disabled={verifying}
                    className="btn-pepper btn-pepper-hover w-full text-lg disabled:opacity-60"
                  >
                    {verifying ? "Checking…" : "Let me in"} <ArrowRight className="h-5 w-5" />
                  </button>

                  <div className="text-center text-sm font-bold text-pulp-700">
                    {resendIn > 0 ? (
                      <span>
                        Resend code in <span className="text-pulp-950">{resendIn}s</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void sendCode()}
                        className="font-extrabold text-pepper-500 underline underline-offset-2 hover:text-pepper-600"
                      >
                        Resend code
                      </button>
                    )}
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
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
