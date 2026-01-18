const express = require("express");
const router = express.Router();
const User = require("../models/authModel");
const socketClient = require("../services/socketClient");

router.get("/", async (req, res) => {
  try {
    const users = await User.find().sort({ joinedOn: -1 });
    return res.json(users);
  } catch (err) {
    console.error("Get users error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/check-email", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({
      email: { $regex: `^${normalizedEmail}$`, $options: "i" }
    });

    if (user) {
      return res.json({ exists: true, user });
    } else {
      return res.json({ exists: false });
    }
  } catch (err) {
    console.error("Check email error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/check-attempts", async (req, res) => {
  try {
    const { email, quizPart, hasParts } = req.body || {};
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({
      email: { $regex: `^${normalizedEmail}$`, $options: "i" },
    }).sort({ lastAttemptDate: -1 });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Calculate attempts today from the attempts array
    const attemptsToday = (user.attempts || []).filter(attempt => {
      const attemptDate = new Date(attempt.timestamp);
      const isToday = attemptDate.getFullYear() === today.getFullYear() &&
        attemptDate.getMonth() === today.getMonth() &&
        attemptDate.getDate() === today.getDate();
      return isToday;
    });

    // Create a map of attempts per part for today
    const partAttemptsMap = {};
    attemptsToday.forEach(a => {
      const p = a.quizPart || "default";
      partAttemptsMap[p] = (partAttemptsMap[p] || 0) + 1;
    });

    let currentAttempts = 0;
    if (hasParts && quizPart) {
      currentAttempts = partAttemptsMap[quizPart] || 0;
    } else if (hasParts && !quizPart) {
      // If we have parts but haven't selected one yet
      currentAttempts = 0;
    } else {
      // No parts - count total today
      currentAttempts = attemptsToday.length;
    }

    const canAttempt = currentAttempts < 3;
    const remainingAttempts = Math.max(0, 3 - currentAttempts);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const calculatedTimeUntilReset = tomorrow.getTime() - now.getTime();

    return res.status(200).json({
      canAttempt,
      currentAttempts,
      remainingAttempts,
      maxAttempts: 3,
      partAttempts: partAttemptsMap,
      timeUntilReset: canAttempt ? 0 : calculatedTimeUntilReset,
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Check attempts error:", err);
    return res.status(500).json({ message: "Server error checking attempts" });
  }
});

router.post("/record-attempt", async (req, res) => {
  try {
    const { name, email, quizName, quizPart } = req.body || {};
    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const recentUser = await User.findOne({
      email: { $regex: `^${normalizedEmail}$`, $options: "i" },
    }).sort({ createdAt: -1 });

    if (recentUser) {
      // Calculate daily attempts specifically for this part (if applicable) or total today
      const attemptsToday = (recentUser.attempts || []).filter(a => {
        const aDate = new Date(a.timestamp);
        const isToday = aDate.getFullYear() === today.getFullYear() &&
          aDate.getMonth() === today.getMonth() &&
          aDate.getDate() === today.getDate();
        if (!isToday) return false;
        if (quizPart) return a.quizPart === quizPart;
        return true;
      });

      const dailyAttemptsForThisContext = attemptsToday.length;

      if (dailyAttemptsForThisContext >= 3) {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const timeUntilReset = tomorrow.getTime() - now.getTime();

        return res.status(429).json({
          success: false,
          message: quizPart ? `Daily limit reached for ${quizPart}` : "Daily attempt limit reached",
          currentAttempts: dailyAttemptsForThisContext,
          remainingAttempts: 0,
          timeUntilReset,
        });
      }

      // Update existing user - only add to attempts array, don't overwrite top-level fields
      recentUser.dailyAttempts = dailyAttemptsForThisContext + 1;
      recentUser.lastAttemptDate = now;
      recentUser.name = name;

      // Only update top-level quizName/quizPart if this is the first attempt ever
      if (!recentUser.quizName) recentUser.quizName = quizName;
      if (!recentUser.quizPart) recentUser.quizPart = quizPart;

      if (!recentUser.attempts) recentUser.attempts = [];
      recentUser.attempts.push({
        attemptNumber: dailyAttemptsForThisContext + 1,
        timestamp: now,
        quizName: quizName || null,
        quizPart: quizPart || null
      });

      await recentUser.save();

      // Emit WebSocket event for attempt started
      socketClient.emitAttemptStarted({
        name: recentUser.name,
        email: recentUser.email,
        quizName: quizName || 'N/A',
        quizPart: quizPart || 'N/A',
        attemptNumber: dailyAttemptsForThisContext + 1,
        timestamp: now,
      });

      return res.status(200).json({
        success: true,
        message: "Attempt recorded successfully",
        currentAttempts: dailyAttemptsForThisContext + 1,
        remainingAttempts: 3 - (dailyAttemptsForThisContext + 1),
        user: { name: recentUser.name, email: recentUser.email },
      });
    } else {
      // New User
      const newUser = new User({
        name,
        email: normalizedEmail,
        attemptNumber: 1,
        dailyAttempts: 1,
        lastAttemptDate: now,
        joinedOn: now,
        quizName: quizName || null,
        quizPart: quizPart || null,
        attempts: [{
          attemptNumber: 1,
          timestamp: now,
          quizName: quizName || null,
          quizPart: quizPart || null
        }]
      });

      await newUser.save();

      // Emit WebSocket event for new user joined
      socketClient.emitUserJoined({
        name: newUser.name,
        email: newUser.email,
        quizName: quizName || 'N/A',
        quizPart: quizPart || 'N/A',
        attemptNumber: 1,
        timestamp: now,
      });

      return res.status(201).json({
        success: true,
        message: "Initial attempt recorded",
        currentAttempts: 1,
        remainingAttempts: 2,
        user: { name: newUser.name, email: newUser.email },
      });
    }
  } catch (err) {
    console.error("Record attempt error:", err);
    return res.status(500).json({ message: "Server error recording attempt" });
  }
});

router.post("/update-score", async (req, res) => {
  try {
    const { email, score, total, quizName, quizPart } = req.body || {};
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const recentUser = await User.findOne({
      email: { $regex: `^${normalizedEmail}$`, $options: "i" },
    }).sort({ lastAttemptDate: -1 });

    if (!recentUser) {
      return res.status(404).json({ message: "No attempt found for this email" });
    }

    recentUser.score = score;
    recentUser.total = total;
    if (quizName) recentUser.quizName = quizName;
    if (quizPart) recentUser.quizPart = quizPart;

    if (recentUser.attempts && recentUser.attempts.length > 0) {
      const latest = recentUser.attempts[recentUser.attempts.length - 1];
      latest.score = score;
      latest.total = total;

      if (req.body.roundTimings) {
        latest.roundTimings = req.body.roundTimings;

        const totalRoundTime = req.body.roundTimings.reduce((acc, r) => acc + (r.timeTaken || 0), 0);
        latest.timeTaken = totalRoundTime;

        recentUser.timeTaken = totalRoundTime; // Update top-level for leaderboard
        recentUser.roundTimings = req.body.roundTimings; // Update top-level round details
      }
    }

    await recentUser.save();

    // Emit WebSocket event for score update
    socketClient.emitScoreUpdated({
      name: recentUser.name,
      email: recentUser.email,
      score,
      total,
      quizName: quizName || recentUser.quizName || 'N/A',
      quizPart: quizPart || recentUser.quizPart || 'N/A',
      timestamp: new Date(),
    });

    return res.status(200).json({
      success: true,
      message: "Score updated successfully",
      user: {
        name: recentUser.name,
        email: recentUser.email,
        score: recentUser.score,
        total: recentUser.total,
      },
    });
  } catch (err) {
    console.error("Update score error:", err);
    return res.status(500).json({ message: "Server error updating score" });
  }
});

module.exports = router;
