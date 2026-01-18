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
      unique: true,
      index: true,
    },
    // Adding attempts array for compatibility with Admin panel expectations
    attempts: [
      {
        attemptNumber: Number,
        timestamp: Date,
        score: Number,
        total: Number,
        quizName: String,
        quizPart: String,
        roundTimings: [
          {
            roundName: String,
            timeTaken: Number, // in seconds
          }
        ],
        timeTaken: {
          type: Number,
          default: 0
        }
      }
    ],
    score: {
      type: Number,
      default: null,
    },
    total: {
      type: Number,
      default: null,
    },
    timeTaken: {
      type: Number,
      default: 0
    },
    roundTimings: [
      {
        roundName: String,
        timeTaken: Number,
      }
    ],
    quizName: {
      type: String,
      default: null,
    },
    quizPart: {
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
    dailyAttempts: {
      type: Number,
      default: 1,
    },
    lastAttemptDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "Users", // Consistent with Admin app
    timestamps: true
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
