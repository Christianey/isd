const User = require("../models/user/user");
const debug = require("debug")(process.env.DEBUG);

const userCntrls = {
  getUser: async (req, res) => {
    const { id } = req.params;

    const user = await User.findById(id).select("-salt -hash");
    console.log(user?.bookBalance);

    if (!user) return res.status(400).json({ message: "User doesn't exist." });

    res.json({ user });
  },

  getAllUsers: async (req, res) => {
    const users = await User.find({}).select("-salt -hash");

    res.json({ message: "Get all users successful", users });
  },
};

module.exports = userCntrls;
