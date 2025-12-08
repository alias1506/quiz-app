require("dotenv").config({ path: __dirname + "/.env" });

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const axios = require("axios");

// Ensure these filenames match your files in ./routes/
const authRoutes = require("./routes/authRoute"); // <-- filename: authRoutes.js
const questionRoutes = require("./routes/questionRoute"); // <-- filename: questionRoute.js
const setsRoutes = require("./routes/setsRoute"); // <-- filename: setsRoute.js
const certificateRoutes = require("./routes/certificateRoute"); // <-- filename: certificateRoute.js

const app = express();
const PORT = process.env.PORT || 5000;

// Admin panel URL for notifications (Vercel-compatible)
const ADMIN_PANEL_URL = process.env.ADMIN_PANEL_URL || "http://localhost:5001";

// Helper function to notify admin panel
async function notifyAdminPanel(endpoint, data) {
  if (process.env.NODE_ENV === 'production') {
    // In production (Vercel), admin will poll for updates
    return;
  }
  
  // In development, try to ping admin server
  try {
    await axios.post(`${ADMIN_PANEL_URL}/api/notify`, data, {
      timeout: 2000,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    // Silently fail - admin will get updates via polling
    console.log('Admin notification skipped (will use polling)');
  }
}

// Make notifyAdminPanel available to routes
app.set('notifyAdminPanel', notifyAdminPanel);

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    dbName: "Quiz",
  })
  .then(() => console.log("✅ MongoDB connected to 'Quiz' database"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Routes

if (process.env.NODE_ENV === "production") {
  app.use("/", express.static("frontend/dist"));
  app.use("/dashboard", express.static("frontend/dist"));
  app.use("/thank-you", express.static("frontend/dist"));
}

app.use("/api/users", authRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/sets", setsRoutes);
app.use("/api/certificate", certificateRoutes);

// Generic 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Endpoint not found" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
