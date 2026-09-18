import { useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";

export type Toast = {
  id: number;
  message: string;
  tone: "success" | "error";
};

let toasts: Toast[] = [];
let nextId = 1;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function pushToast(message: string, tone: Toast["tone"] = "success") {
  const toast = { id: nextId++, message, tone };
  toasts = [...toasts, toast];
  emit();
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== toast.id);
    emit();
  }, 2600);
}

export function useToasts() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => toasts,
    () => toasts
  );
}

/** Imperative toast helper (stable identity, safe in callbacks/effects). */
export function useToast() {
  return pushToast;
}

export default function Toaster() {
  const items = useToasts();
  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[70] flex max-w-[calc(100vw-2rem)] flex-col items-stretch gap-2 sm:items-end">
      <AnimatePresence>
        {items.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className={`pointer-events-auto flex items-center gap-2.5 rounded-2xl border-2 border-pulp-950 px-4 py-3 font-extrabold shadow-chunky-md ${
              t.tone === "success" ? "bg-zest-400 text-pulp-950" : "bg-berry-400 text-white"
            }`}
          >
            {t.tone === "success" ? (
              <CheckCircle2 className="h-5 w-5 shrink-0" />
            ) : (
              <XCircle className="h-5 w-5 shrink-0" />
            )}
            <span className="min-w-0">{t.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
