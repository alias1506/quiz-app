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

if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
  console.warn("⚠️  WARNING: Gmail credentials not set - certificate emails will not be sent!");
  console.warn("⚠️  Set GMAIL_USER and GMAIL_APP_PASSWORD in environment variables.");
} else {
  console.log("📧 Email configured: Gmail SMTP");
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

if (process.env.NODE_ENV === "production") {
  app.use("/", express.static("frontend/dist"));
  app.use("/dashboard", express.static("frontend/dist"));
  app.use("/thank-you", express.static("frontend/dist"));
}

app.use("/api/users", authRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/sets", setsRoutes);
app.use("/api/certificate", certificateRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Endpoint not found" });
});

module.exports = app;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
