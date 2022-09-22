const {
  validatePassword,
  generatePasswordHash,
} = require("../lib/passwordUtils");
const { User } = require("../models/user/user");
const debug = require("debug")(process.env.DEBUG);

const userCntrls = {
  getUser: async (req, res) => {
    try {
      const { id } = req.params;

      const user = await User.findById(id).select("-salt -hash");

      if (!user)
        return res.status(400).json({ message: "User doesn't exist." });

      res.json({ user });
    } catch (error) {
      next(error);
    }
  },

  getAllUsers: async (_, res) => {
    try {
      const users = await User.find({}).select("-salt -hash");

      res.json({ message: "Get all users successful", users });
    } catch (error) {
      next();
    }
  },

  updateUser: async (req, res, next) => {
    const { newPassword, currentPassword, country, email } = req.body;
    const { userId } = req.params;

    try {
      const user = await User.findOne({ email });

      if (user) {
        return res
          .status(400)
          .json({ message: "Email already exists. Try again..." });
      } else {
        const user = await User.findById(userId);
        const { salt: currentSalt, hash: currentHash } = user;
        const isPasswordValid = validatePassword(
          currentPassword,
          currentSalt,
          currentHash
        );

        if (!isPasswordValid) {
          res.status(400).json({ message: "Wrong current password" });
        } else {
          const { salt: newSalt, hash: newHash } =
            generatePasswordHash(newPassword);
          user.salt = newSalt;
          user.hash = newHash;
          user.country = country || user.country;
          user.email = email || user.email;
          let result = await user.save();

          res.json({ message: "Details updated successfully!", user: result });
        }
      }
    } catch (error) {
      next(error);
    }
  },

  getTransactions: async (req, res, next) => {
    const { userId } = req.params;
    const { type } = req.query;
    const validTypes = [
      "BONUS",
      "PENALTY",
      "WITHDRAWAL",
      "TRANSFER",
      "DEPOSIT",
    ];

    if (!type) {
      const { transactions } = await User.findById(userId)
        .select("transactions")
        .populate("transactions");

      return res.json({
        message: `Get Transactions successful!`,
        result: transactions,
      });
    }

    if (!validTypes.includes(type)) {
      return res
        .status(400)
        .json({ message: "Please input correct transaction type query." });
    }
    async function handleQuery(type) {
      const { transactions } = await User.findById(userId)
        .select("transactions")
        .populate({
          path: "transactions",
          match: { transactionType: type },
        });

      return res.json({
        message: `Get ${type} Transactions successful!`,
        result: transactions,
      });
    }
    try {
      handleQuery(type);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = userCntrls;
