const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxLength: 30,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxLength: 25,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "DEACTIVATED"]
    },
    salt: {
      type: String,
      required: true,
    },
    hash: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    referralCode: {
      type: String,
    },
    wallet: {
      type: mongoose.Schema.Types.Mixed,
    },
    availableBalance: {
      type: Number,
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId
    },
    maxDailyWithdrawal: {
      type: Number
    }

  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("user", userSchema);
