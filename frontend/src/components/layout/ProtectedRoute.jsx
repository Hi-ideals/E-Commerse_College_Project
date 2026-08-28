import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Spinner from "../ui/Spinner";

export function ProtectedRoute() {
  const { isAuthenticated, initializing } = useAuth();
  const location = useLocation();

  if (initializing) return <Spinner className="min-h-[60vh]" />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  return <Outlet />;
}

export function AdminRoute() {
  const { isAdmin, initializing } = useAuth();

  if (initializing) return <Spinner className="min-h-[60vh]" />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return <Outlet />;
}
