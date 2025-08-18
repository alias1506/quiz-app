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
// Check if email exists (case-insensitive)
router.post("/check-email", async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: { $regex: `^${normalizedEmail}$`, $options: "i" },
    });

    // Keep this endpoint simple and consistent with the client expectations.
    // Do NOT add "success" here if your client doesn't expect it.
    if (user) {
      return res.status(200).json({
        exists: true,
        message: "Email already exists",
      });
    }

    return res.status(200).json({
      exists: false,
      message: "Email is available",
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

    // Check duplicates BEFORE insert to return helpful message
    for (const userData of validUsers) {
      const normalizedEmail = String(userData.email).toLowerCase().trim();
      const existingUser = await User.findOne({
        email: { $regex: `^${normalizedEmail}$`, $options: "i" },
      });
      if (existingUser) {
        return res
          .status(409)
          .json({
            message: `Email ${userData.email} already exists in database`,
          });
      }
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

module.exports = router;
