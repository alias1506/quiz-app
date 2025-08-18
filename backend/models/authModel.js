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
    },
    joinedOn: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: "Quiz-Data" } // bind to your specific collection
);

const User = mongoose.model("User", userSchema);

module.exports = User;
