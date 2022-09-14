const router = require("express").Router();
const userCntrls = require("../controllers/userCntrls");
const { adminAuthMiddleware, isAdmin } = require("../middleware/auth");

router.get("/users", adminAuthMiddleware, isAdmin, userCntrls.getAllUsers);
router.get("/user/:id", adminAuthMiddleware, isAdmin, userCntrls.getUser);

module.exports.userRoutes = router;
