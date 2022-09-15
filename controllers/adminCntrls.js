const {
  validatePassword,
  generatePasswordHash,
} = require("../lib/passwordUtils");
const Admin = require("../models/admin/admin");
const debug = require("debug")(process.env.DEBUG);

const adminCntrls = {
  updateLoginDetails: async (req, res, next) => {
    try {
      const { username, currentPassword, newPassword, id } = req.body;
      if (!(username && currentPassword && newPassword && id))
        res.json({ message: "Please input all required fields" });

      const adminExists = await Admin.findOne({ username });

      if (adminExists) {
        res
          .status(400)
          .json({ message: "Username already exists. Try again..." });
      } else {
        const admin = await Admin.findById(id);
        const { salt: currentSalt, hash: currentHash } = admin;
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
    debug("update company info");
    try {
      const {
        name,
        email,
        officeAddress,
        phoneNumber,
        bitcoinAddress,
        ethereumAddress,
        maxWithdrawal,
        minWithdrawal,
        id,
      } = req.body;

      // res.json({ old: req.body, new: newBody });

      if (
        !(
          name ||
          email ||
          officeAddress ||
          phoneNumber ||
          bitcoinAddress ||
          ethereumAddress ||
          maxWithdrawal ||
          minWithdrawal
        )
      ) {
        return res
          .status(400)
          .json({ message: "Please input correct field(s)" });
      }

      const newBody = Object.fromEntries(
        Object.entries({ ...req.body }).filter(([_, v]) => v != null)
      );

      const admin = await Admin.findById(id);

      if (!admin) {
        res.status(400).json({ message: "Admin doesn't exist" });
      } else {
        admin.companyInfo = {
          ...admin.companyInfo,
          ...newBody,
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
};

module.exports = adminCntrls;
