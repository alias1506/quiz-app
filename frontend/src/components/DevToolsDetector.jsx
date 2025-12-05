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
      return;
    }

    // Only check on protected pages (dashboard and thank-you)
    if (location.pathname !== "/dashboard" && location.pathname !== "/thank-you") {
      return;
    }

    let devtoolsOpen = false;

    // Check if devtools is already open
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

    // Check for tab visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab is hidden/changed
        setShowError(true);
      }
    };

    // Check for window blur (tab change)
    const handleBlur = () => {
      setShowError(true);
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
