import { useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";

/** Fires the idempotent seed mutation on mount (once). */
export default function SeedBackend() {
  const seed = useMutation(api.orders.seedIfEmpty);
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    seed().catch(() => {
      // ignore: another tab/session may have raced us; seed is idempotent
    });
  }, [seed]);

  return null;
}
