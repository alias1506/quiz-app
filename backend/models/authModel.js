const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      index: true,
    },
    score: {
      type: Number,
      default: null,
    },
    total: {
      type: Number,
      default: null,
    },
    quizName: {
      type: String,
      default: null,
    },
    attemptNumber: {
      type: Number,
      default: 1,
    },
    joinedOn: {
      type: Date,
      default: Date.now,
    },
    attempts: {
      type: [
        {
          attemptNumber: { type: Number, required: true },
          timestamp: { type: Date, required: true },
        },
      ],
      default: [],
    },
    dailyAttempts: {
      type: Number,
      default: 0,
    },
    lastAttemptDate: {
      type: Date,
      default: null,
    },
  },
  { 
    collection: "Quiz-Data", // bind to your specific collection
    timestamps: true // Automatically add createdAt and updatedAt
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
