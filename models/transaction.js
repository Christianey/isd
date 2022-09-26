const Joi = require("joi");
const mongoose = require("mongoose");
const debug = require("debug")(process.env.DEBUG);

const transactionSchema = mongoose.Schema(
  {
    transactionType: {
      type: String,
      enum: ["WITHDRAWAL", "DEPOSIT", "TRANSFER", "BONUS", "PENALTY"],
      message: "{VALUE} is not suppoprted",
      required: [true, "Transaction type is required"],
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    status: {
      type: String,
      enum: ["VERIFIED", "PENDING", "ACTIVE"],
      message: "{VALUE} is not suppoprted",
      required: [true, "Status field is required"],
      default: "PENDING",
    },
    amount: {
      type: Number,
      required: [true, "amount is required"],
    },
    requestedOn: {
      type: Date,
      default: Date.now,
    },
    paidOn: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Transaction = mongoose.model("transaction", transactionSchema);

const validateTransactionCreate = (transaction) => {
  const schema = Joi.object({
    transactionType: Joi.string()
      .valid("WITHDRAWAL", "DEPOSIT", "TRANSFER", "BONUS", "PENALTY")
      .required(),
    status: Joi.string().valid("VERIFIED", "PENDING", "ACTIVE").required(),
    sender: Joi.string().hex().length(24).required(),
    amount: Joi.number().required(),
    requestedOn: Joi.date().required(),
    paidOn: Joi.date().required(),
  })
    .or(
      "transactionType",
      "status",
      "sender",
      "amount",
      "requestedOn",
      "paidOn"
    )
    .options({ allowUnknown: true, stripUnknown: true });

  return schema.validate(transaction);
};

const validateReward = (transaction) => {
  const schema = Joi.object({
    username: Joi.string().required().trim(),
    amount: Joi.number().required(),
    adminId: Joi.string().hex().length(24).required(),
  });

  return schema.validate(transaction);
};

module.exports = {
  Transaction,
  validateTransactionCreate,
  validateReward,
};
