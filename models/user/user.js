const Joi = require("joi");
const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name of user is required"],
      trim: true,
      minLength: [4, "name length must be more than 4, got {VALUE}"],
      maxLength: [30, "name length must be less than 30, got {VALUE}"],
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
      enum: ["ACTIVE", "DEACTIVATED"],
      default: "ACTIVE",
      message: "{VALUE} is not supported",
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
    liveProfit: {
      type: Number,
      default: 0,
    },
    availableBalance: {
      type: Number,
      default: 0,
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
    },
    maxDailyWithdrawal: {
      type: Number,
    },
    transactions: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Transactions" },
    ],
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.virtual("bookBalance").get(function () {
  return this.availableBalance + this.liveProfit;
});

const User = mongoose.model("user", userSchema);

const userValidateCreate = (user) => {
  const schema = Joi.object({});

  return schema.validate(user);
};

module.exports = {
  User,
  userValidateCreate,
};
