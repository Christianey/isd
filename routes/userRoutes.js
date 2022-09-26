const router = require("express").Router();
const userCntrls = require("../controllers/userCntrls");
const {
  adminAuthMiddleware,
  isAdmin,
  userAuthMiddleware,
} = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
  userValidateUpdate,
  userValidateTransfer,
  userValidateWalletCreate,
} = require("../models/user/user");

//User CRUD
router.get("/users", adminAuthMiddleware, isAdmin, userCntrls.getAllUsers);
router.get("/user/:id", adminAuthMiddleware, isAdmin, userCntrls.getUser);
router.patch(
  "/update_user/:userId",
  userAuthMiddleware,
  validate(userValidateUpdate),
  userCntrls.updateUser
);

//Get User Transactions
router.get(
  "/transactions/:userId",
  userAuthMiddleware,
  userCntrls.getTransactions
);

//makeTransfer
router.post(
  "/transfer",
  userAuthMiddleware,
  validate(userValidateTransfer),
  userCntrls.makeTransfer
);

//Wallets
router.post(
  "/add_wallet",
  userAuthMiddleware,
  validate(userValidateWalletCreate),
  userCntrls.addWallet
);

router.get(
  "/get_wallet/:userId",
  userAuthMiddleware,
  userCntrls.getUserWallets
);

router.put(
  "/edit_wallet/:userId/:walletId",
  userAuthMiddleware,
  userCntrls.editUserWallet
);

router.delete(
  "/edit_wallet/:userId/:walletId",
  userAuthMiddleware,
  userCntrls.getUserWallets
);

module.exports.userRoutes = router;
