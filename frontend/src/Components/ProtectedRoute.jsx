import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

/**
 * ProtectedRoute: Enforces authentication and Role-Based Access Control (RBAC)
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.requiredRole] - Specific role required (e.g., 'PHARMASURE')
 * @param {string[]} [props.allowedRoles] - List of allowed roles
 */
const ProtectedRoute = ({ children, requiredRole, allowedRoles }) => {
  const location = useLocation();
  const token = sessionStorage.getItem("token");
  const role = sessionStorage.getItem("role");
  const pid = sessionStorage.getItem("pid");
  const email = sessionStorage.getItem("email");

  // Check if authenticated
  const isAuthenticated = Boolean(token || (role && (pid || email)));

  if (!isAuthenticated) {
    toast.error("Please login to access this protected area.", {
      toastId: "auth-required-toast",
    });
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role authorization for admin routes
  if (requiredRole && role !== requiredRole) {
    toast.warning("Access denied: You do not have permission for this area.", {
      toastId: "role-denied-toast",
    });
    // Redirect non-admin users to their appropriate dashboard
    return <Navigate to="/userDashboard" replace />;
  }

  // Check allowed roles if specified
  if (allowedRoles && !allowedRoles.includes(role)) {
    toast.warning("Access denied: Insufficient permissions.", {
      toastId: "roles-denied-toast",
    });
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
