const mongoose = require("mongoose");

const adminSchema = mongoose.Schema(
  {
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
    companyInfo: {
      default: {
        name: "",
        email: "",
        officeAddress: "",
        phoneNumber: "",
        bitcoinAddress: "",
        ethereumAddress: "",
        minWithdrawal: 0,
        maxWithdrawal: 0,
      },
      type: Object,
    },
    salt: {
      type: String,
      required: true,
    },
    hash: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("admin", adminSchema);
