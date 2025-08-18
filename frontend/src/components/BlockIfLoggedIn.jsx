import React from "react";
import { Navigate } from "react-router-dom";

export default function BlockIfLoggedIn({ children }) {
  const userData = sessionStorage.getItem("user"); // Changed to sessionStorage

  if (userData) {
    // If user data exists, redirect to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  // If no user data, allow access to the starting page
  return children;
}
