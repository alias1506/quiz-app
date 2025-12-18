const express = require("express");
const router = express.Router();
const User = require("../models/authModel");

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
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());


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

router.post("/", async (req, res) => {
  try {

    let usersData = [];
    if (Array.isArray(req.body)) {
      usersData = req.body;
    } else if (Array.isArray(req.body?.data)) {
      usersData = req.body.data;
    } else {
      usersData = [req.body];
    }


    const validUsers = usersData.filter((u) => u && u.name && u.email);
    if (validUsers.length === 0) {
      return res.status(400).json({ message: "Name and email are required" });
    }


    const usersToInsert = validUsers.map((user) => ({
      name: user.name,
      email: String(user.email).toLowerCase().trim(),
      score: user.score ?? null,
      total: user.total ?? null,
      quizName: user.quizName ?? null,
      joinedOn: user.joinedOn ? new Date(user.joinedOn) : new Date(),
    }));


    const savedUsers = await User.insertMany(usersToInsert, { ordered: false });


    return res.status(201).json({
      success: true,
      users: savedUsers,
    });
  } catch (err) {
    console.error("Add users error:", err);


    if (err.code === 11000 && err.keyPattern?.email) {
      return res.status(409).json({ message: "Email already used" });
    }

    return res.status(500).json({ message: "Error creating user" });
  }
});

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

router.post("/check-attempts", async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find the most recent user record for this email
    const user = await User.findOne({
      email: { $regex: `^${normalizedEmail}$`, $options: "i" },
    }).sort({ lastAttemptDate: -1 });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let dailyAttempts = 0;
    let timeUntilReset = 0;

    if (user.lastAttemptDate) {
      const lastAttemptDate = new Date(user.lastAttemptDate);
      const lastAttemptDay = new Date(
        lastAttemptDate.getFullYear(),
        lastAttemptDate.getMonth(),
        lastAttemptDate.getDate()
      );

      // Check if last attempt was TODAY
      if (lastAttemptDay.getTime() === today.getTime()) {
        // Same day - use current attempt count
        dailyAttempts = user.dailyAttempts || 0;

        // Calculate time until midnight
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        timeUntilReset = tomorrow.getTime() - now.getTime();
      } else {
        // Different day - reset to 0
        dailyAttempts = 0;
        console.log(`🔄 New day detected for ${normalizedEmail} - resetting attempts to 0`);
      }
    } else {
      // No previous attempts - brand new user
      dailyAttempts = 0;
      console.log(`👤 New user ${normalizedEmail} - starting with 0 attempts`);
    }

    const canAttempt = dailyAttempts < 3;
    const remainingAttempts = Math.max(0, 3 - dailyAttempts);

    // Always calculate time until reset for the response
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const calculatedTimeUntilReset = tomorrow.getTime() - now.getTime();

    console.log(`📊 Check-attempts for ${normalizedEmail}:`);
    console.log(`   - dailyAttempts: ${dailyAttempts}`);
    console.log(`   - canAttempt: ${canAttempt}`);
    console.log(`   - remainingAttempts: ${remainingAttempts}`);

    return res.status(200).json({
      canAttempt,
      currentAttempts: dailyAttempts,
      remainingAttempts,
      maxAttempts: 3,
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
    const { name, email } = req.body || {};
    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    console.log(`🔍 Recording attempt for: ${normalizedEmail}`);

    const recentUser = await User.findOne({
      email: { $regex: `^${normalizedEmail}$`, $options: "i" },
    }).sort({ createdAt: -1, _id: -1 });

    let dailyAttempts = 0;
    let shouldCreateNew = false;
    let attemptNumber = 1;

    if (recentUser) {

      const totalEntries = await User.countDocuments({
        email: { $regex: `^${normalizedEmail}$`, $options: "i" },
      });
      attemptNumber = recentUser.attemptNumber || totalEntries;

      if (recentUser.lastAttemptDate) {
        const lastAttemptDate = new Date(recentUser.lastAttemptDate);
        const lastAttemptDay = new Date(
          lastAttemptDate.getFullYear(),
          lastAttemptDate.getMonth(),
          lastAttemptDate.getDate()
        );

        if (lastAttemptDay.getTime() === today.getTime()) {

          dailyAttempts = recentUser.dailyAttempts || 0;

          console.log(`✏️ Same day attempt - Current: ${dailyAttempts}, Updating existing record ID: ${recentUser._id}`);


          if (dailyAttempts >= 3) {
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const timeUntilReset = tomorrow.getTime() - now.getTime();

            console.log(`🚫 Limit reached for ${normalizedEmail}`);

            return res.status(429).json({
              success: false,
              message: "Daily attempt limit reached",
              currentAttempts: dailyAttempts,
              remainingAttempts: 0,
              timeUntilReset,
            });
          }


          dailyAttempts++;
          recentUser.dailyAttempts = dailyAttempts;
          recentUser.lastAttemptDate = now;
          recentUser.name = name;
          await recentUser.save();

          console.log(`✅ Updated existing record - Attempts: ${dailyAttempts}/3`);

          return res.status(200).json({
            success: true,
            message: "Attempt recorded successfully",
            currentAttempts: dailyAttempts,
            remainingAttempts: 3 - dailyAttempts,
            user: {
              name: recentUser.name,
              email: recentUser.email,
            },
          });
        } else {

          console.log(`📅 Different day detected - Creating new entry`);
          shouldCreateNew = true;
          attemptNumber++;
          dailyAttempts = 1;
        }
      } else {

        shouldCreateNew = true;
        attemptNumber++;
        dailyAttempts = 1;
      }
    } else {

      console.log(`🆕 First time user - Creating initial entry`);
      shouldCreateNew = true;
      attemptNumber = 1;
      dailyAttempts = 1;
    }


    if (shouldCreateNew) {
      console.log(`➕ Creating new entry - Attempt #${attemptNumber}, Daily: ${dailyAttempts}/3`);

      const newUser = new User({
        name: name,
        email: normalizedEmail,
        attemptNumber: attemptNumber,
        joinedOn: now,
        dailyAttempts: dailyAttempts,
        lastAttemptDate: now,
      });
      await newUser.save();

      console.log(`✅ New entry created - ID: ${newUser._id}`);

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
    }
  } catch (err) {
    console.error("Record attempt error:", err);
    console.error("Error name:", err.name);
    console.error("Error message:", err.message);
    console.error("Error stack:", err.stack);
    return res.status(500).json({
      message: "Error recording attempt",
      error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
});

router.post("/update-score", async (req, res) => {
  try {
    const { email, score, total, quizName } = req.body || {};
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
    if (quizName) {
      recentUser.quizName = quizName;
    }
    await recentUser.save();

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
    return res.status(500).json({ message: "Error updating score" });
  }
});

module.exports = router;
