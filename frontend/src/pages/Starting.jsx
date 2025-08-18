import React, { useState } from "react";
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
      const response = await fetch(
        "http://localhost:5000/api/users/check-email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: formData.email }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const res = await response.json();

      if (res.exists) {
        // Email already registered - show error and DON'T store data or redirect
        Swal.fire({
          title: "Email Already Registered",
          text: "This email is already registered. Please use a different email address.",
          icon: "error",
          confirmButtonColor: "#3b82f6",
          confirmButtonText: "Try Again",
        });
        // Optionally clear email field
        setFormData((prev) => ({ ...prev, email: "" }));
      } else {
        // SUCCESS: Email is new - store data and redirect
        storeInSession(formData);

        Swal.fire({
          title: "Success!",
          text: "Registration successful. Redirecting to dashboard...",
          icon: "success",
          confirmButtonColor: "#3b82f6",
          timer: 1500,
          showConfirmButton: false,
        }).then(() => {
          navigate("/dashboard");
        });
      }
    } catch (err) {
      console.error("Error checking email:", err);

      // Show error message and DON'T store data or redirect
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
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Welcome to Quiz App
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
