import { createContext, useContext, useState } from "react";

const SecurityContext = createContext();

export function SecurityProvider({ children }) {
  const [showError, setShowError] = useState(false);

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
