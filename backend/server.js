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

// Debug: Check if MONGO_URI is loaded
console.log("MONGO_URI:", process.env.MONGO_URI);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    dbName: "Quiz",
  })
  .then(() => console.log("✅ MongoDB connected to 'Quiz' database"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Routes
app.use("/api/users", authRoutes); // All user-related endpoints
app.use("/api/questions", questionRoutes); // All question endpoints
app.use("/api/sets", setsRoutes); // All quiz set endpoints
app.use("/api/certificate", certificateRoutes); // All certificate endpoints

// Generic 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Endpoint not found" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
