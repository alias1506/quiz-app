require("dotenv").config({ path: __dirname + "/.env" });

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Ensure these filenames match your files in ./routes/
const authRoutes = require("./routes/authRoute"); // <-- filename: authRoutes.js
const questionRoutes = require("./routes/questionRoute"); // <-- filename: questionRoute.js
const setsRoutes = require("./routes/setsRoute"); // <-- filename: setsRoute.js
const certificateRoutes = require("./routes/certificateRoute"); // <-- filename: certificateRoute.js

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Environment variable validation
if (!process.env.GMAIL_APP_PASSWORD) {
  console.warn("⚠️  WARNING: GMAIL_APP_PASSWORD not set - certificate emails will not be sent!");
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
