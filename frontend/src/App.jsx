import { BrowserRouter, Route, Routes } from "react-router-dom";
import Starting from "./pages/Starting";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import BlockIfLoggedIn from "./components/BlockIfLoggedIn";
import ThankYou from "./pages/ThankYou";
import ThankYouGuard from "./components/ThankYouGuard";

function App() {
  return (
    <BrowserRouter>
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
        {/* <Route path="/certificate" element={<Certificate />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
