import { Navigate } from "react-router-dom";

export default function BlockIfLoggedIn({ children }) {
  let userData = null;
  
  try {
    userData = sessionStorage.getItem("user");
  } catch (e) {
    console.error("Error accessing sessionStorage:", e);
  }

  if (userData) {
    // If user data exists, redirect to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  // If no user data, allow access to the starting page
  return children;
}
