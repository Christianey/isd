const router = require("express").Router();
const {
  updateLoginDetails,
  updateCompanyInfo,
  createDepositPlan,
  getDepositPlan,
  getDepositPlans,
  updateDepositPlan,
  getFAQ,
  getFAQs,
  updateFAQ,
  createFAQ,
  deleteFAQ,
  getTestimonial,
  getTestimonials,
  updateTestimonial,
  createTestimonial,
  deleteTestimonial,
  sendBonus,
  sendPenalty,
  setCharges,
  getDepositPlanNames,
  getPaginated,
  deactivateUser,
  activateUser,
} = require("../controllers/adminCntrls");
const { authMiddleware, isAdmin } = require("../middleware/auth");
const {
  validateAdminUpdate,
  validateCharges,
} = require("../models/admin/admin");
const validate = require("../middleware/validate");
const {
  depositPlanValidationCreate,
  depositPlanValidationUpdate,
} = require("../models/admin/depositPlan");
const { validateReward } = require("../models/transaction");

//deactivate & activate user
router.patch(
  "/deactivate_user/:userId",
  authMiddleware,
  isAdmin,
  deactivateUser
);
router.patch("/activate_user/:userId", authMiddleware, isAdmin, activateUser);

//Admin and company info
router.patch("/update_admin", authMiddleware, isAdmin, updateLoginDetails);
router.patch(
  "/update_company_info/:adminId",
  authMiddleware,
  isAdmin,
  validate(validateAdminUpdate),
  updateCompanyInfo
);

//deposit plans
router.get(
  "/get_deposit_plan/:depositPlanId",
  authMiddleware,
  isAdmin,
  getDepositPlan
);
router.get(
  "/get_deposit_plan_names",
  authMiddleware,
  isAdmin,
  getDepositPlanNames
);
router.get("/get_deposit_plans", authMiddleware, isAdmin, getDepositPlans);
router.patch(
  "/get_deposit_plans/:depositPlanId",
  authMiddleware,
  isAdmin,
  validate(depositPlanValidationUpdate),
  updateDepositPlan
);
router.post(
  "/create_deposit_plan",
  authMiddleware,
  isAdmin,
  validate(depositPlanValidationCreate),
  createDepositPlan
);

//FAQs
router.get("/get_FAQ/:FAQId", authMiddleware, isAdmin, getFAQ);
router.get("/get_FAQs", authMiddleware, isAdmin, getFAQs);
router.patch("/update_FAQ/:FAQId", authMiddleware, isAdmin, updateFAQ);
router.post("/create_FAQ", authMiddleware, isAdmin, createFAQ);
router.delete("/delete_FAQ/:FAQId", authMiddleware, isAdmin, deleteFAQ);

//Testimonials
router.get(
  "/get_testimonial/:testimonialId",
  authMiddleware,
  isAdmin,
  getTestimonial
);
router.get("/get_testimonials", authMiddleware, isAdmin, getTestimonials);
router.patch(
  "/update_testimonial/:testimonialId",
  authMiddleware,
  isAdmin,
  updateTestimonial
);
router.post("/create_testimonial", authMiddleware, isAdmin, createTestimonial);
router.delete(
  "/delete_testimonial/:testimonialId",
  authMiddleware,
  isAdmin,
  deleteTestimonial
);

//Send Bonus and Penalty
router.post(
  "/send_bonus",
  authMiddleware,
  isAdmin,
  validate(validateReward),
  sendBonus
);
router.post(
  "/send_penalty",
  authMiddleware,
  isAdmin,
  validate(validateReward),
  sendPenalty
);

//Set Charges
router.put(
  "/set_charges",
  authMiddleware,
  isAdmin,
  validate(validateCharges),
  setCharges
);

//paginated
router.get("/paginated", authMiddleware, isAdmin, getPaginated);

module.exports.adminRoutes = router;
