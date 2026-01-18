import { useEffect, useState } from "react";
import { CheckCircle, Home, RotateCcw } from "lucide-react";
import { useSecurity } from "../contexts/SecurityContext";
import NotFound from "./NotFound";

function ThankYou() {
  // Local state to render user's name once, even after session is cleared
  const [userData, setUserData] = useState({});

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("user");
      if (stored) {
        setUserData(JSON.parse(stored));
      }
      // Clear session so it won't persist beyond this page
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("canViewThankYou");
      sessionStorage.removeItem("postRedirectClear");
      // If you want to wipe everything (be cautious):
      // sessionStorage.clear();
    } catch (e) {
      console.log("Error accessing sessionStorage:", e);
      // Ignore storage errors (e.g., restricted environment)
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md text-center">
        <div className="mb-8">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-3">Thank You!</h1>
          <p className="text-gray-600 text-lg mb-2">
            {userData?.name ? `Hi ${String(userData.name).split(" ")[0]},` : ""}
          </p>
          <p className="text-gray-600">
            We appreciate you taking the time to complete our quiz. Your
            responses have been successfully submitted.
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            What's Next?
          </h2>
          <ul className="text-sm text-gray-600 space-y-2 text-left">
            <li className="flex items-start">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              Your results will be processed within 24 hours
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              You'll receive a detailed report via email
            </li>
            <li className="flex items-start">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              Feel free to take the quiz again anytime
            </li>
          </ul>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Have questions? Contact us at{" "}
            <a
              href="mailto:iietechclub.mail@gmail.com"
              className="text-blue-600 hover:text-blue-700 transition-colors underline"
              title="Open your default email app"
            >
              iietechclub.mail@gmail.com
            </a>
            {/* If you want to avoid the Windows mail prompt, consider replacing the anchor
                with a copy-to-clipboard button instead. */}
          </p>
        </div>
      </div>
    </div>
  );
}

// Wrap ThankYou with security check
export default function ThankYouWrapper() {
  const { showError } = useSecurity();

  if (showError) {
    return <NotFound />;
  }

  return <ThankYou />;
}
