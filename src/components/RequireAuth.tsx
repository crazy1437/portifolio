import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getSession } from "../lib/store";

export default function RequireAuth({ children }: { children: ReactNode }) {
  const location = useLocation();
  if (!getSession()) {
    const returnTo = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/auth?returnTo=${returnTo}`} replace />;
  }
  return <>{children}</>;
}
