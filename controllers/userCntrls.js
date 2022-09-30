const {
  validatePassword,
  generatePasswordHash,
} = require("../lib/passwordUtils");
const { Admin } = require("../models/admin/admin");
const { Transaction } = require("../models/transaction");
const { User } = require("../models/user/user");
const debug = require("debug")(process.env.DEBUG);

const userCntrls = {
  getUser: async (req, res, next) => {
    try {
      const { id } = req.params;

      const user = await User.findById(id)
        .select("-salt -hash")
        .populate("transactions");
      // const user = await User.aggregate([{ $match: { _id: id } }]);

      if (!user) return res.status(400).json({ error: "User doesn't exist." });

      res.json({ user });
    } catch (error) {
      next(error);
    }
  },

  getAllUsers: async (_, res, next) => {
    try {
      const users = await User.find({}).select("-salt -hash");

      res.json({ message: "Get all users successful", users });
    } catch (error) {
      next(error);
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
          .json({ error: "Email already exists. Try again..." });
      } else {
        const user = await User.findById(userId);
        const { salt: currentSalt, hash: currentHash } = user;
        const isPasswordValid = validatePassword(
          currentPassword,
          currentSalt,
          currentHash
        );

        if (!isPasswordValid) {
          res.status(400).json({ error: "Wrong current password" });
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

  makeWithdrawal: async (req, res, next) => {
    const { userId, amount, walletAddress, walletType } = req.body;

    try {
      const sender = await User.findById(userId);
      const admin = await Admin.findOne({});

      const withdrawalCharge = admin.companyInfo.charges.withdrawal;

      if (!sender) {
        return res.status(400).json({ error: "User doesn't exist" });
      }

      if (
        sender.availableBalance <= 0 ||
        sender.availableBalance < (withdrawalCharge / 100) * amount + amount
      ) {
        return res.status(400).json({ error: "Insufficient funds" });
      }

      const newTransaction = new Transaction({
        transactionType: "WITHDRAWAL",
        status: "PENDING",
        amount: amount,
        sender: userId,
        requestedOn: Date.now(),
        paidOn: Date.now(),
        walletAddress,
        walletType,
      });

      sender.availableBalance =
        sender.availableBalance - ((withdrawalCharge / 100) * amount + amount);

      const transaction = await newTransaction.save();
      const { _id: transactionId } = transaction;

      sender.transactions = [...sender.transactions, transactionId];

      await sender.save();

      res.json({
        message: "Withdrawal completed successfully",
        result: { sender: { ...sender._doc, hash: null, salt: null } },
      });
    } catch (error) {
      next(error);
    }
  },
  makeDeposit: async (req, res, next) => {
    const { userId, amount, walletAddress, walletType } = req.body;

    try {
      const sender = await User.findById(userId);
      const admin = await Admin.findOne({});

      const withdrawalCharge = admin.companyInfo.charges.deposit;

      if (!sender) {
        return res.status(400).json({ error: "User doesn't exist" });
      }

      if (
        sender.availableBalance <= 0 ||
        sender.availableBalance < (withdrawalCharge / 100) * amount + amount
      ) {
        return res.status(400).json({ error: "Insufficient funds" });
      }

      const newTransaction = new Transaction({
        transactionType: "DEPOSIT",
        status: "PENDING",
        amount: amount,
        sender: userId,
        requestedOn: Date.now(),
        paidOn: Date.now(),
        walletAddress,
        walletType,
      });

      sender.availableBalance =
        sender.availableBalance - ((withdrawalCharge / 100) * amount + amount);

      const transaction = await newTransaction.save();
      const { _id: transactionId } = transaction;

      sender.transactions = [...sender.transactions, transactionId];

      await sender.save();
      await admin.updateOne({ $inc: { "companyInfo.systemBalance": amount } });
      // .then((result) => console.log(`saved successfully ${result}`));

      res.json({
        message: "Deposit completed successfully",
        result: { sender: { ...sender._doc, hash: null, salt: null }, admin },
      });
    } catch (error) {
      next(error);
    }
  },

  getWithdrawalCharge: async (_, res, next) => {
    try {
      const result = await Admin.findOne({});
      res.json({
        message: "Get withdrawal charge successful.",
        result: result.companyInfo.charges.withdrawal,
      });
    } catch (error) {
      next(error);
    }
  },

  getDepositCharge: async (_, res, next) => {
    try {
      const result = await Admin.findOne({});
      res.json({
        message: "Get deposit charge successful.",
        result: result.companyInfo.charges.deposit,
      });
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

    try {
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
          .json({ error: "Please input correct transaction type query." });
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

      handleQuery(type);
    } catch (error) {
      next(error);
    }
  },

  makeTransfer: async (req, res, next) => {
    const { userId, receiverUsername, amount } = req.body;

    try {
      const sender = await User.findById(userId);
      const receiver = await User.findOne({ username: receiverUsername });

      if (!sender) {
        return res.status(400).json({ error: "Sender Id doesn't exist" });
      }

      if (sender.availableBalance <= 0 || sender.availableBalance <= amount) {
        return res.status(400).json({ error: "Insufficient funds" });
      }

      if (!receiver) {
        return res
          .status(400)
          .json({ error: "Receiver Username doesn't exist" });
      }

      const newTransaction = new Transaction({
        transactionType: "TRANSFER",
        status: "PENDING",
        amount: amount,
        sender: userId,
        requestedOn: Date.now(),
        paidOn: Date.now(),
      });

      sender.availableBalance = sender.availableBalance - amount;
      receiver.availableBalance = receiver.availableBalance + amount;

      const transaction = await newTransaction.save();
      const { _id: transactionId } = transaction;

      sender.transactions = [...sender.transactions, transactionId];
      receiver.transactions = [...receiver.transactions, transactionId];

      await sender.save();
      await receiver.save();

      res.json({
        message: "Transfer completed successfully",
        result: {
          sender: { ...sender._doc, salt: null, hash: null },
          receiver: { ...receiver._doc, hash: null, salt: null },
        },
      });
    } catch (error) {
      next(error);
    }
  },

  addWallet: async (req, res, next) => {
    const { userId, walletAddress, walletType } = req.body;

    try {
      const user = await User.findByIdAndUpdate(
        userId,
        {
          $push: { wallets: { walletAddress, walletType } },
        },
        { new: true }
      ).select("-hash -salt");

      if (!user) {
        return res.status(400).json({ error: "User not found" });
      }

      res.json({ message: "Add wallet successfull!", result: user });
    } catch (error) {
      next(error);
    }
  },

  getUserWallets: async (req, res, next) => {
    const { userId } = req.params;

    if (!userId)
      return res.status(400).json({ error: "Please add user id parameter" });

    try {
      const user = await User.findById(userId).select("-hash -salt");

      if (!user) return res.status(400).json({ error: "user not found" });

      res.json({
        message: "Get user wallets succcessful",
        result: user.wallets,
      });
    } catch (error) {
      next(error);
    }
  },

  editUserWallet: async (req, res, next) => {
    const { userId, walletId } = req.params;
    const { walletType, walletAddress } = req.body;

    if (!userId || !walletId)
      return res
        .status(400)
        .json({ error: "Please add user id and wallet id parameters" });

    try {
      const wallet = await User.findOneAndUpdate(
        { _id: userId, "wallets._id": walletId },
        {
          $set: {
            "wallets.$.walletType": walletType,
            "wallet.$.walletAddress": walletAddress,
          },
        },
        { new: true }
      ).select("-hash -salt");

      if (!wallet)
        return res.status(400).json({ error: "User or wallet doesn't exist" });

      res.json({
        message: "Edit user wallet succcessful",
        result: wallet,
      });
    } catch (error) {
      next(error);
    }
  },

  deleteUserWallet: async (req, res, next) => {
    const { userId, walletId } = req.params;

    try {
      const wallet = await User.findOneAndUpdate(
        {
          _id: userId,
          "wallets._id": walletId,
        },
        { $pull: { wallets: { _id: walletId } } },
        { new: true }
      ).select("-hash -salt");

      if (!wallet)
        return res.status(400).json({ error: "User or wallet doesn't exist" });

      res.json({
        message: "Delete user wallet succcessful",
        result: wallet,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = userCntrls;
