import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAdminAuth } from "./AdminAuth";

export function ProtectedAdminRoute() {
  const { loading, session } = useAdminAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="admin-loading" role="status">
        Loading admin dashboard...
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
