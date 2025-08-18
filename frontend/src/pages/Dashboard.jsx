import React, { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  RotateCcw,
  Trophy,
  Award,
  Loader2,
} from "lucide-react";
import Swal from "sweetalert2"; // ✅ use alerts

function Dashboard() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [activeSet, setActiveSet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sending, setSending] = useState(false); // ✅ show loader while sending

  const hasInitialized = useRef(false);

  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const fetchActiveSet = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/sets/active`);
      if (response.status === 404) {
        throw new Error(
          "No active question set found. Please contact administrator to activate a question set."
        );
      }
      if (!response.ok) {
        throw new Error("Failed to fetch active set");
      }
      return await response.json();
    } catch (error) {
      console.error("Error fetching active set:", error);
      throw error;
    }
  };

  const fetchQuestionsFromActiveSet = async (setId, setName) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/questions`);
      if (!response.ok) {
        throw new Error("Failed to fetch questions");
      }
      const allQuestions = await response.json();
      const setQuestions = allQuestions.filter(
        (q) => q.set && q.set._id === setId
      );
      if (setQuestions.length === 0) {
        throw new Error(
          `No questions found in the active set "${
            setName || "Unknown"
          }". Please add questions to this set.`
        );
      }
      return setQuestions;
    } catch (error) {
      console.error("Error fetching questions:", error);
      throw error;
    }
  };

  const processQuestions = (questionsArray) =>
    questionsArray.map((q) => ({
      ...q,
      correctAnswerIndex: q.options.findIndex((opt) => opt === q.correctAnswer),
    }));

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const initializeQuiz = async () => {
    setLoading(true);
    setError(null);
    setQuestions([]);
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    try {
      const activeSetData = await fetchActiveSet();
      setActiveSet(activeSetData);
      const rawQuestions = await fetchQuestionsFromActiveSet(
        activeSetData._id,
        activeSetData.name
      );
      setQuestions(shuffleArray(processQuestions(rawQuestions)));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      initializeQuiz();
    }
  }, []);

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

  const handleSubmit = () => setShowResults(true);

  const handleRestart = async () => {
    // Disabled while sending — guard here as well
    if (sending) return;
    setShowResults(false);
    await initializeQuiz();
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswerIndex) correct++;
    });
    return correct;
  };

  const getScoreColor = (score) => {
    const percentage = (score / questions.length) * 100;
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreMessage = (score) => {
    const percentage = (score / questions.length) * 100;
    if (percentage === 100) return "Perfect! Outstanding work! 🎉";
    if (percentage >= 80) return "Excellent! Great job! 👏";
    if (percentage >= 60) return "Good work! Keep it up! 👍";
    return "Keep practicing! You can do better! 💪";
  };

  // ✅ Generate PDF, save to DB, show popup, then redirect to /thank-you
  const handleGenerateCertificate = async () => {
    const user = JSON.parse(sessionStorage.getItem("user")) || {};
    const score = calculateScore();
    const total = questions.length;

    const dateStr = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    const payload = {
      name: user.name || "John Doe",
      email: user.email || "john.doe@example.com",
      score,
      total,
      date: dateStr,
      joinedOn: new Date().toISOString(),
      quizName: activeSet?.name || "Quiz",
    };

    try {
      setSending(true); // show button loader and disable retake

      // 1) Send certificate email
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

      // 2) Save user score to DB (authRoute /api/users)
      const resUser = await fetch(`${API_BASE_URL}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!resUser.ok) {
        const errorData = await resUser.json().catch(() => ({}));
        // If email already exists (409), show a friendlier message but still proceed
        if (resUser.status === 409) {
          await Swal.fire({
            title: "Already Recorded",
            text:
              errorData.message ||
              "This email already exists in the database. Proceeding with certificate.",
            icon: "info",
            confirmButtonColor: "#3b82f6",
          });
        } else {
          throw new Error(
            errorData.message || `Failed to save user: ${resUser.status}`
          );
        }
      }

      // 3) Success popup
      await Swal.fire({
        title: "Certificate Sent! 🎉",
        text: "Your certificate PDF has been emailed. Please check your inbox and spam folder.",
        icon: "success",
        confirmButtonColor: "#3b82f6",
      });

      // 4) Prepare redirect to thank-you, and defer session clearing
      try {
        if (typeof sessionStorage !== "undefined") {
          // Allow guarded /thank-you page
          sessionStorage.setItem("canViewThankYou", "true");
          // Set a one-time marker for clearing after redirect (optional)
          sessionStorage.setItem("postRedirectClear", "true");
        }
      } catch (e) {
        console.warn("Session storage not available:", e);
      }

      // 5) Go to thank-you
      window.location.assign("/thank-you");
      // If using react-router navigate:
      // navigate("/thank-you", { replace: true });
    } catch (err) {
      console.error("Error in certificate flow:", err);
      Swal.fire({
        title: "Error",
        text:
          err.message ||
          "Could not complete the certificate process. Please try again later.",
        icon: "error",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setSending(false);
    }
  };

  // Loading UI
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-xl shadow-xl p-8 border border-gray-100">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Loading Quiz...
              </h2>
              <p className="text-gray-600">
                Fetching questions, please wait...
              </p>
            </div>
          </div>
        </div>
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <div className="bg-white rounded-xl shadow-xl p-4 sm:p-6 lg:p-8 border border-gray-100">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <Trophy
                  className={`h-12 w-12 sm:h-16 sm:w-16 ${getScoreColor(
                    score
                  )}`}
                />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Quiz Complete!
              </h1>
              {activeSet && (
                <div className="mb-3">
                  <span className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold">
                    {activeSet.name}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    All {questions.length} questions completed
                  </p>
                </div>
              )}
              <p className={`text-lg font-semibold ${getScoreColor(score)}`}>
                You scored {score} out of {questions.length}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                {getScoreMessage(score)} (
                {Math.round((score / questions.length) * 100)}%)
              </p>
            </div>

            <div className="space-y-4 mb-8">
              {questions.map((q, i) => {
                const userAnswer = answers[i];
                const isCorrect = userAnswer === q.correctAnswerIndex;
                return (
                  <div
                    key={q._id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start gap-2 mb-4">
                      {isCorrect ? (
                        <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-600 mt-1 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="text-base font-semibold text-gray-900 flex-1">
                            <span className="text-blue-600">Q{i + 1}:</span>{" "}
                            {q.question}
                          </h3>
                        </div>
                        <div className="space-y-2">
                          {q.options.map((option, idx) => {
                            const isUserAnswer = userAnswer === idx;
                            const isCorrectAnswer =
                              idx === q.correctAnswerIndex;
                            let optionClass = "p-2 rounded-md border text-sm";
                            if (isCorrectAnswer) {
                              optionClass +=
                                " bg-green-50 border-green-200 text-green-800";
                            } else if (isUserAnswer && !isCorrect) {
                              optionClass +=
                                " bg-red-50 border-red-200 text-red-800";
                            } else {
                              optionClass +=
                                " bg-gray-50 border-gray-200 text-gray-600";
                            }
                            return (
                              <div key={idx} className={optionClass}>
                                <div className="flex items-center justify-between gap-2">
                                  <span className="flex-1">{option}</span>
                                  <div className="flex gap-2 flex-shrink-0">
                                    {isCorrectAnswer && (
                                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                                        Correct
                                      </span>
                                    )}
                                    {isUserAnswer && (
                                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                                        You
                                      </span>
                                    )}
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
              })}
            </div>

            <div className="text-center">
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={handleRestart}
                  disabled={sending}
                  className={`flex items-center gap-2 px-8 py-3 text-white font-semibold rounded-lg transition-all duration-200
                    bg-gradient-to-r from-blue-600 to-purple-600
                    ${
                      sending
                        ? "opacity-70 cursor-not-allowed"
                        : "hover:from-blue-700 hover:to-purple-700 hover:shadow-lg transform hover:scale-105 active:scale-95"
                    }`}
                  title={
                    sending
                      ? "Please wait while we send your certificate"
                      : "Retake the quiz"
                  }
                >
                  <RotateCcw className="h-4 w-4" />
                  Retake Quiz
                </button>

                <button
                  onClick={handleGenerateCertificate}
                  disabled={sending}
                  className={`flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg transition-all duration-200
                    ${
                      sending
                        ? "opacity-70 cursor-not-allowed"
                        : "hover:from-green-700 hover:to-emerald-700 hover:shadow-lg transform hover:scale-105 active:scale-95"
                    }`}
                >
                  {sending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Award className="h-4 w-4" />
                      Generate Certificate
                    </>
                  )}
                </button>
              </div>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-xl shadow-xl p-4 lg:p-8 border border-gray-100">
          {/* Progress Bar */}
          <div className="mb-5">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-gray-600">
                Question {currentQuestion + 1} of {questions.length}
              </span>
              <span className="text-sm font-medium text-gray-600">
                {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{
                  width: `${((currentQuestion + 1) / questions.length) * 100}%`,
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
            <h1 className="text-xl font-bold text-gray-900 mb-6 leading-tight">
              {questions[currentQuestion]?.question}
            </h1>
            {/* Options */}
            <div className="space-y-3">
              {questions[currentQuestion]?.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleOptionSelect(index)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md active:scale-95 ${
                    answers[currentQuestion] === index
                      ? "border-blue-500 bg-blue-50 text-blue-900"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base font-medium leading-tight pr-2">
                      {option}
                    </span>
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
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                isFirstQuestion
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-md transform hover:scale-105 active:scale-95"
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden xs:inline">Previous</span>
              <span className="xs:hidden">Prev</span>
            </button>
            {isLastQuestion ? (
              <button
                onClick={handleSubmit}
                disabled={!hasAnswered}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  hasAnswered
                    ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white hover:shadow-lg transform hover:scale-105 active:scale-95"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                <CheckCircle className="h-4 w-4" />
                <span className="hidden xs:inline">Complete Quiz</span>
                <span className="xs:hidden">Complete</span>
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!hasAnswered}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  hasAnswered
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

export default Dashboard;
