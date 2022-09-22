const router = require("express").Router();
const userCntrls = require("../controllers/userCntrls");
const {
  adminAuthMiddleware,
  isAdmin,
  userAuthMiddleware,
} = require("../middleware/auth");
const validate = require("../middleware/validate");
const { userValidateUpdate } = require("../models/user/user");

//User CRUD
router.get("/users", adminAuthMiddleware, isAdmin, userCntrls.getAllUsers);
router.get("/user/:id", adminAuthMiddleware, isAdmin, userCntrls.getUser);
router.patch(
  "/update_user/:userId",
  userAuthMiddleware,
  validate(userValidateUpdate),
  userCntrls.updateUser
);

//Get User Transaction
router.get("/transactions/:userId", userAuthMiddleware, userCntrls.getTransactions)

module.exports.userRoutes = router;
