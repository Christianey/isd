const User = require("../models/user/user");
const debug = require("debug")(process.env.DEBUG);

const userCntrls = {
  getUser: async (req, res) => {
    const { user } = req;

    if (!user)
      return res.status(403).json({ message: "Invalid Authentication" });

    const { id } = req.params;

    const profile = await User.findById(id).select("-salt -hash");
    if (!profile)
      return res.status(400).json({ message: "User doesn't exist." });

    res.json({ user: profile });
  },

  getAllUsers: async (req, res) => {
    const users = await User.find({}).select("-salt -hash");

    res.json({ message: "Get all users successful", users });
  },
};

module.exports = userCntrls;
