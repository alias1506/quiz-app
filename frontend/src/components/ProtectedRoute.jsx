import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const userData = sessionStorage.getItem("user"); // Changed to sessionStorage

  if (!userData) {
    // Redirect to start page if userData not found
    return <Navigate to="/" replace />;
  }

  // Render protected content (the nested route)
  return children;
}
