const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    userType: {
      type: String,
      enum: ['WITHDRAWAL', 'DEPOSIT', 'BONUS']
    },
    status: {
      type: String,
      enum: ['VERIFIED', 'PENDING', "ACTIVE"],
      default: 'PENDING'
    },
    amount: {
      type: Number,
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
