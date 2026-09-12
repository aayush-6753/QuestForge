import { Navigate, useLocation } from "react-router-dom";
import { LoadingSkeleton } from "../../components/ui/LoadingSkeleton";
import { useAuth } from "./auth-context";

export function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { session, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSkeleton label="Restoring your session" />;
  }

  if (!session) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  return children;
}
