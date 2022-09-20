const Joi = require("joi");
const mongoose = require("mongoose");

const depositPlanSchema = mongoose.Schema(
  {
    planType: {
      type: String,
      enum: ["INVESTMENT", "MINING"],
      message: "{VALUE} is not supported",
      required: [true, "Plan type is required"],
    },
    planName: {
      type: String,
      required: [true, "Plan name is required"],
    },
    minDeposit: {
      type: Number,
      required: [true, "Minimum deposit field is required"],
    },
    maxDeposit: {
      type: Number,
      required: [true, "Maximum deposit field is required"],
    },
    percentageProfit: {
      type: Number,
      required: [true, "Percentage Profit field is required"],
    },
    duration: {
      type: String,
      default: "00:00:00",
      required: [true, "Duration field is required"],
    },
    referralBonus: {
      type: Number,
      required: [true, "Referral Bonus field is required"],
    },
  },
  {
    timestamps: true,
  }
);

const DepositPlan = mongoose.model("depositPlan", depositPlanSchema);

const depositPlanValidationCreate = (depositPlan) => {
  const schema = Joi.object({
    planType: Joi.string().valid("INVESTMENT", "MINING").required(),
    planName: Joi.string().required(),
    minDeposit: Joi.number().min(1).required(),
    maxDeposit: Joi.number().required(),
    percentageProfit: Joi.number().required(),
    duration: Joi.string().required(),
  });

  return schema.validate(depositPlan);
};

const depositPlanValidationUpdate = (depositPlan) => {
  const schema = Joi.object({
    planType: Joi.string().valid("INVESTMENT", "MINING"),
    planName: Joi.string(),
    minDeposit: Joi.number().min(1),
    maxDeposit: Joi.number(),
    percentageProfit: Joi.number(),
    duration: Joi.string(),
  })
    .xor(
      "planType",
      "planName",
      "minDeposit",
      "maxDeposit",
      "percentageProfit",
      "duration"
    )
    .options({ allowUnknown: true, stripUnknown: true });

  return schema.validate(depositPlan);
};

module.exports = {
  DepositPlan,
  depositPlanValidationCreate,
  depositPlanValidationUpdate,
};
