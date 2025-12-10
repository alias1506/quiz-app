import { createContext, useContext, useState, useEffect } from "react";

const SecurityContext = createContext();

export function SecurityProvider({ children }) {
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    // Check if user is admin
    const user = JSON.parse(sessionStorage.getItem("user") || "{}");
    const isAdmin = user.name?.toLowerCase() === 'admin' && user.email?.toLowerCase() === 'admin@gmail.com';

    // Skip all security checks for admin
    if (isAdmin) {
      return;
    }

    // Get current page
    const currentPage = window.location.pathname;
    const isStarting = currentPage === '/' || currentPage === '/starting';
    const isDashboard = currentPage === '/dashboard';
    const isThankYou = currentPage === '/thank-you';

    // Pages where tab switching is NOT allowed (Starting, Dashboard, Thank You)
    const noTabSwitchPages = isStarting || isDashboard || isThankYou;

    // Prevent DevTools
    const detectDevTools = () => {
      const threshold = 160;
      if (
        window.outerWidth - window.innerWidth > threshold ||
        window.outerHeight - window.innerHeight > threshold
      ) {
        setShowError(true);
      }
    };

    // Prevent Right Click & F12
    const preventRightClick = (e) => {
      if (e.button === 2 || e.keyCode === 123) {
        e.preventDefault();
        setShowError(true);
      }
    };

    // Detect Keyboard Shortcuts for DevTools
    const preventDevToolsShortcuts = (e) => {
      // F12
      if (e.keyCode === 123) {
        e.preventDefault();
        setShowError(true);
        return false;
      }
      // Ctrl+Shift+I / Cmd+Option+I
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.keyCode === 73) {
        e.preventDefault();
        setShowError(true);
        return false;
      }
      // Ctrl+Shift+J / Cmd+Option+J
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.keyCode === 74) {
        e.preventDefault();
        setShowError(true);
        return false;
      }
      // Ctrl+Shift+C / Cmd+Option+C
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.keyCode === 67) {
        e.preventDefault();
        setShowError(true);
        return false;
      }
      // Ctrl+U / Cmd+U (View Source)
      if ((e.ctrlKey || e.metaKey) && e.keyCode === 85) {
        e.preventDefault();
        setShowError(true);
        return false;
      }
    };

    // Tab visibility handler - Only for non-Starting/Dashboard/ThankYou pages
    const handleVisibilityChange = () => {
      if (!noTabSwitchPages && document.hidden) {
        setShowError(true);
      }
    };

    // Add event listeners
    window.addEventListener('resize', detectDevTools);
    window.addEventListener('contextmenu', preventRightClick);
    document.addEventListener('keydown', preventDevToolsShortcuts);

    // Add tab visibility listener only for pages that allow it
    if (!noTabSwitchPages) {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    // Initial DevTools check
    detectDevTools();

    // Cleanup
    return () => {
      window.removeEventListener('resize', detectDevTools);
      window.removeEventListener('contextmenu', preventRightClick);
      document.removeEventListener('keydown', preventDevToolsShortcuts);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

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
