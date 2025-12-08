import { useState } from "react";
import { Mail, User, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

function App() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Save to sessionStorage
  const storeInSession = (data) => {
    try {
      sessionStorage.setItem(
        "user",
        JSON.stringify({
          name: data.name,
          email: data.email,
          timestamp: new Date().toISOString(),
        })
      );
    } catch (err) {
      console.error("Failed to save to sessionStorage:", err);
    }
  };

  const formatTimeRemaining = (milliseconds) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      Swal.fire({
        title: "Missing Information",
        text: "Please enter your full name.",
        icon: "warning",
        confirmButtonColor: "#3b82f6",
      });
      return;
    }

    if (!validateEmail(formData.email)) {
      Swal.fire({
        title: "Invalid Email",
        text: "Please enter a valid email address.",
        icon: "warning",
        confirmButtonColor: "#3b82f6",
      });
      return;
    }

    setIsLoading(true);

    try {
      const API_BASE_URL =
        typeof import.meta !== "undefined" &&
        import.meta.env &&
        import.meta.env.MODE === "production"
          ? ""
          : "http://localhost:5000";

      // Step 1: Check if email exists and get attempt status
      const checkResponse = await fetch(`${API_BASE_URL}/api/users/check-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formData.email }),
      });

      if (!checkResponse.ok) {
        throw new Error(`HTTP error! status: ${checkResponse.status}`);
      }

      const emailCheck = await checkResponse.json();

      // Step 2: If user exists, check their attempt status
      if (emailCheck.exists) {
        const attemptsResponse = await fetch(`${API_BASE_URL}/api/users/check-attempts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: formData.email }),
        });

        if (!attemptsResponse.ok) {
          throw new Error(`HTTP error! status: ${attemptsResponse.status}`);
        }

        const attemptsData = await attemptsResponse.json();

        if (!attemptsData.canAttempt) {
          // User has exceeded daily limit
          let countdownInterval;
          
          Swal.fire({
            title: "Daily Limit Reached!",
            html: `<p>You have used all 3 attempts for today (${attemptsData.currentAttempts}/3).</p>
                   <p>Please try again after:</p>
                   <p id="countdown-timer" style="font-size: 1.5em; font-weight: bold; color: #ef4444;">Calculating...</p>`,
            icon: "warning",
            confirmButtonColor: "#3b82f6",
            confirmButtonText: "OK",
            didOpen: () => {
              const countdownElement = document.getElementById('countdown-timer');
              let timeLeft = attemptsData.timeUntilReset;
              
              const updateCountdown = () => {
                if (timeLeft <= 0) {
                  countdownElement.textContent = "0h 0m 0s";
                  clearInterval(countdownInterval);
                  return;
                }
                
                const hours = Math.floor(timeLeft / (1000 * 60 * 60));
                const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
                
                countdownElement.textContent = `${hours}h ${minutes}m ${seconds}s`;
                timeLeft -= 1000;
              };
              
              updateCountdown();
              countdownInterval = setInterval(updateCountdown, 1000);
            },
            willClose: () => {
              if (countdownInterval) {
                clearInterval(countdownInterval);
              }
            }
          });
          setIsLoading(false);
          return;
        }

        // User can attempt - show remaining attempts
        const result = await Swal.fire({
          title: "Welcome Back!",
          html: `<p>You can attempt the quiz.</p>
                 <p style="font-size: 1.2em; font-weight: bold;">Attempts: ${attemptsData.currentAttempts + 1}/3</p>`,
          icon: "info",
          confirmButtonColor: "#3b82f6",
          confirmButtonText: "Start Quiz",
          showCancelButton: true,
          cancelButtonColor: "#6b7280",
        });

        if (!result.isConfirmed) {
          setIsLoading(false);
          return;
        }
      } else {
        // New user - show they have 3 attempts
        const result = await Swal.fire({
          title: "Welcome!",
          html: `<p>This is your first attempt.</p>
                 <p style="font-size: 1.2em; font-weight: bold;">Attempts: 1/3</p>`,
          icon: "success",
          confirmButtonColor: "#3b82f6",
          confirmButtonText: "Start Quiz",
          showCancelButton: true,
          cancelButtonColor: "#6b7280",
        });

        if (!result.isConfirmed) {
          setIsLoading(false);
          return;
        }
      }

      // Step 3: Record the attempt
      const recordResponse = await fetch(`${API_BASE_URL}/api/users/record-attempt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          name: formData.name, 
          email: formData.email 
        }),
      });

      if (!recordResponse.ok) {
        const errorData = await recordResponse.json();
        if (recordResponse.status === 429) {
          // Somehow still hit the limit
          let countdownInterval;
          
          Swal.fire({
            title: "Daily Limit Reached!",
            html: `<p>You have used all 3 attempts for today.</p>
                   <p>Please try again after:</p>
                   <p id="countdown-timer-2" style="font-size: 1.5em; font-weight: bold; color: #ef4444;">Calculating...</p>`,
            icon: "warning",
            confirmButtonColor: "#3b82f6",
            confirmButtonText: "OK",
            didOpen: () => {
              const countdownElement = document.getElementById('countdown-timer-2');
              let timeLeft = errorData.timeUntilReset;
              
              const updateCountdown = () => {
                if (timeLeft <= 0) {
                  countdownElement.textContent = "0h 0m 0s";
                  clearInterval(countdownInterval);
                  return;
                }
                
                const hours = Math.floor(timeLeft / (1000 * 60 * 60));
                const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
                
                countdownElement.textContent = `${hours}h ${minutes}m ${seconds}s`;
                timeLeft -= 1000;
              };
              
              updateCountdown();
              countdownInterval = setInterval(updateCountdown, 1000);
            },
            willClose: () => {
              if (countdownInterval) {
                clearInterval(countdownInterval);
              }
            }
          });
          setIsLoading(false);
          return;
        }
        throw new Error(errorData.message || "Failed to record attempt");
      }

      const recordData = await recordResponse.json();

      // Store in session and navigate directly
      storeInSession(formData);
      navigate("/dashboard");

    } catch (err) {
      console.error("Error processing quiz start:", err);

      Swal.fire({
        title: "Connection Error",
        text: "Unable to connect to server. Please check your internet connection and try again.",
        icon: "error",
        confirmButtonColor: "#3b82f6",
        confirmButtonText: "Retry",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            {/* <User className="w-8 h-8 text-blue-600" /> */}
            <img src="./club-logo.jpg" alt="Club Logo" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Welcome to <span className="text-blue-600">Quizopolis</span>
          </h1>
          <p className="text-gray-600">
            Please fill out the form below to get started.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Enter your full name"
                required
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Enter your email address"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Processing...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Start Quiz
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Your information is safe and secure with us.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
