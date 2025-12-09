require("dotenv").config({ path: __dirname + "/.env" });

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authRoute");
const questionRoutes = require("./routes/questionRoute");
const setsRoutes = require("./routes/setsRoute");
const certificateRoutes = require("./routes/certificateRoute");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
  console.warn("⚠️  WARNING: Email credentials not set - certificate emails will not be sent!");
  console.warn("⚠️  Set SMTP_USER and SMTP_PASS in environment variables.");
} else {
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = process.env.SMTP_PORT || 465;
  console.log(`📧 Email configured: SMTP (${smtpHost}:${smtpPort})`);
}

if (!process.env.MONGO_URI) {
  console.error("❌ ERROR: MONGO_URI not set!");
  process.exit(1);
}

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    dbName: "Quiz",
  })
  .then(() => console.log("✅ MongoDB connected to 'Quiz' database"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Routes
app.use("/api/users", authRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/sets", setsRoutes);
app.use("/api/certificate", certificateRoutes);

// API 404 Handler - Must be after API routes but before frontend catch-all
app.use("/api", (req, res) => {
  res.status(404).json({ message: "API Endpoint not found" });
});

// Serve Frontend in Production
if (process.env.NODE_ENV === "production") {
  const path = require("path");
  // Serve static files from frontend/dist
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  // Handle React Routing (SPA) - Return index.html for all non-API routes
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend/dist", "index.html"));
  });
} else {
  // Basic 404 for dev mode if not hitting API
  app.use((req, res) => {
    res.status(404).json({ message: "Endpoint not found" });
  });
}

module.exports = app;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
