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

    // Only apply security on dashboard page
    if (location.pathname !== "/dashboard") {
      return;
    }

    let devtoolsOpen = false;

    // Check if devtools is open (more reliable method)
    const checkDevTools = () => {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      const orientation = widthThreshold ? 'vertical' : 'horizontal';
      
      // Only trigger if threshold is significant (reduce false positives)
      if ((widthThreshold || heightThreshold) && !devtoolsOpen) {
        const sizeDiff = widthThreshold 
          ? window.outerWidth - window.innerWidth 
          : window.outerHeight - window.innerHeight;
        
        // Only trigger if difference is significant (more than threshold)
        if (sizeDiff > threshold) {
          devtoolsOpen = true;
          setShowError(true);
        }
      } else if (!widthThreshold && !heightThreshold && devtoolsOpen) {
        // DevTools closed
        devtoolsOpen = false;
      }
    };

    // Check for tab visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setShowError(true);
      }
    };

    // Check for window blur
    const handleBlur = () => {
      setShowError(true);
    };

    // Initial check
    checkDevTools();

    // Add event listeners
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("resize", checkDevTools);

    // Periodic check for devtools (every 500ms)
    const interval = setInterval(checkDevTools, 500);

    // Cleanup
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("resize", checkDevTools);
      clearInterval(interval);
    };
  }, [setShowError, location.pathname]);

  return null;
}
