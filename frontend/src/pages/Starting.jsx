import { useState, useEffect } from "react";
import { Mail, User, Send, Clock, AlertCircle, Trophy, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CustomSwal from "../utils/swalHelper";
import { io } from "socket.io-client";

function App() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    part: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [isCheckingQuiz, setIsCheckingQuiz] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [partAttempts, setPartAttempts] = useState({}); // Track attempts per part
  const [socket, setSocket] = useState(null);
  const navigate = useNavigate();

  const API_BASE_URL =
    typeof import.meta !== "undefined" &&
      import.meta.env &&
      import.meta.env.MODE === "production"
      ? ""
      : "http://localhost:3000";

  // Fetch published quiz
  const fetchPublishedQuiz = async () => {
    setIsCheckingQuiz(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/quiz/published`, {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("📡 Published quiz response:", data);

      if (data.published && data.quiz) {
        console.log("✅ Quiz is published:", data.quiz.name);
        setActiveQuiz(data.quiz);
      } else {
        console.log("❌ No published quiz found");
        setActiveQuiz(null);
      }
    } catch (err) {
      console.error("❌ Error fetching published quiz:", err);
      setActiveQuiz(null);
    } finally {
      setIsCheckingQuiz(false);
    }
  };

  // Fetch published quiz on mount
  useEffect(() => {
    fetchPublishedQuiz();
  }, []);

  // Initialize WebSocket connection for real-time updates
  useEffect(() => {
    const adminSocketURL = import.meta.env.VITE_ADMIN_SOCKET_URL || 'http://localhost:8000';
    const newSocket = io(adminSocketURL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 10,
      transports: ["websocket"], // Skip polling to avoid 'xhr poll error' on Render
    });

    newSocket.on('connect', () => {
      console.log('✅ Connected to admin WebSocket server');
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from admin WebSocket server');
    });

    // Listen for user updates (deletions)
    newSocket.on('user:update', (data) => {
      console.log('📢 User update received:', data);

      // Handle quiz updates/deletions
      if (data.action === 'quiz-updated' || data.action === 'quiz-deleted') {
        console.log('🔄 Quiz changed, refreshing...');
        fetchPublishedQuiz();
      }

      // Re-check attempts when a user is deleted
      if (formData.email) {
        checkPartAttempts(formData.email);
      }
    });

    newSocket.on('user:deleted', (data) => {
      console.log('🗑️ User deleted:', data);
      // Re-check attempts when a user is deleted
      if (formData.email && data.email === formData.email) {
        checkPartAttempts(formData.email);
      }
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, []);

  // Re-check attempts when email changes
  useEffect(() => {
    if (formData.email && validateEmail(formData.email)) {
      checkPartAttempts(formData.email);
    }
  }, [formData.email]);

  // Detect DevTools on mount and periodically
  useEffect(() => {
    const detectDevTools = () => {
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;

      if (!(heightThreshold && widthThreshold) &&
        ((window.Firebug && window.Firebug.chrome && window.Firebug.chrome.isInitialized) || widthThreshold || heightThreshold)) {
        // DevTools is open - redirect to 404
        navigate('/404', { replace: true });
      }
    };

    // Check on mount
    detectDevTools();

    // Check periodically
    const interval = setInterval(detectDevTools, 1000);

    // Check on resize
    window.addEventListener('resize', detectDevTools);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', detectDevTools);
    };
  }, [navigate]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest('.custom-dropdown-container')) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);


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
          quizName: activeQuiz?.name,
          quizPart: formData.part,
          dailyAttempts: data.dailyAttempts || 1
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

  const checkPartAttempts = async (email) => {
    if (!email || !validateEmail(email)) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/check-attempts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          hasParts: activeQuiz?.parts?.length > 0
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setPartAttempts(data.partAttempts || {});
      }
    } catch (err) {
      console.error("Error checking part attempts:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      CustomSwal.fire({
        title: "Missing Information",
        text: "Please enter your full name.",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }

    if (activeQuiz?.parts?.length > 0 && !formData.part) {
      CustomSwal.fire({
        title: "Selection Required",
        text: "Please select a quiz part to continue.",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }

    if (!formData.email.trim()) {
      CustomSwal.fire({
        title: "Email Required",
        text: "Please enter your email address to proceed.",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }

    if (!validateEmail(formData.email)) {
      CustomSwal.fire({
        title: "Invalid Email",
        text: "Please enter a valid email address.",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Check if email exists and get attempt status
      console.log("🔍 Checking email:", formData.email);
      console.log("🌐 API Base URL:", API_BASE_URL);

      const checkResponse = await fetch(`${API_BASE_URL}/api/users/check-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formData.email }),
      });

      console.log("📡 Email Check Response Status:", checkResponse.status);

      if (!checkResponse.ok) {
        const errorText = await checkResponse.text();
        console.error("❌ Email check failed:", errorText);
        throw new Error(`Server error: ${checkResponse.status}`);
      }

      const emailCheck = await checkResponse.json();
      console.log("✅ Email Check Result:", emailCheck.exists ? "User exists" : "New user");

      let attemptsData = { currentAttempts: 0 }; // Default for new users

      // Step 2: If user exists, check their attempt status
      if (emailCheck.exists) {
        console.log("📊 Checking attempts for:", formData.email, "Part:", formData.part);

        const attemptsResponse = await fetch(`${API_BASE_URL}/api/users/check-attempts`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            quizPart: formData.part,
            hasParts: activeQuiz?.parts?.length > 0
          }),
        });

        console.log("📡 Attempts Response Status:", attemptsResponse.status);

        if (!attemptsResponse.ok) {
          const errorText = await attemptsResponse.text();
          console.error("❌ Attempts check failed:", errorText);
          throw new Error(`Server error: ${attemptsResponse.status} - ${errorText}`);
        }

        attemptsData = await attemptsResponse.json();
        console.log("✅ Attempts Data:", attemptsData);

        if (!attemptsData.canAttempt) {
          // User has exceeded daily limit
          let countdownInterval;

          CustomSwal.fire({
            title: "Daily Limit Reached!",
            html: `<p>You have used all 3 attempts for today (${attemptsData.currentAttempts}/3).</p>
                   <p>Please try again after:</p>
                   <p id="countdown-timer" style="font-size: 1.5em; font-weight: bold; color: #ef4444;">Calculating...</p>`,
            icon: "warning",
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
        const result = await CustomSwal.fire({
          title: "Welcome Back!",
          html: `<p>You can attempt the quiz.</p>
                   <p style="font-size: 1.2em; font-weight: bold;">Attempts: ${attemptsData.currentAttempts + 1}/3</p>`,
          icon: "info",
          confirmButtonText: "Start Quiz",
          showCancelButton: true,
          cancelButtonText: "Cancel",
        });

        if (!result.isConfirmed) {
          setIsLoading(false);
          return;
        }
      } else {
        // New user - show they have 3 attempts
        const result = await CustomSwal.fire({
          title: "Welcome!",
          html: `<p>This is your first attempt.</p>
                   <p style="font-size: 1.2em; font-weight: bold;">Attempts: 1/3</p>`,
          icon: "success",
          confirmButtonText: "Start Quiz",
          showCancelButton: true,
          cancelButtonText: "Cancel",
        });

        if (!result.isConfirmed) {
          setIsLoading(false);
          return;
        }
      }

      // ✅ Record user data in database immediately when Start Quiz is clicked
      console.log("📝 Recording user attempt in database...");
      try {
        const recordResponse = await fetch(`${API_BASE_URL}/api/users/record-attempt`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            quizName: activeQuiz?.name,
            quizPart: formData.part
          }),
        });

        if (recordResponse.ok) {
          console.log("✅ User data recorded and sent to admin panel");
        } else {
          console.warn("⚠️ Failed to record user data, but continuing...");
        }
      } catch (recordError) {
        console.error("❌ Error recording user data:", recordError);
        // Continue anyway - don't block the user
      }

      // Store session data and navigate
      storeInSession({
        ...formData
      });
      navigate("/dashboard");

    } catch (err) {
      console.error("Error processing quiz start:", err);

      // Try to extract meaningful error message
      let errorMessage = "Unable to connect to server. Please check your internet connection and try again.";

      if (err.message && !err.message.includes("HTTP error")) {
        errorMessage = err.message;
      }

      CustomSwal.fire({
        title: "Connection Error",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "Retry",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isLoadingAny = isCheckingQuiz;

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-500 
      ${(!activeQuiz && !isLoadingAny)
        ? 'bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900'
        : 'bg-gradient-to-br from-blue-50 to-indigo-100'}`}
    >
      <div className={`w-full max-w-4xl flex justify-center transition-all duration-500 transform
        ${isLoadingAny ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}
      >
        {!activeQuiz ? (
          <div className="max-w-2xl w-full text-center space-y-12">
            <div className="relative inline-flex items-center justify-center">
              <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-[80px] animate-pulse"></div>
              <div className="relative bg-slate-800/60 backdrop-blur-3xl border border-white/10 rounded-full p-12 shadow-2xl shadow-blue-500/20">
                <Clock className="w-24 h-24 text-blue-400 animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]" />
              </div>
            </div>

            <div className="space-y-8">
              <h1 className="text-5xl md:text-8xl font-black text-white tracking-tight leading-tight">
                Awaiting the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-200 to-blue-400">Next Session</span>
              </h1>

              <p className="text-2xl text-blue-100/70 max-w-2xl mx-auto leading-relaxed font-light">
                We're currently preparing the next challenge for you. Stay tuned; this page will automatically sync the moment the admin starts the quiz.
              </p>

              <button
                onClick={() => {
                  setIsCheckingQuiz(true);
                  fetchPublishedQuiz();
                }}
                className="mt-8 px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Check Again
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20">
            <div className="text-center mb-10">
              <div className="mx-auto w-24 h-24 flex items-center justify-center mb-8">
                <img src="./club-logo.png" alt="Club Logo" className="w-full h-full object-contain" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome to <span className="text-blue-600 drop-shadow-sm">{activeQuiz.name}</span>
              </h1>
              <p className="text-gray-500 font-medium">
                Please enter your details to begin the challenge
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 ml-1">
                  Full Name
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={(e) => {
                      handleInputChange(e);
                      // Check attempts with a slight delay as user types or on change
                      if (validateEmail(e.target.value)) {
                        checkPartAttempts(e.target.value);
                      }
                    }}
                    onBlur={(e) => checkPartAttempts(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              {activeQuiz?.parts && activeQuiz.parts.length > 0 && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-700 custom-dropdown-container">
                  <label className="block text-sm font-semibold text-gray-700 ml-1">
                    Select Quiz Part
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className={`flex items-center w-full pl-10 pr-4 py-3.5 bg-gray-50 border ${isDropdownOpen ? 'border-blue-500 ring-4 ring-blue-500/10' : 'border-gray-200'} text-gray-900 text-sm rounded-xl focus:outline-none transition-all hover:bg-white hover:border-blue-300 group`}
                    >
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Clock className={`h-5 w-5 ${isDropdownOpen ? 'text-blue-500' : 'text-gray-400'} transition-colors`} />
                      </div>
                      <span className={`block truncate ${!formData.part ? 'text-gray-400' : 'text-gray-900 font-medium'}`}>
                        {formData.part || "Select a subject..."}
                      </span>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none transition-transform duration-300">
                        <ChevronDown className={`h-4 w-4 text-gray-400 ${isDropdownOpen ? 'rotate-180 text-blue-500' : ''}`} />
                      </div>
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute z-50 mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] p-1.5 animate-in fade-in zoom-in-95 duration-200 origin-top overflow-hidden">
                        <div className="space-y-1">
                          {activeQuiz.parts.map((part) => {
                            const attemptsUsed = partAttempts[part] || 0;
                            const isLimitReached = attemptsUsed >= 3;
                            return (
                              <button
                                key={part}
                                type="button"
                                disabled={isLimitReached}
                                onClick={() => {
                                  setFormData(prev => ({ ...prev, part }));
                                  setIsDropdownOpen(false);
                                }}
                                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-between group/item
                                  ${formData.part === part
                                    ? 'bg-blue-50 text-blue-600 font-bold'
                                    : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'}
                                  ${isLimitReached ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}`}
                              >
                                <span className="text-sm">
                                  {part}
                                </span>

                                {isLimitReached ? (
                                  <span className="text-[10px] font-bold uppercase tracking-tight text-red-500 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">Limit Reached</span>
                                ) : (
                                  formData.part === part && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]"></div>
                                  )
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                    Initializing...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Start Quiz
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
