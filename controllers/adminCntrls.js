const Admin = require("../models/admin/admin");
const debug = require("debug")(process.env.DEBUG);

const adminCntrls = {
  editUserNameAndPassword: async (req, res, next) => {
    try {
      const { username, password, id } = req.body;
      if (!username || !password || !id)
        res.json({ message: "Please input all required fields" });

      const adminExists = await Admin.findOne({ username });

      if (adminExists) {
        res.status(400).json({ message: "Username already exists. Try again..." });
      } else {
        const admin = await Admin.findByIdAndUpdate(
          id,
          { username, password },
          { new: true }
        );

        res.json({ message: "edit successful", admin });
      }
    } catch (error) {
      next(error);
    }
  },
};

module.exports = adminCntrls;
