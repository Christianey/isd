const Joi = require("joi");
const mongoose = require("mongoose");
const debug = require("debug")(process.env.DEBUG);

const notificationSchema = mongoose.Schema(
  {
    title: String,
    required: [true, "Notification Title is required"],
  },
  {
    message: String,
    required: [true, "Notification message is required"],
  },
  {
    status: String,
    enum: ["READ", "UNREAD"],
    message: `{VALUE} is not supported`,
    required: [true, "Notification Status is required"],
    default: "UNREAD",
  },
  {
    timestamps: true,
  }
);

const validateNotificationCreate = (notification) => {
  const schema = Joi.object({
    title: Joi.string().required(),
    message: Joi.string().required(),
  })

  return schema.validate(notification)
}
const Notification = mongoose.model("notification", notificationSchema);

module.exports = {
  Notification,
  validateNotificationCreate,
};
