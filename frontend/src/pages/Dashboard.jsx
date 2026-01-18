import { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  RotateCcw,
  Trophy,
  Award,
  Loader2,
  Send,
  User,
  Book,
  Target,
  ShieldAlert,
  Clock
} from "lucide-react";
import CustomSwal from "../utils/swalHelper";
import { formatText } from "../utils/formatText";
import { useSecurity } from "../contexts/SecurityContext";
import NotFound from "./NotFound";

function Dashboard() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [activeSet, setActiveSet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false); // ✅ show loader while sending
  const [showRules, setShowRules] = useState(true);
  const [showRoundInstructions, setShowRoundInstructions] = useState(false);
  const [roundsData, setRoundsData] = useState(null);
  const [fetchingQuestions, setFetchingQuestions] = useState(false);
  const [activeRoundIndex, setActiveRoundIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [initialTimeLeft, setInitialTimeLeft] = useState(null);
  const [roundTimings, setRoundTimings] = useState({}); // { roundName: secondsTaken }
  const [roundStartTime, setRoundStartTime] = useState(null); // timestamp when round actually started
  const [activeResultTab, setActiveResultTab] = useState(null);

  const hasInitialized = useRef(false);

  const API_BASE_URL =
    typeof import.meta !== "undefined" &&
      import.meta.env &&
      import.meta.env.MODE === "production"
      ? ""
      : "http://localhost:3000";

  // Format question text specifically to highlight code blocks
  const formatQuestionText = (text) => {
    let formatted = formatText(text);

    // Heuristic: Check for C-like code patterns
    const codeKeywords = ["int", "char", "float", "double", "void", "for", "while", "if", "switch", "printf", "cout", "cin", "#include"];
    const regex = new RegExp(`(^|[\\s\\.\\?\\!] )(${codeKeywords.join("|")})\\s+.*[;\\{\\}]`, "i");

    const match = formatted.match(regex);

    if (match) {
      const keyword = match[2];
      const relativeIndex = match[0].indexOf(keyword);
      const startIndex = match.index + relativeIndex;

      const plainText = formatted.substring(0, startIndex);
      const codePart = formatted.substring(startIndex);

      return (
        <div className="question-content">
          <div dangerouslySetInnerHTML={{ __html: plainText }} />
          <pre><code>{codePart.replace(/<br \/>/g, '\n').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')}</code></pre>
        </div>
      );
    }

    return <div className="question-content" dangerouslySetInnerHTML={{ __html: formatted }} />;
  };

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const fetchRoundsForPart = async (part) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/quiz/rounds/${part}`);
      if (!response.ok) {
        throw new Error("Failed to fetch rounds for this part");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching rounds:", error);
      throw error;
    }
  };

  const fetchQuestionsForSets = async (roundData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/questions`);
      if (!response.ok) {
        throw new Error("Failed to fetch questions");
      }
      const allQuestions = await response.json();

      let combinedQuestions = [];

      roundData.rounds.forEach(round => {
        const roundSets = round.selectedSets.map(s => s.name);
        const roundQuestions = allQuestions.filter(q => {
          // q.set is populated as an object by the backend, extract .name
          const setName = q.set && typeof q.set === 'object' ? q.set.name : q.set;
          return roundSets.includes(setName);
        });

        // Tag questions with their round info (points, etc.)
        const taggedQuestions = roundQuestions.map(q => ({
          ...q,
          positivePoints: round.positivePoints,
          negativePoints: round.negativePoints,
          roundName: round.name
        }));

        // Shuffle questions within this round only
        const shuffledRoundQuestions = shuffleArray(taggedQuestions);

        combinedQuestions = [...combinedQuestions, ...shuffledRoundQuestions];
      });

      if (combinedQuestions.length === 0) {
        throw new Error("No questions found for the selected rounds.");
      }

      return combinedQuestions;
    } catch (error) {
      console.error("Error fetching questions:", error);
      throw error;
    }
  };

  const processQuestions = (questionsArray) =>
    questionsArray.map((q) => {
      // Shuffle the options array
      const shuffledOptions = shuffleArray(q.options);

      // Find the new index of the correct answer after shuffling
      const correctAnswerIndex = shuffledOptions.findIndex(
        (opt) => opt === q.correctAnswer
      );

      return {
        ...q,
        options: shuffledOptions,
        correctAnswerIndex,
      };
    });

  const initializeQuiz = async () => {
    setLoading(true);
    setError(null);
    setQuestions([]);
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setActiveRoundIndex(0); // Reset round index
    setRoundTimings({});
    setRoundStartTime(null);
    setActiveResultTab(null);

    try {
      const userStr = sessionStorage.getItem("user");
      if (!userStr) throw new Error("User session not found");
      const user = JSON.parse(userStr);

      if (!user.quizPart) {
        throw new Error("No quiz part selected. Please go back and select a part.");
      }

      const roundData = await fetchRoundsForPart(user.quizPart);
      setRounds(roundData.rounds);

      const rawQuestions = await fetchQuestionsForSets(roundData);

      // Removed global shuffleArray call - shuffling is now per-round in fetchQuestionsForSets
      setQuestions(processQuestions(rawQuestions));
      return roundData.rounds;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const captureRoundTiming = () => {
    const currentRound = rounds[activeRoundIndex];
    if (!currentRound) return roundTimings;

    let timeTaken = 0;
    if (initialTimeLeft !== null) {
      // For timed rounds
      timeTaken = initialTimeLeft - (timeLeft || 0);
    } else if (roundStartTime) {
      // For unlimited rounds
      timeTaken = Math.floor((Date.now() - roundStartTime) / 1000);
    }

    const updated = {
      ...roundTimings,
      [currentRound.name || `Round ${activeRoundIndex + 1}`]: timeTaken
    };

    setRoundTimings(updated);
    return updated;
  };

  const handleTimerFinish = async () => {
    captureRoundTiming();
    setTimeLeft(null);

    await CustomSwal.fire({
      title: "Time's Up!",
      text: "The time for this round has finished. Moving to the next round.",
      icon: "warning",
      confirmButtonText: "OK",
      allowOutsideClick: false,
    });

    if (activeRoundIndex < rounds.length - 1) {
      const nextRoundIndex = activeRoundIndex + 1;
      const nextRoundName = rounds[nextRoundIndex]?.name;
      const nextQuestionIndex = questions.findIndex(q => q.roundName === nextRoundName);

      setActiveRoundIndex(nextRoundIndex);
      setShowRoundInstructions(true);
      if (nextQuestionIndex !== -1) {
        setCurrentQuestion(nextQuestionIndex);
      } else {
        setCurrentQuestion(prev => prev + 1);
      }
    } else {
      handleSubmit();
    }
  };

  const formatTime = (seconds) => {
    if (seconds === null) return "Unlimited";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const startTimerForRound = (round) => {
    setRoundStartTime(Date.now());
    if (round && round.timer) {
      const totalSeconds =
        (round.timer.hours || 0) * 3600 +
        (round.timer.minutes || 0) * 60 +
        (round.timer.seconds || 0);
      if (totalSeconds > 0) {
        setTimeLeft(totalSeconds);
        setInitialTimeLeft(totalSeconds);
      } else {
        setTimeLeft(null);
        setInitialTimeLeft(null);
      }
    } else {
      setTimeLeft(null);
      setInitialTimeLeft(null);
    }
  };

  useEffect(() => {
    let interval;
    if (timeLeft !== null && timeLeft > 0 && !showResults && !showRoundInstructions && !showRules) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerFinish();
    }
    return () => clearInterval(interval);
  }, [timeLeft, showResults, showRoundInstructions, showRules]);

  // Quiz starts only when user clicks Start Quiz button
  // No auto-initialization

  const handleOptionSelect = (index) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion]: index,
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1)
      setCurrentQuestion((q) => q + 1);
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) setCurrentQuestion((q) => q - 1);
  };

  const handleSubmit = async () => {
    const updatedTimings = captureRoundTiming();
    setShowResults(true);
    sessionStorage.setItem('quizCompleted', 'true'); // Allow tab switching on results page
    setTimeLeft(null);

    // ✅ Sync score and time taken to DB immediately on submission
    const user = JSON.parse(sessionStorage.getItem("user")) || {};
    const score = calculateScore();
    const total = calculateTotalPoints();

    try {
      await fetch(`${API_BASE_URL}/api/users/update-score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email || 'john.doe@example.com',
          score,
          total,
          quizName: user.quizName || activeSet?.name || "Quiz",
          quizPart: user.quizPart,
          roundTimings: Object.entries(updatedTimings).map(([name, time]) => ({
            roundName: name,
            timeTaken: time
          }))
        }),
      });
    } catch (err) {
      console.warn("Auto-sync score failed:", err);
    }
  };

  const handleRestart = async () => {
    // Disabled while sending — guard here as well
    if (sending) return;

    try {
      const user = JSON.parse(sessionStorage.getItem("user")) || {};
      const { name, email } = user;

      if (!name || !email) {
        await CustomSwal.fire({
          title: "Session Error",
          text: "User information not found. Please login again.",
          icon: "error",
          confirmButtonText: "OK",
        });
        return;
      }

      // Regular user - check attempts
      const attemptsResponse = await fetch(`${API_BASE_URL}/api/users/check-attempts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email }),
      });

      if (!attemptsResponse.ok) {
        throw new Error(`HTTP error! status: ${attemptsResponse.status}`);
      }

      const attemptsData = await attemptsResponse.json();

      if (!attemptsData.canAttempt) {
        // User has exhausted attempts
        let countdownInterval;

        await CustomSwal.fire({
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
        return;
      }

      // User can attempt - show remaining attempts
      const completedAttempts = attemptsData.currentAttempts;
      const nextAttemptNumber = completedAttempts + 1;

      const result = await CustomSwal.fire({
        title: completedAttempts === 0 ? "Start Quiz?" : "Retake Quiz?",
        html: `<p>${completedAttempts === 0 ? 'Ready to start your first quiz?' : 'You can attempt the quiz again.'}</p>
               <p style="font-size: 1.2em; font-weight: bold; color: #3b82f6;">Attempt #${nextAttemptNumber} of 3</p>
               <p style="font-size: 0.9em; color: #6b7280;">Completed: ${completedAttempts} | Remaining: ${3 - nextAttemptNumber}</p>`,
        icon: "info",
        confirmButtonText: "Start Quiz",
        showCancelButton: true,
        cancelButtonText: "Cancel",
      });

      if (!result.isConfirmed) {
        return;
      }

      // Record the new attempt
      const recordResponse = await fetch(`${API_BASE_URL}/api/users/record-attempt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          quizName: user.quizName,
          quizPart: user.quizPart
        }),
      });

      if (!recordResponse.ok) {
        const errorData = await recordResponse.json();
        if (recordResponse.status === 429) {
          await CustomSwal.fire({
            title: "Daily Limit Reached!",
            text: "You have used all 3 attempts for today.",
            icon: "warning",
            confirmButtonText: "OK",
          });
          return;
        }
        throw new Error(errorData.message || "Failed to record attempt");
      }
      // Proceed with quiz restart - re-initialize to shuffle questions and options
      await initializeQuiz();
      setShowResults(false);
      setShowRules(true);
      setTimeLeft(null);
      sessionStorage.removeItem('quizCompleted'); // Re-enable tab switching protection
    } catch (err) {
      console.error("Error checking attempts:", err);
      await CustomSwal.fire({
        title: "Connection Error",
        text: "Unable to verify attempts. Please check your internet connection.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const calculateScore = () => {
    let totalScore = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswerIndex) {
        totalScore += (q.positivePoints || 1);
      } else if (answers[i] !== undefined) {
        totalScore -= (q.negativePoints || 0);
      }
    });
    return Math.max(0, totalScore);
  };

  const calculateTotalPoints = () => {
    return questions.reduce((acc, q) => acc + (q.positivePoints || 1), 0);
  };

  const getScoreColor = (score) => {
    const total = calculateTotalPoints();
    const percentage = (score / total) * 100;
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreMessage = (score) => {
    const total = calculateTotalPoints();
    const percentage = (score / total) * 100;
    if (percentage === 100) return "Perfect! Outstanding work! 🎉";
    if (percentage >= 80) return "Excellent! Great job! 👏";
    if (percentage >= 60) return "Good work! Keep it up! 👍";
    return "Keep practicing! You can do better! 💪";
  };

  // ✅ Generate certificate - backend overlays name on template image
  const handleGenerateCertificate = async () => {
    const user = JSON.parse(sessionStorage.getItem("user")) || {};
    const score = calculateScore();
    const total = calculateTotalPoints();

    const dateStr = new Date().toLocaleDateString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }).replace(/\//g, '.');

    try {
      setSending(true);

      // Send data to backend - backend will overlay name on certificate template
      const payload = {
        name: user.name || "John Doe",
        email: user.email || "john.doe@example.com",
        quizName: user.quizName || activeSet?.name || "Quiz",
        date: dateStr
      };

      const resCert = await fetch(`${API_BASE_URL}/api/certificate/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!resCert.ok) {
        const errorData = await resCert.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Server returned ${resCert.status}`
        );
      }

      const certData = await resCert.json();
      const emailSent = certData.emailSent !== false;

      // Update score in database
      const scoreResponse = await fetch(`${API_BASE_URL}/api/users/update-score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email || 'john.doe@example.com',
          score,
          total,
          quizName: user.quizName || activeSet?.name || "Quiz",
          quizPart: user.quizPart,
          roundTimings: Object.entries(roundTimings).map(([name, time]) => ({
            roundName: name,
            timeTaken: time
          }))
        }),
      });

      if (!scoreResponse.ok) {
        console.warn("Failed to update score in database:", await scoreResponse.text());
      }

      // Success popup
      await CustomSwal.fire({
        title: emailSent ? "Certificate Sent! 🎉" : "Certificate Generated! 🎉",
        text: emailSent
          ? "Your certificate has been emailed. Please check your inbox and spam folder."
          : "Your certificate has been generated successfully. If you don't receive the email, please contact support.",
        icon: "success",
        confirmButtonText: "OK",
      });

      // Prepare redirect
      try {
        if (typeof sessionStorage !== "undefined") {
          sessionStorage.setItem("canViewThankYou", "true");
          sessionStorage.setItem("postRedirectClear", "true");
        }
      } catch (e) {
        console.warn("Session storage not available:", e);
      }

      window.location.assign("/thank-you");
    } catch (err) {
      console.error("Error in certificate flow:", err);
      CustomSwal.fire({
        title: "Error",
        text:
          err.message ||
          "Could not complete the certificate process. Please try again later.",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setSending(false);
    }
  };

  // Rules & Regulations UI
  if (showRules) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl bg-white rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] p-12 border border-blue-50/50">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-slate-800 mb-3 tracking-tight">Quiz Rules & Regulations</h1>
            <p className="text-slate-500 font-medium text-lg">Please read carefully before starting the quiz</p>
          </div>

          <div className="space-y-5 mb-12 max-w-2xl mx-auto">
            {[
              { id: 1, title: "No Cheating Allowed", desc: "Opening developer tools or switching tabs will result in automatic submission." },
              { id: 2, title: "Answer All Questions", desc: "You must answer all questions to submit. Unanswered will be marked incorrect." },
              { id: 3, title: "Review Your Answers", desc: "Use the Previous and Next buttons to navigate and review before submitting." },
              { id: 4, title: "One Submission Only", desc: "Once submitted, you cannot change your answers. Make sure to review." },
              { id: 5, title: "Stay Focused", desc: "Ensure stable internet connection and minimize distractions during the quiz." },
              { id: 6, title: "Certificate Eligibility", desc: "Certificates will be generated based on your final score after completion." }
            ].map((rule) => (
              <div key={rule.id} className="flex items-start gap-4 group hover:translate-x-1 transition-transform">
                <div className="shrink-0 w-8 h-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm border border-blue-200/50 shadow-sm">
                  {rule.id}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base mb-0.5">{rule.title}</h3>
                  <p className="text-slate-500 text-sm font-medium leading-tight">{rule.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            {fetchingQuestions ? (
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin"></div>
                </div>
                <span className="text-slate-500 font-bold">Synchronizing Quiz...</span>
              </div>
            ) : (
              <button
                onClick={async () => {
                  try {
                    setFetchingQuestions(true);
                    const user = JSON.parse(sessionStorage.getItem("user")) || {};
                    const { name, email, quizPart } = user;

                    if (!name || !email) {
                      await CustomSwal.fire({
                        title: "Session Error",
                        text: "User information not found. Please login again.",
                        icon: "error",
                        confirmButtonText: "OK",
                      });
                      setFetchingQuestions(false);
                      return;
                    }

                    if (!quizPart) {
                      await CustomSwal.fire({
                        title: "Error",
                        text: "No quiz part selected. Please go back and select a part.",
                        icon: "error",
                        confirmButtonText: "OK",
                      });
                      setFetchingQuestions(false);
                      return;
                    }

                    // Fetch rounds data to show instructions
                    const roundData = await fetchRoundsForPart(quizPart);
                    setRoundsData(roundData);
                    setShowRules(false);
                    setShowRoundInstructions(true);
                  } catch (err) {
                    console.error("Error fetching round data:", err);
                    await CustomSwal.fire({
                      title: "Error",
                      text: "Unable to load quiz information. Please try again.",
                      icon: "error",
                      confirmButtonText: "OK",
                    });
                  } finally {
                    setFetchingQuestions(false);
                  }
                }}
                className="w-full max-w-sm bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-3 active:scale-[0.98] shadow-lg shadow-blue-500/25"
              >
                <Send className="w-5 h-5" />
                Start Quiz
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Round Instructions UI
  if (showRoundInstructions && roundsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-5xl bg-white rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] p-12 border border-blue-50/50">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-black text-slate-800 mb-3 tracking-tight">Round Instructions</h1>
            <p className="text-slate-500 font-medium text-lg">Please read the instructions for each round carefully</p>
          </div>

          <div className="space-y-6 mb-12 max-w-4xl mx-auto">
            {roundsData.rounds && roundsData.rounds[activeRoundIndex] ? (
              (() => {
                const round = roundsData.rounds[activeRoundIndex];
                const index = activeRoundIndex;
                return (
                  <div
                    key={round._id || index}
                    className="mb-8 last:mb-0"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-800 text-lg mb-2">{round.name || `Round ${index + 1}`}</h3>
                        {round.description ? (
                          <div
                            className="round-description"
                            dangerouslySetInnerHTML={{ __html: round.description }}
                          />
                        ) : (
                          <p className="text-slate-500 italic text-sm">No special instructions for this round.</p>
                        )}
                        <div className="mt-3 flex flex-wrap gap-3 text-xs font-medium">
                          <span className="bg-green-50 text-green-700 px-2.5 py-1 rounded-md border border-green-100">
                            +{round.positivePoints} correct
                          </span>
                          {round.negativePoints > 0 && (
                            <span className="bg-red-50 text-red-700 px-2.5 py-1 rounded-md border border-red-100">
                              -{round.negativePoints} wrong
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-500 font-medium">No instructions available for this round.</p>
              </div>
            )}
          </div>

          <div className="flex justify-center gap-4">
            {activeRoundIndex === 0 && (
              <button
                onClick={() => {
                  setShowRoundInstructions(false);
                  setShowRules(true);
                }}
                className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition-all"
              >
                Back to Rules
              </button>
            )}
            <button
              onClick={async () => {
                if (activeRoundIndex === 0) {
                  try {
                    setFetchingQuestions(true);
                    const fetchedRounds = await initializeQuiz();
                    setShowRoundInstructions(false);
                    if (fetchedRounds && fetchedRounds[0]) {
                      startTimerForRound(fetchedRounds[0]);
                    }
                  } catch (err) {
                    console.error("Error starting quiz:", err);
                    await CustomSwal.fire({
                      title: "Error",
                      text: "Unable to start quiz. Please try again.",
                      icon: "error",
                      confirmButtonText: "OK",
                    });
                  } finally {
                    setFetchingQuestions(false);
                  }
                } else {
                  setShowRoundInstructions(false);
                  if (rounds && rounds[activeRoundIndex]) {
                    startTimerForRound(rounds[activeRoundIndex]);
                  }
                }
              }}
              disabled={fetchingQuestions}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all flex items-center gap-3 active:scale-[0.98] shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {fetchingQuestions ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Loading Quiz...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Start Round
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading UI
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
      </div>
    );
  }

  // Error UI
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-xl shadow-xl p-8 border border-gray-100">
            <div className="text-center">
              <XCircle className="h-12 w-12 mx-auto mb-4 text-red-600" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Unable to Load Quiz
              </h2>
              <p className="text-gray-600 mb-4 whitespace-pre-line">{error}</p>
              <button
                onClick={initializeQuiz}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Results UI
  if (showResults) {
    const score = calculateScore();
    const totalPoints = calculateTotalPoints();
    const percentage = Math.round((score / totalPoints) * 100) || 0; // Handle 0/0 case

    const totalQuestions = questions.length;
    const correctCount = questions.filter((q, i) => answers[i] === q.correctAnswerIndex).length;
    const incorrectCount = questions.filter((q, i) => answers[i] !== undefined && answers[i] !== q.correctAnswerIndex).length;
    const skippedCount = totalQuestions - correctCount - incorrectCount;

    // Get unique rounds from questions to create tabs
    const resultRounds = [...new Set(questions.map(q => q.roundName || 'Round'))];

    // Set initial tab if not set
    if (!activeResultTab && resultRounds.length > 0) {
      setActiveResultTab(resultRounds[0]);
    }

    return (
      <div className="min-h-screen bg-[#f8fafc] py-8 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Results Hero Header */}
          <div className="relative overflow-hidden bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 p-6 sm:p-8">
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-50"></div>

            <div className="relative flex flex-col items-center text-center">
              <div className={`p-4 rounded-2xl bg-white shadow-lg mb-4 transform -rotate-2 hover:rotate-0 transition-transform duration-500`}>
                <Trophy className={`w-12 h-12 ${getScoreColor(score)}`} />
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2 tracking-tight">Quiz Results</h1>
              <p className="text-base text-slate-500 font-medium max-w-2xl">{getScoreMessage(score)}</p>
            </div>

            {/* Stats Highlighting */}
            <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-3 mt-8">
              <div className="bg-slate-50/50 backdrop-blur-sm p-4 rounded-xl border border-slate-100 flex flex-col items-center text-center group hover:bg-white hover:shadow-lg transition-all duration-300">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Final Score</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-slate-900">{score}</span>
                  <span className="text-slate-400 font-bold text-xs">/ {totalPoints}</span>
                </div>
              </div>

              <div className="bg-blue-50/30 backdrop-blur-sm p-4 rounded-xl border border-blue-100/50 flex flex-col items-center text-center group hover:bg-white hover:shadow-lg transition-all duration-300">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400 mb-1">Accuracy</span>
                <span className="text-2xl font-black text-blue-600">{percentage}%</span>
              </div>

              <div className="bg-emerald-50/30 backdrop-blur-sm p-4 rounded-xl border border-emerald-100/50 flex flex-col items-center text-center group hover:bg-white hover:shadow-lg transition-all duration-300">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-1">Correct</span>
                <span className="text-2xl font-black text-emerald-600">{correctCount}</span>
              </div>

              <div className="bg-rose-50/30 backdrop-blur-sm p-4 rounded-xl border border-rose-100/50 flex flex-col items-center text-center group hover:bg-white hover:shadow-lg transition-all duration-300">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-rose-500 mb-1">Incorrect</span>
                <span className="text-2xl font-black text-rose-600">{incorrectCount}</span>
              </div>
            </div>

            {/* Main Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
              <button
                onClick={handleRestart}
                disabled={sending}
                className="group relative flex items-center justify-center gap-3 px-8 py-3.5 bg-slate-900 hover:bg-black text-white font-bold rounded-xl transition-all duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.15)] active:scale-[0.98] w-full sm:w-auto overflow-hidden text-sm"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-slate-800 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <RotateCcw className="relative w-4 h-4 group-hover:rotate-[-45deg] transition-transform duration-500" />
                <span className="relative">Take it Again</span>
              </button>

              <button
                onClick={handleGenerateCertificate}
                disabled={sending}
                className="group relative flex items-center justify-center gap-3 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all duration-300 hover:shadow-[0_10px_30px_rgba(37,99,235,0.3)] active:scale-[0.98] w-full sm:w-auto text-sm"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Award className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span>
                      {(() => {
                        const userData = JSON.parse(sessionStorage.getItem("user") || "{}");
                        const isAdmin = userData.name?.toLowerCase() === 'admin' && userData.email?.toLowerCase() === 'admin@gmail.com';
                        return isAdmin ? 'Finish Quiz' : 'Get my Certificate';
                      })()}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Review Section */}
          <div className="space-y-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4 px-2">
                <div className="h-px flex-1 bg-slate-200"></div>
                <h2 className="text-lg font-black text-slate-800 tracking-tight uppercase">Detailed Performance Review</h2>
                <div className="h-px flex-1 bg-slate-200"></div>
              </div>

              {/* Round Tabs */}
              <div className="flex flex-wrap justify-center gap-2 px-2">
                {resultRounds.map((roundName) => (
                  <button
                    key={roundName}
                    onClick={() => setActiveResultTab(roundName)}
                    className={`px-5 py-2 rounded-lg font-bold text-xs transition-all duration-300 border-2 
                      ${activeResultTab === roundName
                        ? "bg-blue-600 border-blue-600 text-white shadow-[0_8px_15px_rgba(37,99,235,0.15)]"
                        : "bg-white border-slate-100 text-slate-500 hover:border-blue-200 hover:text-blue-600"
                      }`}
                  >
                    {roundName}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 transition-all duration-500">
              {questions
                .map((q, i) => ({ ...q, originalIndex: i }))
                .filter(q => q.roundName === activeResultTab)
                .map((q) => {
                  const i = q.originalIndex;
                  const userAnswerIndex = answers[i];
                  const isCorrect = userAnswerIndex === q.correctAnswerIndex;
                  const isSkipped = userAnswerIndex === undefined;

                  return (
                    <div key={q._id || i} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden">
                      <div className="p-4 sm:p-5 flex-1">
                        {/* Question Header */}
                        <div className="flex items-center justify-between gap-3 mb-4">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500">
                              {i + 1}
                            </span>
                            {q.roundName && (
                              <span className="text-[9px] font-black uppercase tracking-wider text-blue-600 px-2 py-0.5 bg-blue-50 rounded border border-blue-100/50">
                                {q.roundName}
                              </span>
                            )}
                          </div>
                          <div className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full
                          ${isSkipped ? 'bg-slate-100 text-slate-500' : isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                            {isSkipped ? 'Skipped' : isCorrect ? `Score +${q.positivePoints}` : `Penalty -${q.negativePoints}`}
                          </div>
                        </div>

                        <div className="mb-4">
                          <h3 className="text-base font-bold text-slate-800 leading-snug break-words">
                            <span className="question-content" dangerouslySetInnerHTML={{ __html: formatQuestionText(q.question) }} />
                          </h3>
                        </div>

                        <div className="space-y-2">
                          {q.options.map((option, idx) => {
                            const isUserAnswer = userAnswerIndex === idx;
                            const isCorrectAnswer = idx === q.correctAnswerIndex;

                            let stateClasses = "bg-slate-50 border-slate-100 text-slate-600";
                            let icon = <div className="w-4 h-4 rounded-full border-2 border-slate-200 flex-shrink-0"></div>;

                            if (isCorrectAnswer) {
                              stateClasses = "bg-emerald-50/50 border-emerald-200 text-emerald-800 shadow-[0_0_10px_rgba(16,185,129,0.02)]";
                              icon = <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />;
                            } else if (isUserAnswer && !isCorrectAnswer) {
                              stateClasses = "bg-rose-50/50 border-rose-200 text-rose-800 shadow-[0_0_10px_rgba(244,63,94,0.02)]";
                              icon = <XCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />;
                            }

                            return (
                              <div key={idx} className={`relative flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-300 ${stateClasses}`}>
                                {icon}
                                <div className="flex-1 text-[13px] font-medium leading-relaxed">
                                  {isUserAnswer && <span className="font-black text-[9px] uppercase opacity-60 mr-2">[Your Pick]</span>}
                                  {isCorrectAnswer && !isUserAnswer && <span className="font-black text-[9px] uppercase opacity-60 mr-2">[Correct Answer]</span>}
                                  <span dangerouslySetInnerHTML={{ __html: formatText(option) }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

        </div>
      </div>
    );

  }

  if (questions.length === 0) {
    return null;
  }

  const isFirstQuestion = currentQuestion === 0;
  const isLastQuestion = currentQuestion === questions.length - 1;
  const hasAnswered = answers[currentQuestion] !== undefined;

  const currentRoundName = questions[currentQuestion]?.roundName;
  const nextRoundName = questions[currentQuestion + 1]?.roundName;
  const isLastOfRound = !isLastQuestion && (nextRoundName && nextRoundName !== currentRoundName);

  // Calculate progress relative to current round
  const roundQuestionsCount = questions.filter(q => q.roundName === currentRoundName).length;
  const roundStartIndex = questions.findIndex(q => q.roundName === currentRoundName);
  const currentQuestionInRound = currentQuestion - roundStartIndex + 1;
  const progressPercent = Math.round((currentQuestionInRound / roundQuestionsCount) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-xl shadow-xl p-4 lg:p-8 border border-gray-100">
          {/* Progress Bar */}
          <div className="mb-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
              <span className="text-sm font-medium text-gray-600">
                Question {currentQuestionInRound} of {roundQuestionsCount} <span className="text-xs text-gray-400 ml-1">(Round {activeRoundIndex + 1})</span>
              </span>
              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                {timeLeft !== null && (
                  <div className={`flex items-center gap-3 px-4 py-1.5 rounded-2xl border backdrop-blur-md transition-all duration-300 shadow-sm
                    ${timeLeft < 60
                      ? 'bg-red-50/90 border-red-200 shadow-red-100'
                      : 'bg-white/80 border-blue-100/50 shadow-blue-50/50'}`}>
                    <div className="relative">
                      <Clock className={`w-5 h-5 ${timeLeft < 60 ? 'text-red-500 animate-[pulse_1s_infinite]' : 'text-blue-500'}`} />
                      {timeLeft < 60 && (
                        <span className="absolute inset-0 w-full h-full bg-red-400 rounded-full animate-ping opacity-20"></span>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-sm font-mono font-black tracking-tight leading-none
                        ${timeLeft < 60 ? 'text-red-600' : 'text-slate-700 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'}`}>
                        {formatTime(timeLeft)}
                      </span>
                    </div>
                  </div>
                )}
                <span className="text-sm font-medium text-gray-600">
                  {progressPercent}%
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{
                  width: `${progressPercent}%`,
                }}
              ></div>
            </div>
          </div>
          {/* Question */}
          <div className="mb-8">
            <div className="mb-4">
              <span className="text-sm text-blue-600 font-semibold">
                Question {currentQuestion + 1}
              </span>
            </div>
            <div className="text-xl font-bold text-gray-900 mb-6 leading-tight">
              {formatQuestionText(questions[currentQuestion]?.question)}
            </div>
            {/* Options */}
            <div className="space-y-3">
              {questions[currentQuestion]?.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleOptionSelect(index)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md active:scale-95 ${answers[currentQuestion] === index
                    ? "border-blue-500 bg-blue-50 text-blue-900"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base font-medium leading-tight pr-2" dangerouslySetInnerHTML={{ __html: formatText(option) }} />
                    {answers[currentQuestion] === index && (
                      <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
          {/* Navigation Buttons */}
          <div className="flex justify-between items-center gap-3">
            <button
              onClick={handlePrevious}
              disabled={isFirstQuestion}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${isFirstQuestion
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-md transform hover:scale-105 active:scale-95"
                }`}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden xs:inline">Previous</span>
              <span className="xs:hidden">Prev</span>
            </button>
            {isLastQuestion || isLastOfRound ? (
              <button
                onClick={isLastQuestion ? handleSubmit : () => {
                  captureRoundTiming();
                  setActiveRoundIndex(prev => prev + 1);
                  setShowRoundInstructions(true);
                  setCurrentQuestion(prev => prev + 1);
                  setTimeLeft(null);
                }}
                disabled={!hasAnswered}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${hasAnswered
                  ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white hover:shadow-lg transform hover:scale-105 active:scale-95"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
              >
                <CheckCircle className="h-4 w-4" />
                <span className="hidden xs:inline">{isLastQuestion ? "Complete Quiz" : "Submit & Next Round"}</span>
                <span className="xs:hidden">{isLastQuestion ? "Complete" : "Next Round"}</span>
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!hasAnswered}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${hasAnswered
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white hover:shadow-lg transform hover:scale-105 active:scale-95"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
              >
                <span className="hidden xs:inline">Next</span>
                <span className="xs:hidden">Next</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Navigate back to review your answers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Custom CSS for Round Instructions
const roundInstructionsStyles = `
  .round-description {
    color: #475569;
    line-height: 1.6;
    font-size: 0.95rem;
    font-family: inherit;
  }

  /* Force hide H1 and H2 to avoid duplicate titles */
  .round-description h1,
  .round-description h2 {
    display: none !important;
  }

  .round-description h3 {
    font-size: 1.1rem;
    font-weight: 700;
    color: #1e293b;
    margin-top: 1.25rem;
    margin-bottom: 0.75rem;
    letter-spacing: -0.01em;
  }

  /* Paragraphs */
  .round-description p {
    margin-bottom: 0.75rem;
    color: #475569;
  }

  .round-description p:last-child {
    margin-bottom: 0;
  }

  /* Lists Container */
  .round-description ul,
  .round-description ol {
    margin: 0.75rem 0;
    padding-left: 0.5rem; /* Slight indent from text */
    list-style: none;
  }

  /* List Items */
  .round-description li {
    position: relative;
    padding-left: 1.75rem; /* Space for bullet/number */
    margin-bottom: 0.5rem;
    color: #475569;
    line-height: 1.6;
  }

  /* Unordered List Bullets */
  .round-description ul > li::before {
    content: "•";
    position: absolute;
    left: 0.5rem;
    top: -0.1em; /* Optical alignment */
    color: #2563eb;
    font-weight: bold;
    font-size: 1.5rem; /* Larger bullet */
    line-height: 1.5rem;
  }

  /* Ordered List Numbers */
  .round-description ol {
    counter-reset: list-counter;
  }
  
  .round-description ol > li {
    counter-increment: list-counter;
  }

  .round-description ol > li::before {
    content: counter(list-counter) ".";
    position: absolute;
    left: 0;
    top: 0;
    width: 1.5rem; /* Fixed width for alignment */
    text-align: right;
    margin-right: 0.25rem;
    color: #2563eb;
    font-weight: 700;
    font-size: 0.95rem;
  }

  /* Formatting */
  .round-description strong, 
  .round-description b {
    color: #0f172a;
    font-weight: 700;
  }
  
  .round-description em, 
  .round-description i {
    color: #475569;
    font-style: italic;
  }
  
  .round-description u {
    text-decoration-color: #93c5fd;
    text-decoration-thickness: 2px;
    text-underline-offset: 2px;
  }
`;



const questionStyles = `
  /* Code blocks in questions */
  .question-content pre {
    background-color: #1e293b; /* slate-800 */
    color: #e2e8f0; /* slate-200 */
    padding: 1.25rem;
    border-radius: 0.75rem;
    overflow-x: auto;
    margin: 1.5rem 0;
    white-space: pre-wrap;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace; 
    font-size: 0.9rem;
    line-height: 1.6;
    border: 1px solid #334155; /* slate-700 */
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  /* Inline code */
  .question-content :not(pre) > code {
    background-color: #f1f5f9; /* slate-100 */
    color: #0f172a; /* slate-900 */
    padding: 0.2rem 0.4rem;
    border-radius: 0.375rem;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 0.9em;
    font-weight: 600;
    border: 1px solid #e2e8f0;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleId = 'dashboard-custom-styles-v2';
  if (!document.getElementById(styleId)) {
    const styleTag = document.createElement('style');
    styleTag.id = styleId;
    styleTag.textContent = roundInstructionsStyles + questionStyles;
    document.head.appendChild(styleTag);
  }
}

// Wrap Dashboard with security check
export default function DashboardWrapper() {
  const { showError } = useSecurity();

  if (showError) {
    return <NotFound />;
  }

  return <Dashboard />;
}
