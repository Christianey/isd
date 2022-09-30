const mongoose = require("mongoose");
const {
  validatePassword,
  generatePasswordHash,
} = require("../lib/passwordUtils");
const { Admin } = require("../models/admin/admin");
const { DepositPlan } = require("../models/admin/depositPlan");
const { FAQ } = require("../models/admin/FAQ");
const { Testimonial } = require("../models/admin/testimonial");
const { Transaction } = require("../models/transaction");
const { User } = require("../models/user/user");
const debug = require("debug")(process.env.DEBUG);

const adminCntrls = {
  deactivateUser: async (req, res, next) => {
    try {
      const { userId } = req.params;
      const user = await User.findByIdAndUpdate(
        userId,
        { status: "DEACTIVATED" },
        { new: true, runValidators: true }
      );

      if (!user) return res.status(400).json({ error: "User not found." });

      res.json({ message: "User updated successfully.", result: user });
    } catch (error) {
      next(error);
    }
  },
  activateUser: async (req, res, next) => {
    try {
      const { userId } = req.params;
      const user = await User.findByIdAndUpdate(
        userId,
        { status: "ACTIVE" },
        { new: true, runValidators: true }
      );

      if (!user) return res.status(400).json({ error: "User not found." });

      res.json({ message: "User updated successfully.", result: user });
    } catch (error) {
      next(error);
    }
  },
  updateLoginDetails: async (req, res, next) => {
    try {
      const { username, currentPassword, newPassword, id } = req.body;
      if (!(username && currentPassword && newPassword && id))
        res.json({ message: "Please input all required fields" });

      const adminExists = await Admin.findOne({
        $or: [
          { email: { $regex: emailOrUsername, $options: "i" } },
          { username: { $regex: emailOrUsername, $options: "i" } },
        ],
      });

      if (adminExists) {
        return res
          .status(400)
          .json({ error: "Username or email already exists. Try again..." });
      } else {
        const admin = await Admin.findById(id);
        const { salt: currentSalt, hash: currentHash } = admin;
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
          admin.salt = newSalt;
          admin.hash = newHash;
          admin.username = username;
          let result = await admin.save();

          res.json({ message: "Details updated successfully!", admin: result });
        }
      }
    } catch (error) {
      next(error);
    }
  },

  updateCompanyInfo: async (req, res, next) => {
    try {
      const { adminId } = req.params;

      const admin = await Admin.findById(adminId);

      if (!admin) {
        res.status(400).json({ error: "Admin doesn't exist" });
      } else {
        admin.companyInfo = {
          ...admin.companyInfo,
          ...req.body,
        };

        const result = await admin.save();

        res.json({
          message: "Company Information updated successfully",
          companyInfo: result.companyInfo,
        });
      }
    } catch (error) {
      next(error);
    }
  },

  //Deposit Plans
  createDepositPlan: async (req, res, next) => {
    try {
      const depositPlan = new DepositPlan({
        ...req.body,
      });

      const result = await depositPlan.save();

      res.json({ message: "Plan created successfully!", depositPlan: result });
    } catch (error) {
      next(error);
    }
  },

  getDepositPlan: async (req, res, next) => {
    try {
      const { depositPlanId } = req.params;

      if (!depositPlanId) {
        return res.status(400).json({ error: "No deposit plan id" });
      } else {
        const result = await DepositPlan.findById(depositPlanId);
        res.json({ message: "Deposit plan retrieved successfully!", result });
      }
    } catch (error) {
      next(error);
    }
  },

  getDepositPlans: async (_, res, next) => {
    try {
      const result = await DepositPlan.find({});
      res.json({ message: "Deposit plans retrieved successfully!", result });
    } catch (error) {
      next(error);
    }
  },

  getDepositPlanNames: async (req, res, next) => {
    try {
      const result = await DepositPlan.distinct("planName");

      res.json({ message: "Get deposit plan names successful", result });
    } catch (error) {
      next(error);
    }
  },

  updateDepositPlan: async (req, res, next) => {
    try {
      const { depositPlanId } = req.params;

      if (!depositPlanId) {
        return res.status(400).json({ error: "No deposit plan id" });
      } else {
        const result = await DepositPlan.findByIdAndUpdate(
          depositPlanId,
          req.body
        );

        if (!depositPlan) {
          return res.status(400).json({ error: "Deposit plan doesn't exist" });
        }

        res.json({ mesage: "Deposit Plan updated successfully!", result });
      }
    } catch (error) {
      next(error);
    }
  },

  //FAQ controllers
  createFAQ: async (req, res, next) => {
    try {
      const { question, answer } = req.body;

      if (!(question && answer))
        return res
          .status(400)
          .json({ message: "Please fill question and answer fields!" });

      const newFAQ = new FAQ({ question, answer });
      const result = await newFAQ.save();

      res.json({ message: "FAQ created successfully!", result });
    } catch (error) {
      next(error);
    }
  },

  deleteFAQ: async (req, res, next) => {
    try {
      const { FAQId } = req.params;

      if (!FAQId) return res.status(400).json({ error: "Please pass FAQ Id" });

      const result = await FAQ.findByIdAndDelete(id);

      if (!result) {
        return res.status(400).json({ error: "FAQ Id doesn't exist..." });
      } else {
        res.json({ message: "FAQ deleted successfully!", result });
      }
    } catch (error) {
      next(error);
    }
  },

  getFAQ: async (req, res, next) => {
    try {
      const { FAQId } = req.params;

      if (!FAQId) return res.status(400).json({ error: "Please pass FAQ Id" });

      const result = await FAQ.findById(id);

      if (!result) {
        return res.status(400).json({ error: "Id doesn't exist..." });
      } else {
        res.json({ message: "Get FAQ Successful!", result });
      }
    } catch (error) {
      next(error);
    }
  },

  getFAQs: async (req, res, next) => {
    try {
      const result = await FAQ.find({});
      res.json({ message: "FAQs retrieved successfully!", result });
    } catch (error) {
      next(error);
    }
  },

  updateFAQ: async (req, res, next) => {
    try {
      const { FAQId } = req.params;

      if (!FAQId) {
        return res.status(400).json({ error: "No FAQ plan id" });
      } else {
        const result = await FAQ.findByIdAndUpdate(FAQId, req.body);

        if (!FAQ) {
          return res.status(400).json({ error: "FAQ doesn't exist" });
        }

        res.json({ message: "FAQ updated successfully!", result });
      }
    } catch (error) {
      next(error);
    }
  },

  //Testimonial controllers
  createTestimonial: async (req, res, next) => {
    try {
      const { userName, testimony } = req.body;

      if (!(userName && testimony))
        return res
          .status(400)
          .json({ message: "Please fill user name and testimony fields!" });

      const newTestimonial = new Testimonial({ userName, testimony });
      const result = await newTestimonial.save();

      res.json({ message: "Testimonial created successfully!", result });
    } catch (error) {
      next(error);
    }
  },

  deleteTestimonial: async (req, res, next) => {
    try {
      const { TestimonialId } = req.params;

      if (!TestimonialId)
        return res.status(400).json({ error: "Please pass Testimonial Id" });

      const result = await Testimonial.findByIdAndDelete(id);

      if (!result) {
        return res
          .status(400)
          .json({ error: "Testimonial Id doesn't exist..." });
      } else {
        res.json({ message: "Testimonial deleted successfully!", result });
      }
    } catch (error) {
      next(error);
    }
  },

  getTestimonial: async (req, res, next) => {
    try {
      const { TestimonialId } = req.params;

      if (!TestimonialId)
        return res.status(400).json({ error: "Please pass Testimonial Id" });

      const result = await Testimonial.findById(id);

      if (!result) {
        return res.status(400).json({ error: "Id doesn't exist..." });
      } else {
        res.json({ message: "Get Testimonial Successful!", result });
      }
    } catch (error) {
      next(error);
    }
  },

  getTestimonials: async (_, res, next) => {
    try {
      const result = await Testimonial.find({});
      res.json({ message: "Testimonials retrieved successfully!", result });
    } catch (error) {
      next(error);
    }
  },

  updateTestimonial: async (req, res, next) => {
    try {
      const { testimonialId } = req.params;

      if (!testimonialId) {
        return res.status(400).json({ error: "No testimonial id" });
      } else {
        const result = await FAQ.findByIdAndUpdate(testimonialId, req.body);

        if (!FAQ) {
          return res.status(400).json({ error: "Testimonial doesn't exist" });
        }

        res.json({ message: "Testimonial updated successfully!", result });
      }
    } catch (error) {
      next(error);
    }
  },

  sendBonus: async (req, res, next) => {
    try {
      const { username, amount, adminId } = req.body;

      const user = await User.findOne({ username }).select("-salt -hash");

      if (!user) {
        return res
          .status(400)
          .json({ error: `User with username ${username} doesn't exist` });
      } else {
        const newTransaction = new Transaction({
          transactionType: "BONUS",
          status: "PENDING",
          amount: amount,
          sender: adminId,
          requestedOn: Date.now(),
          paidOn: Date.now(),
        });

        const transaction = await newTransaction.save();
        const { _id: transactionId } = transaction;

        user.availableBalance += amount;
        user.transactions = [...user.transactions, transactionId];
        const result = await user.save();

        res.json({
          message: "Bonus sent successfully!",
          result,
        });
      }
    } catch (error) {
      next(error);
    }
  },

  sendPenalty: async (req, res, next) => {
    try {
      const { username, amount, adminId } = req.body;

      const user = await User.findOne({ username }).select("-salt -hash");

      if (!user) {
        return res
          .status(400)
          .json({ error: `User with username ${username} doesn't exist` });
      } else {
        const newTransaction = new Transaction({
          transactionType: "PENALTY",
          status: "PENDING",
          amount: amount,
          sender: adminId,
          requestedOn: Date.now(),
          paidOn: Date.now(),
        });

        const transaction = await newTransaction.save();
        const { _id: transactionId } = transaction;

        user.availableBalance += -amount;
        user.transactions = [...user.transactions, transactionId];
        const result = await user.save();

        res.json({
          message: "Penalty sent successfully!",
          result,
        });
      }
    } catch (error) {
      next(error);
    }
  },

  //Set Charges
  setCharges: async (req, res, next) => {
    try {
      const { adminId, withdrawal, deposit } = req.body;

      const admin = await Admin.findByIdAndUpdate(
        adminId,
        {
          email: "Nano@gmail.com",
          $set: {
            "companyInfo.charges.withdrawal": withdrawal,
            "companyInfo.charges.deposit": deposit,
          },
        },
        { new: true }
      ).select("-hash -salt");

      if (!admin) return res.status(400).json({ error: "Admin doesn't exist" });

      res.json({ message: "Set charges Successful!", result: admin });
    } catch (error) {
      next(error);
    }
  },

  getPaginated: async (req, res, next) => {
    try {
      let page = parseInt(req.query.page) - 1 || 0;
      let limit = parseInt(req.query.limit) || 5;
      let status = req.query.status || "";
      let sort = req.query.sort || "createdAt";
      let transactionType = req.query.transactionType || "All";
      console.log(status);

      const transactionTypes = await Transaction.distinct("transactionType");

      // debug(transactionType, 1);
      transactionType === "All"
        ? (transactionType = [...transactionTypes])
        : (transactionType = req.query.transactionType.split(","));

      // debug(transactionType, 2, "DEPOSIT".split(","));
      req.query.sort ? (sort = req.query.sort.split(",")) : (sort = [sort]);

      let sortBy = {};
      sort[1] ? (sortBy[sort[0]] = sort[1]) : (sortBy[sort[0]] = "asc");

      const transactions = await Transaction.find({ status })
        .where("transactionType")
        .in([...transactionType])
        .sort(sortBy)
        .skip(page * limit)
        .limit(limit);

      const total = await Transaction.countDocuments({
        transactionType: { $in: [...transactionType] },
        status,
      });

      let result = {};

      transactions.length === 0
        ? (result = {
            message: "No documents found",
            transactions,
          })
        : (result = {
            total,
            page: page + 1,
            transactions,
          });

      res.json(result);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = adminCntrls;
