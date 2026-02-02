import { Navigate } from "react-router-dom";
import useAuth from "../context/useAuth";

const PublicRoute = ({ children }) => {
  const { user } = useAuth();

  // If already logged in, redirect to correct dashboard
  if (user) {
    if (user.role === "admin") return <Navigate to="/admin/dashboard" />;
    if (user.role === "librarian") return <Navigate to="/librarian/dashboard" />;
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default PublicRoute;
