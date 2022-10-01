const router = require("express").Router();
const userCntrls = require("../controllers/userCntrls");
const {
  authMiddleware,
  isAdmin,
  authMiddleware: userAuthMiddleware,
} = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
  userValidateUpdate,
  userValidateTransfer,
  userValidateWalletCreate,
  userValidateMakeWithdrawal,
} = require("../models/user/user");

//User CRUD
router.get("/users", authMiddleware, isAdmin, userCntrls.getAllUsers);
router.get("/user/:id", authMiddleware, isAdmin, userCntrls.getUser);
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

//Make Withdrawal
router.post(
  "/make_withdrawal",
  userAuthMiddleware,
  validate(userValidateMakeWithdrawal),
  userCntrls.makeWithdrawal
);

router.post(
  "/make_deposit",
  userAuthMiddleware,
  validate(userValidateMakeWithdrawal),
  userCntrls.makeDeposit
);

//Get Withdrawal and Deposit charges
router.get(
  "/get_withdrawal_charge",
  userAuthMiddleware,
  userCntrls.getWithdrawalCharge
);

router.get(
  "/get_deposit_charge",
  userAuthMiddleware,
  userCntrls.getDepositCharge
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
  "/delete_wallet/:userId/:walletId",
  userAuthMiddleware,
  userCntrls.deleteUserWallet
);

module.exports.userRoutes = router;
