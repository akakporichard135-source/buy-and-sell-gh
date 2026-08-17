import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAdminAuth } from "./AdminAuth";

export function ProtectedAdminRoute() {
  const { loading, mfaRequired, session } = useAdminAuth();
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

  if (mfaRequired || session.assuranceLevel !== "aal2") {
    return <Navigate to="/admin/mfa" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
