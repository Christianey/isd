const router = require("express").Router();
const {editUserNameAndPassword} = require("../controllers/adminCntrls");
const { adminAuthMiddleware, isAdmin } = require("../middleware/auth");

router.patch(
  "/update_admin",
  adminAuthMiddleware,
  isAdmin,
editUserNameAndPassword
);

module.exports.adminRoutes = router;
