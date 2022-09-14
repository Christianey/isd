const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    transactionType: {
      type: String,
      enum: ["WITHDRAWAL", "DEPOSIT"],
    },
    sender: {
      type: String,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["VERIFIED", "PENDING", "ACTIVE"],
      default: "PENDING",
    },
    amount: {
      type: Number,
    },
    requestedOn: {
      type: Date,
      default: Date.now,
    },
    paidOn: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("user", userSchema);
