require("dotenv").config();
const debug = require("debug")(process.env.DEBUG);

const errorCntrls = (error, _, res, next) => {
  debug(error);
  res.status(500).json({ error });
};

module.exports = errorCntrls;
