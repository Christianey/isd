const mongoose = require("mongoose");
const Joi = require("joi");
const debug = require("debug")(process.env.DEBUG);

const companyInfoSchema = mongoose.Schema({
  name: {
    type: String,
    minlength: [2, "Characters must be greater than 2, got {VALUE}"],
    maxLength: [25, "Characters must be less than 25, got {VALUE}"],
  },
  email: {
    type: String,
  },
  officeAddress: {
    type: String,
  },
  phoneNumber: {
    type: String,
  },
  bitcoinAddress: {
    type: String,
  },
  ethereumAddress: {
    type: String,
  },
  minWithdrawal: {
    type: Number,
  },
  maxWithdrawal: {
    type: Number,
  },
  charges: {
    deposit: {
      type: Number,
      default: 0,
    },
    withdrawal: {
      type: Number,
      default: 1,
    },
  },
  systemBalance: {
    type: Number,
    default: 0,
  },
});

const adminSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [2, "Characters must be greater than 2, got {VALUE}"],
      maxLength: [25, "Characters must be less than 25, got {VALUE}"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      validate: {
        validator: function (v) {
          return /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(
            v
          );
        },
        message: (props) => `${props.value} is not a valid email!`,
      },
    },
    companyInfo: {
      type: companyInfoSchema,
      default: {
        name: "",
        email: "",
        officeAddress: "",
        phoneNumber: "",
        bitcoinAddress: "",
        ethereumAddress: "",
        minWithdrawal: 0,
        maxWithdrawal: 0,
        charges: { withdrawal: 0, deposit: 0 },
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

const Admin = mongoose.model("admin", adminSchema);

const validateAdminRegister = (admin) => {
  const schema = Joi.object({
    username: Joi.string().min(2).max(25).required(),
    email: Joi.string().trim().email().required(),
    password: Joi.string().required().min(6).max(25),
  });

  return schema.validate(admin, { allowUnknown: true, stripUnknown: true });
};

const validateAdminLogin = (admin) => {
  const schema = Joi.object({
    username: Joi.string().min(2).max(25).required(),
    email: Joi.string().trim().email().required(),
    password: Joi.string().required().min(6).max(25),
  }).xor("username", "email");

  return schema.validate(admin, { allowUnknown: true, stripUnknown: true });
};

const validateAdminUpdate = (admin) => {
  const schema = Joi.object({
    name: Joi.string().min(4).max(25).allow(),
    email: Joi.string().trim().email().allow(),
    officeAddress: Joi.string().allow(),
    phoneNumber: Joi.string().allow(),
    bitcoinAddress: Joi.string().allow(),
    ethereumAddress: Joi.string().allow(),
    minWithdrawal: Joi.number().allow(),
    maxWithdrawal: Joi.number().allow(),
  })
    .xor(
      "name",
      "email",
      "officeAddress",
      "phoneNumber",
      "bitcoinAddress",
      "ethereumAddress",
      "minWithdrawal",
      "maxWithdrawal"
    )
    .options({ allowUnknown: true, stripUnknown: true });

  return schema.validate(admin);
};

const validateCharges = (charges) => {
  const schema = Joi.object({
    deposit: Joi.number().positive().required(),
    withdrawal: Joi.number().positive().required(),
    adminId: Joi.string().hex().length(24).required(),
  });

  return schema.validate(charges);
};

module.exports = {
  Admin,
  validateAdminRegister,
  validateAdminLogin,
  validateAdminUpdate,
  validateCharges,
};
