import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const SecurityContext = createContext();

export function SecurityProvider({ children }) {
  const [showError, setShowError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let devtoolsOpen = false;

    // Detect if DevTools is already open using element.id trick
    const detectDevTools = () => {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;

      if (!(heightThreshold && widthThreshold) &&
        ((window.Firebug && window.Firebug.chrome && window.Firebug.chrome.isInitialized) || widthThreshold || heightThreshold)) {
        if (!devtoolsOpen) {
          devtoolsOpen = true;
          navigate('/404', { replace: true });
        }
      }
    };

    // Prevent Right Click
    const preventRightClick = (e) => {
      e.preventDefault();
    };

    // Detect Keyboard Shortcuts for DevTools
    const preventDevToolsShortcuts = (e) => {
      // F12
      if (e.keyCode === 123) {
        e.preventDefault();
        navigate('/404', { replace: true });
        return false;
      }
      // Ctrl+Shift+I / Cmd+Option+I
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.keyCode === 73) {
        e.preventDefault();
        navigate('/404', { replace: true });
        return false;
      }
      // Ctrl+Shift+J / Cmd+Option+J
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.keyCode === 74) {
        e.preventDefault();
        navigate('/404', { replace: true });
        return false;
      }
      // Ctrl+Shift+C / Cmd+Option+C
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.keyCode === 67) {
        e.preventDefault();
        navigate('/404', { replace: true });
        return false;
      }
      // Ctrl+U / Cmd+U (View Source)
      if ((e.ctrlKey || e.metaKey) && e.keyCode === 85) {
        e.preventDefault();
        navigate('/404', { replace: true });
        return false;
      }
    };

    // Tab visibility handler - ONLY during active quiz on dashboard
    const handleVisibilityChange = () => {
      // Only check on dashboard page
      if (window.location.pathname !== '/dashboard') {
        return; // Allow tab switching on other pages
      }

      // Check if quiz is completed (results page shown)
      const quizCompleted = sessionStorage.getItem('quizCompleted') === 'true';

      // Only trigger 404 if:
      // 1. On dashboard page
      // 2. Quiz is NOT completed (still answering questions)
      // 3. User switched tabs
      if (!quizCompleted && document.hidden) {
        navigate('/404', { replace: true });
      }
    };

    // Check on load if DevTools is open
    detectDevTools();

    // Check periodically
    const devtoolsCheckInterval = setInterval(detectDevTools, 1000);

    // Add event listeners
    window.addEventListener('contextmenu', preventRightClick);
    document.addEventListener('keydown', preventDevToolsShortcuts);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('resize', detectDevTools);

    // Cleanup
    return () => {
      clearInterval(devtoolsCheckInterval);
      window.removeEventListener('contextmenu', preventRightClick);
      document.removeEventListener('keydown', preventDevToolsShortcuts);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', detectDevTools);
    };
  }, [navigate]);

  return (
    <SecurityContext.Provider value={{ showError, setShowError }}>
      {children}
    </SecurityContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSecurity() {
  return useContext(SecurityContext);
}
