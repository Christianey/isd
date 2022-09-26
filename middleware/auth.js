require("dotenv").config();
const jwt = require("jsonwebtoken");
const { User } = require("../models/user/user");
const { Admin } = require("../models/admin/admin");

const authMiddlewares = {
  userAuthMiddleware: async (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization)
      return res.status(403).json({ error: "Invalid Authentication" });

    const { id: userId } = jwt.verify(
      authorization,
      process.env.ACCESS_TOKEN_SECRET
    );

    const user = await User.findById(userId).select("-hash -salt");
    if (!user)
      return res.status(403).json({ error: "Invalid Authentication" });

    req.user = user;

    next();
  },
  adminAuthMiddleware: async (req, res, next) => {
    try {
      const { authorization } = req.headers;

      if (!authorization)
        return res.status(403).json({ error: "Invalid Authentication" });

      const { id: adminId } = jwt.verify(
        authorization,
        process.env.ACCESS_TOKEN_SECRET
      );

      const admin = await Admin.findById(adminId).select("-hash -salt");
      if (!admin)
        return res.status(403).json({ error: "Invalid Authentication" });

      req.user = admin;

      next();
    } catch (error) {
      next(error);
    }
  },
  isAdmin: async (req, res, next) => {
    if (!req.user.isAdmin)
      return res
        .status(403)
        .json({ message: "Invalid Authentication, not Admin!" });

    next();
  },
};
module.exports = authMiddlewares;
