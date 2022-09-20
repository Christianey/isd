const debug = require("debug")(process.env.DEBUG);

module.exports = (validator) => {
  return (req, res, next) => {
    const { error, value } = validator(req.body);

    if (error) return res.status(400).json({ error: error.details[0].message });

    req.body = value;
    next();
  };
};
