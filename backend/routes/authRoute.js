const express = require("express");
const router = express.Router();
const User = require("../models/authModel");

// GET /api/users
// Get all users
router.get("/", async (req, res) => {
  try {
    const users = await User.find().sort({ joinedOn: -1 });
    return res.json(users);
  } catch (err) {
    console.error("Get users error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// POST /api/users/check-email
// Check daily attempt limit for email
router.post("/check-email", async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Find most recent entry for this email
    const recentUser = await User.findOne({
      email: { $regex: `^${normalizedEmail}$`, $options: "i" },
    }).sort({ lastAttemptDate: -1 });

    if (!recentUser) {
      return res.status(200).json({
        exists: false,
        canAttempt: true,
        currentAttempts: 0,
        remainingAttempts: 3,
      });
    }

    // Check if last attempt was today
    let dailyAttempts = 0;
    if (recentUser.lastAttemptDate) {
      const lastAttemptDate = new Date(recentUser.lastAttemptDate);
      const lastAttemptDay = new Date(
        lastAttemptDate.getFullYear(),
        lastAttemptDate.getMonth(),
        lastAttemptDate.getDate()
      );

      if (lastAttemptDay.getTime() === today.getTime()) {
        dailyAttempts = recentUser.dailyAttempts || 0;
      }
    }

    const canAttempt = dailyAttempts < 3;
    const remainingAttempts = Math.max(0, 3 - dailyAttempts);

    return res.status(200).json({
      exists: true,
      canAttempt,
      currentAttempts: dailyAttempts,
      remainingAttempts,
      message: canAttempt ? "You can attempt the quiz" : "Daily limit reached",
    });
  } catch (err) {
    console.error("Check email error:", err);
    return res.status(500).json({ message: "Server error checking email" });
  }
});

// POST /api/users
// Add one or multiple users
router.post("/", async (req, res) => {
  try {
    // Accepts: a single object, an array, or { data: [...] }
    let usersData = [];
    if (Array.isArray(req.body)) {
      usersData = req.body;
    } else if (Array.isArray(req.body?.data)) {
      usersData = req.body.data;
    } else {
      usersData = [req.body];
    }

    // Basic validation
    const validUsers = usersData.filter((u) => u && u.name && u.email);
    if (validUsers.length === 0) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    // Prepare documents
    const usersToInsert = validUsers.map((user) => ({
      name: user.name,
      email: String(user.email).toLowerCase().trim(),
      score: user.score ?? null,
      total: user.total ?? null,
      quizName: user.quizName ?? null,
      joinedOn: user.joinedOn ? new Date(user.joinedOn) : new Date(),
    }));

    // Insert
    const savedUsers = await User.insertMany(usersToInsert, { ordered: false });

    // Return consistent response shape for the caller expecting `success`
    return res.status(201).json({
      success: true,
      users: savedUsers,
    });
  } catch (err) {
    console.error("Add users error:", err);

    // Handle Mongo duplicate key error (if a unique index exists on email)
    if (err.code === 11000 && err.keyPattern?.email) {
      return res.status(409).json({ message: "Email already used" });
    }

    return res.status(500).json({ message: "Error creating user" });
  }
});

// DELETE /api/users/:id
// Delete a user
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ message: "User deleted", user: deleted });
  } catch (err) {
    console.error("Delete user error:", err);
    return res.status(500).json({ message: "Error deleting user" });
  }
});

// POST /api/users/check-attempts
// Check if user can attempt quiz (max 3 per day)
router.post("/check-attempts", async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({
      email: { $regex: `^${normalizedEmail}$`, $options: "i" },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Check if last attempt was today
    let dailyAttempts = 0;
    let timeUntilReset = 0;

    if (user.lastAttemptDate) {
      const lastAttemptDate = new Date(user.lastAttemptDate);
      const lastAttemptDay = new Date(
        lastAttemptDate.getFullYear(),
        lastAttemptDate.getMonth(),
        lastAttemptDate.getDate()
      );

      if (lastAttemptDay.getTime() === today.getTime()) {
        // Same day - use existing count
        dailyAttempts = user.dailyAttempts || 0;
        
        // Calculate time until midnight
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        timeUntilReset = tomorrow.getTime() - now.getTime();
      } else {
        // Different day - reset count
        dailyAttempts = 0;
      }
    }

    const canAttempt = dailyAttempts < 3;
    const remainingAttempts = Math.max(0, 3 - dailyAttempts);

    return res.status(200).json({
      canAttempt,
      currentAttempts: dailyAttempts,
      remainingAttempts,
      maxAttempts: 3,
      timeUntilReset: canAttempt ? 0 : timeUntilReset,
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

// POST /api/users/record-attempt
// Record a quiz attempt (creates new entry for each attempt)
router.post("/record-attempt", async (req, res) => {
  try {
    const { name, email } = req.body || {};
    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Find most recent entry for this email
    const recentUser = await User.findOne({
      email: { $regex: `^${normalizedEmail}$`, $options: "i" },
    }).sort({ lastAttemptDate: -1 });

    // Calculate total attempts across all time
    const totalAttempts = await User.countDocuments({
      email: { $regex: `^${normalizedEmail}$`, $options: "i" },
    });
    const nextAttemptNumber = totalAttempts + 1;

    let dailyAttempts = 0;
    
    if (recentUser && recentUser.lastAttemptDate) {
      const lastAttemptDate = new Date(recentUser.lastAttemptDate);
      const lastAttemptDay = new Date(
        lastAttemptDate.getFullYear(),
        lastAttemptDate.getMonth(),
        lastAttemptDate.getDate()
      );

      if (lastAttemptDay.getTime() === today.getTime()) {
        // Same day - use existing count
        dailyAttempts = recentUser.dailyAttempts || 0;

        // Check if limit reached
        if (dailyAttempts >= 3) {
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          const timeUntilReset = tomorrow.getTime() - now.getTime();

          return res.status(429).json({
            success: false,
            message: "Daily attempt limit reached",
            currentAttempts: dailyAttempts,
            remainingAttempts: 0,
            timeUntilReset,
          });
        }
      }
    }

    // Create new entry for this attempt
    dailyAttempts++;
    const newUser = new User({
      name: name,
      email: normalizedEmail,
      attemptNumber: nextAttemptNumber,
      joinedOn: now,
      attempts: [{ attemptNumber: dailyAttempts, timestamp: now }],
      dailyAttempts: dailyAttempts,
      lastAttemptDate: now,
    });
    await newUser.save();

    return res.status(201).json({
      success: true,
      message: "Attempt recorded successfully",
      currentAttempts: dailyAttempts,
      remainingAttempts: 3 - dailyAttempts,
      user: {
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (err) {
    console.error("Record attempt error:", err);
    return res.status(500).json({ message: "Error recording attempt" });
  }
});

module.exports = router;
