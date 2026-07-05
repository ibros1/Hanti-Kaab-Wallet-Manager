import React from "react";
import { useAuth } from "../../context/AuthContext";
import { Navigate } from "react-router";

const ProtectedRoutes = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={"/auth/login"} />;
  }

  return children;
};

export default ProtectedRoutes;
