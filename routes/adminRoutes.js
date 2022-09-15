const router = require("express").Router();
const {
  updateLoginDetails,
  updateCompanyInfo,
} = require("../controllers/adminCntrls");
const { adminAuthMiddleware, isAdmin } = require("../middleware/auth");

router.patch("/update_admin", adminAuthMiddleware, isAdmin, updateLoginDetails);
router.patch(
  "/update_company_info",
  adminAuthMiddleware,
  isAdmin,
  updateCompanyInfo
);

module.exports.adminRoutes = router;
