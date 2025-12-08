require("dotenv").config({ path: __dirname + "/.env" });

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const io = require("socket.io-client");

// Ensure these filenames match your files in ./routes/
const authRoutes = require("./routes/authRoute"); // <-- filename: authRoutes.js
const questionRoutes = require("./routes/questionRoute"); // <-- filename: questionRoute.js
const setsRoutes = require("./routes/setsRoute"); // <-- filename: setsRoute.js
const certificateRoutes = require("./routes/certificateRoute"); // <-- filename: certificateRoute.js

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to admin panel's Socket.IO server
const adminSocket = io("http://localhost:5001", {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 10
});

adminSocket.on('connect', () => {
  console.log('✅ Connected to admin panel Socket.IO server');
});

adminSocket.on('disconnect', () => {
  console.log('❌ Disconnected from admin panel Socket.IO server');
});

adminSocket.on('connect_error', (error) => {
  console.log('⚠️ Admin panel Socket.IO connection error:', error.message);
});

// Make socket available to routes
app.set('adminSocket', adminSocket);

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
