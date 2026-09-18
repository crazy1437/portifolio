import { Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import LandingPage from "./pages/LandingPage";
import OrderPage from "./pages/OrderPage";
import TrackPage from "./pages/TrackPage";
import AuthPage from "./pages/AuthPage";
import PartnerPage from "./pages/PartnerPage";
import RequireAuth from "./components/RequireAuth";
import ScrollToTop from "./components/ScrollToTop";
import SeedBackend from "./lib/seed";
import ErrorBoundary from "./components/ErrorBoundary";
import Toaster from "./components/Toaster";

export default function App() {
  const location = useLocation();
  return (
    <ErrorBoundary>
      <div className="min-h-screen">
        <ScrollToTop />
        <SeedBackend />
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route
              path="/partner"
              element={
                <RequireAuth>
                  <PartnerPage />
                </RequireAuth>
              }
 />
            <Route
              path="/order"
              element={
                <RequireAuth>
                  <OrderPage />
                </RequireAuth>
              }
            />
            <Route
              path="/order/:restaurantId"
              element={
                <RequireAuth>
                  <OrderPage />
                </RequireAuth>
              }
            />
            <Route
              path="/track"
              element={
                <RequireAuth>
                  <TrackPage />
                </RequireAuth>
              }
            />
            <Route
              path="/track/:orderId"
              element={
                <RequireAuth>
                  <TrackPage />
                </RequireAuth>
              }
            />
            <Route path="*" element={<LandingPage />} />
          </Routes>
        </AnimatePresence>
        <Toaster />
      </div>
    </ErrorBoundary>
  );
}
