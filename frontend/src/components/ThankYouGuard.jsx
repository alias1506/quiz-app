import React from "react";
import { Navigate } from "react-router-dom";

const ThankYouGuard = ({ children }) => {
  let allow = false;
  try {
    allow = sessionStorage.getItem("canViewThankYou") === "true";
  } catch (e) {
    console.error("Error checking sessionStorage:", e);
    allow = false;
  }

  if (!allow) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ThankYouGuard;
