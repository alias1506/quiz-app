import React from "react";
import { useNavigate } from "react-router-dom";
import { Home } from "lucide-react";
import { useSecurity } from "../contexts/SecurityContext";
import "./NotFound.css";

function NotFound() {
  const navigate = useNavigate();
  const { setShowError } = useSecurity();

  const handleGoHome = () => {
    // Clear all session storage
    try {
      sessionStorage.clear();
    } catch (e) {
      console.error("Error clearing sessionStorage:", e);
    }
    
    // Reset the error state
    setShowError(false);
    
    // Navigate to starting page
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="text-center max-w-2xl w-full">
        {/* 404 Background with Image */}
        <div className="four_zero_four_bg relative mb-4">
          <h1 className="text-[80px] sm:text-[100px] font-bold text-gray-800 absolute top-4 sm:top-8 left-1/2 transform -translate-x-1/2">
            404
          </h1>
        </div>

        {/* Content Box */}
        <div className="mt-4">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-gray-800 mb-3">
            Look like you're lost
          </h3>

          <p className="text-gray-600 text-base sm:text-lg mb-6 sm:mb-8">
            the page you are looking for not avaible!
          </p>

          <button
            onClick={handleGoHome}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 sm:px-8 rounded-lg transition-colors inline-flex items-center justify-center gap-2"
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
