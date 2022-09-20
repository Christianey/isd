const mongoose = require("mongoose");
const Joi = require("joi");

const FAQSchema = mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  answer: {
    type: String,
    required: true,
  },
});

const FAQ = mongoose.model("faq", FAQSchema);

const faqValidationCreate = (faq) => {
  const schema = Joi.object({
    question: Joi.string().required(),
    answer: Joi.string().required(),
  });

  schema.validate(faq, { allowUnknown: true, stripUnknown: true });
};

const faqValidationUpdate = (faq) => {
  const schema = Joi.object({
    question: Joi.string(),
    answer: Joi.string(),
  }).xor("question", "answer");

  schema.validate(faq, { allowUnknown: true, stripUnknown: true });
};

module.exports = { FAQ, faqValidationCreate, faqValidationUpdate };
