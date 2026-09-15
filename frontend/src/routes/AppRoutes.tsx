import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "../features/auth/ProtectedRoute";

const AuthPage = lazy(() => import("./AuthPage").then((module) => ({ default: module.AuthPage })));
const DashboardPage = lazy(() => import("./DashboardPage").then((module) => ({ default: module.DashboardPage })));
const LandingPage = lazy(() => import("./LandingPage").then((module) => ({ default: module.LandingPage })));

export function AppRoutes() {
  return (
    <Suspense fallback={<p className="grid min-h-screen place-items-center text-sm text-parchment/70">Loading...</p>}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/:section"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
