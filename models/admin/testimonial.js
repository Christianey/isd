const mongoose = require("mongoose");
const Joi = require("joi");

const testimonialSchema = mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },
  testimony: {
    type: String,
    required: true,
  },
});

const Testimonial = mongoose.model("testimonial", testimonialSchema);

const testimonialValidationCreate = (testimonial) => {
  const schema = Joi.object({
    userName: Joi.string().required(),
    testimony: Joi.string().required(),
  });

  schema.validate(testimonial, { allowUnknown: true, stripUnknown: true });
};

const testimonialValidationUpdate = (testimonial) => {
  const schema = Joi.object({
    userName: Joi.string(),
    testimony: Joi.string(),
  }).xor("userName", "testimony");

  schema.validate(testimonial, { allowUnknown: true, stripUnknown: true });
};

module.exports = {
  Testimonial,
  testimonialValidationCreate,
  testimonialValidationUpdate,
};
