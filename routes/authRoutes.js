const router = require("express").Router();
const authCntrls = require("../controllers/authCntrls");

router.post("/register", authCntrls.registerUser);

router.post("/login", authCntrls.loginUser);

router.post("/register_admin", authCntrls.registerAdmin);

router.post("/login_admin", authCntrls.loginAdmin);

router.post("/logout", authCntrls.logout);

router.post("/refresh_token", authCntrls.generateAccessToken);

module.exports.authRoutes = router;
