require("dotenv").config();
const debug = require("debug")(process.env.DEBUG);
const jwt = require("jsonwebtoken");

const {
  generatePasswordHash,
  validatePassword,
} = require("../lib/passwordUtils");
const { createAccessToken, createRefreshToken } = require("../lib/jwtUtils");
const User = require("../models/user/user");
const { Admin } = require("../models/admin/admin");

const authCntrls = {
  registerUser: async function (req, res, next) {
    try {
      const { name, username, email, password, country } = req.body;

      if (!name || !username || !email || !password || !country)
        return res
          .status(400)
          .json({ message: "Please input all required fields." });

      if (username.trim().includes(" ")) {
        return res
          .status(400)
          .json({ message: "username must not contain spaces" });
      }

      const newUsername = await User.findOne({ username });

      if (newUsername)
        return res.status(400).json({ message: "Username already in use" });

      const newEmail = await User.findOne({ email });

      if (newEmail) {
        return res.status(400).json({ message: "Email already in use" });
      }

      if (password < 6)
        return res
          .status(400)
          .json({ message: "Password must be at least 6 characters" });

      const { salt, hash } = generatePasswordHash(password);

      const userData = {
        name,
        username,
        email,
        salt,
        hash,
        country,
        isAdmin: false,
      };

      const user = new User(userData);

      const accessToken = createAccessToken({
        id: user._id,
        isAdmin: user.isAdmin,
      });
      const refreshToken = createRefreshToken({ id: user._id });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        path: "/api/refresh_token",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      await user.save();

      res.json({
        message: "Registration Successful!",
        accessToken,
        user: { ...user._doc, salt: null, hash: null },
      });
    } catch (error) {
      next(error);
    }
  },

  registerAdmin: async function (req, res, next) {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        return res
          .status(400)
          .json({ message: "Please input all required fields." });
      } else {
        if (username.trim().includes(" ")) {
          return res
            .status(400)
            .json({ message: "username must not contain spaces" });
        }

        const newUsername = await Admin.findOne({ username });
        const newEmail = await Admin.findOne({ email });

        if (newUsername) {
          return res.status(400).json({ message: "Username already in use" });
        } else if (newEmail) {
          return res.status(400).json({ message: "Email already in use" });
        } else {
          if (password < 6)
            return res
              .status(400)
              .json({ message: "Password must be at least 6 characters" });

          const { salt, hash } = generatePasswordHash(password);

          const adminData = {
            username,
            email,
            salt,
            hash,
            isAdmin: true,
          };

          const admin = new Admin(adminData);

          const accessToken = createAccessToken({
            id: admin._id,
            isAdmin: admin.isAdmin,
          });
          const refreshToken = createRefreshToken({ id: admin._id });

          res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            path: "/api/refresh_token",
            maxAge: 30 * 24 * 60 * 60 * 1000,
          });

          await admin.save();

          res.json({
            message: " Admin Registration Successful!",
            accessToken,
            admin: { ...admin._doc, salt: null, hash: null },
          });
        }
      }
    } catch (error) {
      next(error);
    }
  },

  loginUser: async function (req, res, next) {
    try {
      const { emailOrUsername, password } = req.body;

      if (!emailOrUsername)
        return res
          .status(400)
          .json({ message: "Please input username or email and try again." });

      const user = await User.findOne({
        $or: [
          { email: { $regex: emailOrUsername, $options: "i" } },
          { username: { $regex: emailOrUsername, $options: "i" } },
        ],
      });

      if (!user) {
        return res
          .status(400)
          .json({ message: "Username or email doesn't exist." });
      }

      if (!validatePassword(password, user.salt, user.hash)) {
        return res.status(400).json({ message: "Invalid password." });
      }

      const accessToken = createAccessToken({
        id: user._id,
        isAdmin: user.isAdmin,
      });
      const refreshToken = createRefreshToken({ id: user._id });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        path: "/api/refresh_token",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      res.json({
        message: "Login successful!",
        accessToken,
        user: { ...user._doc, salt: null, hash: null },
      });
    } catch (error) {
      next(error);
    }
  },

  loginAdmin: async function (req, res, next) {
    try {
      const { emailOrUsername, password } = req.body;

      if (!emailOrUsername)
        return res
          .status(400)
          .json({ message: "Please input username or email and try again." });

      const admin = await Admin.findOne({
        $or: [
          { email: { $regex: emailOrUsername, $options: "i" } },
          { username: { $regex: emailOrUsername, $options: "i" } },
        ],
      });
      console.log({ admin });

      if (!admin) {
        return res
          .status(400)
          .json({ message: "Username or email doesn't exist." });
      }

      if (!validatePassword(password, admin.salt, admin.hash)) {
        return res.status(400).json({ message: "Invalid password." });
      }

      const accessToken = createAccessToken({
        id: admin._id,
        isAdmin: admin.isAdmin,
      });
      const refreshToken = createRefreshToken({ id: admin._id });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        path: "/api/refresh_token",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      res.json({
        message: "Login successful!",
        accessToken,
        user: { ...admin._doc, salt: null, hash: null },
      });
    } catch (error) {
      next(error);
    }
  },

  logout: async function (req, res, next) {
    try {
      res.clearCookie("refreshToken", {
        path: "/api/refresh_token",
      });

      res.json({ message: "Logged out." });
    } catch (error) {
      next(error);
    }
  },

  generateAccessToken: async function (req, res, next) {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) return res.status(400).json({ msg: "Please login." });

      jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (error, { id }) => {
          if (error) return res.status(400).json({ msg: "Please login." });

          const user = await User.findById(id)
            .select("-hash -salt")
            .populate("followers following", "-hash -salt");

          if (!user)
            return res.status(400).json({ msg: "User doesn't exist." });

          const accessToken = createAccessToken({ id: user._id });

          res.json({
            accessToken,
            user: { ...user._doc, salt: null, hash: null },
          });
        }
      );
    } catch (error) {
      next(error);
    }
  },
};

module.exports = authCntrls;
