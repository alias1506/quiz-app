import { BrowserRouter, Route, Routes } from "react-router-dom";
import Starting from "./pages/Starting";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import BlockIfLoggedIn from "./components/BlockIfLoggedIn";
import ThankYou from "./pages/ThankYou";
import ThankYouGuard from "./components/ThankYouGuard";
import NotFound from "./pages/NotFound";
import { SecurityProvider } from "./contexts/SecurityContext";

function App() {
  return (
    <BrowserRouter>
      <SecurityProvider>
        <Routes>
          <Route
            path="/"
            element={
              <BlockIfLoggedIn>
                <Starting />
              </BlockIfLoggedIn>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/thank-you"
            element={
              <ThankYouGuard>
                <ThankYou />
              </ThankYouGuard>
            }
          />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </SecurityProvider>
    </BrowserRouter>
  );
}

export default App;
