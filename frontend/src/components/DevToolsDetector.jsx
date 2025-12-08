import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSecurity } from "../contexts/SecurityContext";

export default function DevToolsDetector() {
  const location = useLocation();
  const { setShowError } = useSecurity();

  useEffect(() => {
    // Reset error state when on starting page
    if (location.pathname === "/") {
      setShowError(false);
    }

    let devtoolsOpen = false;

    // Check if devtools is already open (applies globally to all pages)
    const checkDevTools = () => {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      
      if (widthThreshold || heightThreshold) {
        if (!devtoolsOpen) {
          devtoolsOpen = true;
          setShowError(true);
        }
      }
    };

    // Check for tab visibility change (only on dashboard page)
    const handleVisibilityChange = () => {
      // Only check tab changes on dashboard
      if (location.pathname === "/dashboard" && document.hidden) {
        setShowError(true);
      }
    };

    // Check for window blur/tab change (only on dashboard page)
    const handleBlur = () => {
      // Only check tab changes on dashboard
      if (location.pathname === "/dashboard") {
        setShowError(true);
      }
    };

    // Check for resize (devtools opening/closing)
    const handleResize = () => {
      checkDevTools();
    };

    // Initial check
    checkDevTools();

    // Add event listeners
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("resize", handleResize);

    // Periodic check for devtools
    const interval = setInterval(checkDevTools, 1000);

    // Cleanup
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("resize", handleResize);
      clearInterval(interval);
    };
  }, [setShowError, location.pathname]);

  return null;
}
