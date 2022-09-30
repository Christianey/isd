const Joi = require("joi");
const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name of user is required"],
      trim: true,
      minLength: [4, "Name length must be more than 4, got {VALUE}"],
      maxLength: [30, "Name length must be less than 30, got {VALUE}"],
    },
    username: {
      type: String,
      required: [true, "username is required"],
      unique: true,
      trim: true,
      maxLength: [25, "Length must be less than 25, got {VALUE}"],
    },
    email: {
      type: String,
      required: [true, "email is required"],
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
    wallets: [
      {
        walletType: {
          type: String,
          enum: ["Bitcoin", "Ethereum", "Litecoin", "Ripple", "USDT"],
        },
        walletAddress: {
          type: String,
        },
      },
    ],
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
      ref: "User",
    },
    maxDailyWithdrawal: {
      type: Number,
    },
    transactions: [
      { type: mongoose.Schema.Types.ObjectId, ref: "transaction" },
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

userSchema.virtual("referralLink").get(function () {
  return `https://isd.com/signup/?ref=${this.username}`;
});

userSchema.virtual("totalDeposit").get(function () {
  return this.transactions
    .filter((transaction) => {
      return transaction?.transactionType === "DEPOSIT";
    })
    .reduce((prev, curr) => {
      return prev + curr.amount;
    }, 0);
});

userSchema.virtual("totalWithdrawal").get(function () {
  return this.transactions
    .filter((transaction) => {
      return transaction?.transactionType === "WITHDRAWAL";
    })
    .reduce((prev, curr) => {
      return prev + curr.amount;
    }, 0);
});

userSchema.virtual("totalBonuses").get(function () {
  return this.transactions
    .filter((transaction) => {
      return transaction?.transactionType === "BONUS";
    })
    .reduce((prev, curr) => {
      return prev + curr.amount;
    }, 0);
});

const User = mongoose.model("user", userSchema);

const userValidateCreate = (user) => {
  const schema = Joi.object({
    name: Joi.string().min(4).max(30).trim().required(),
    username: Joi.string().max(25).required(),
    email: Joi.string().email().required(),
    country: Joi.string().required(),
    referralCode: Joi.string(),
    referredBy: Joi.string().hex().length(24),
  })
    .or("name", "username", "email", "country", "referralCode", "referredBy")
    .options({ allowUnknown: true, stripUnknown: true });

  return schema.validate(user);
};

const userValidateUpdate = (user) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    country: Joi.string().required(),
    newPassword: Joi.string().required(),
    currentPassword: Joi.string().required(),
  })
    .or("email", "country", "password")
    .with("password", ["oldPassword", "repeatPassword"])
    .options({ allowUnknown: true, stripUnknown: true });

  return schema.validate(user);
};

const userValidateTransfer = (user) => {
  const schema = Joi.object({
    userId: Joi.string().hex().length(24).required(),
    receiverUsername: Joi.string().max(25).required(),
    amount: Joi.number().positive().required(),
  });

  return schema.validate(user);
};

const userValidateWalletCreate = (user) => {
  const schema = Joi.object({
    userId: Joi.string().hex().length(24).required(),
    walletType: Joi.string()
      .required()
      .valid("Bitcoin", "Ethereum", "Litecoin", "USDT"),
    walletAddress: Joi.string()
      .regex(/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}$/, "Crypto Address")
      .required(),
  });

  return schema.validate(user);
};

const userValidateMakeWithdrawal = (user) => {
  const schema = Joi.object({
    userId: Joi.string().hex().length(24).required(),
    walletType: Joi.string()
      .required()
      .valid("Bitcoin", "Ethereum", "Litecoin", "USDT"),
    walletAddress: Joi.string()
      .regex(/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}$/, "Crypto Address")
      .required(),
    amount: Joi.number().positive().required(),
  });

  return schema.validate(user);
};

module.exports = {
  User,
  userValidateCreate,
  userValidateUpdate,
  userValidateTransfer,
  userValidateWalletCreate,
  userValidateMakeWithdrawal,
};
