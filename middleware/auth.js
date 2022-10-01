require("dotenv").config();
const jwt = require("jsonwebtoken");
const { User } = require("../models/user/user");
const { Admin } = require("../models/admin/admin");

const authMiddlewares = {
  // authMiddleware: async (req, res, next) => {
  //   const { authorization } = req.headers;

  //   if (!authorization)
  //     return res.status(403).json({ error: "Invalid Authentication" });

  //   const { id: userId } = jwt.verify(
  //     authorization,
  //     process.env.ACCESS_TOKEN_SECRET
  //   );

  //   const user = await User.findById(userId).select("-hash -salt");
  //   if (!user) return res.status(403).json({ error: "Invalid Authentication" });

  //   req.user = user;

  //   next();
  // },
  authMiddleware: async (req, res, next) => {
    try {
      const { authorization } = req.headers;

      if (!authorization)
        return res.status(403).json({ error: "Invalid Authentication" });

      let { id } = jwt.verify(authorization, process.env.ACCESS_TOKEN_SECRET);

      let userOrAdmin = await Promise.any([
        await Admin.findById(id),
        await User.findById(id),
      ]);

      if (!userOrAdmin)
        return res.status(403).json({ error: "Invalid Authentication" });

      req.user = userOrAdmin;

      next();
    } catch (error) {
      next(error);
    }
  },
  isAdmin: async (req, res, next) => {
    console.log(req.user, "isAdmin route");
    if (!req.user.isAdmin)
      return res
        .status(403)
        .json({ message: "Invalid Authentication, not Admin!" });

    next();
  },
};
module.exports = authMiddlewares;
