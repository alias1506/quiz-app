import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  let userData = null;
  
  try {
    userData = sessionStorage.getItem("user");
  } catch (e) {
    console.error("Error accessing sessionStorage:", e);
  }

  if (!userData) {
    // Redirect to start page if userData not found
    return <Navigate to="/" replace />;
  }

  // Render protected content (the nested route)
  return children;
}
