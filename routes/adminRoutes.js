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
} = require("../controllers/adminCntrls");
const { adminAuthMiddleware, isAdmin } = require("../middleware/auth");
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

//Admin and company info
router.patch("/update_admin", adminAuthMiddleware, isAdmin, updateLoginDetails);
router.patch(
  "/update_company_info/:adminId",
  adminAuthMiddleware,
  isAdmin,
  validate(validateAdminUpdate),
  updateCompanyInfo
);

//deposit plans
router.get(
  "/get_deposit_plan/:depositPlanId",
  adminAuthMiddleware,
  isAdmin,
  getDepositPlan
);
router.get("/get_deposit_plans", adminAuthMiddleware, isAdmin, getDepositPlans);
router.patch(
  "/get_deposit_plans/:depositPlanId",
  adminAuthMiddleware,
  isAdmin,
  validate(depositPlanValidationUpdate),
  updateDepositPlan
);
router.post(
  "/create_deposit_plan",
  adminAuthMiddleware,
  isAdmin,
  validate(depositPlanValidationCreate),
  createDepositPlan
);

//FAQs
router.get("/get_FAQ/:FAQId", adminAuthMiddleware, isAdmin, getFAQ);
router.get("/get_FAQs", adminAuthMiddleware, isAdmin, getFAQs);
router.patch("/update_FAQ/:FAQId", adminAuthMiddleware, isAdmin, updateFAQ);
router.post("/create_FAQ", adminAuthMiddleware, isAdmin, createFAQ);
router.delete("/delete_FAQ/:FAQId", adminAuthMiddleware, isAdmin, deleteFAQ);

//Testimonials
router.get(
  "/get_testimonial/:testimonialId",
  adminAuthMiddleware,
  isAdmin,
  getTestimonial
);
router.get("/get_testimonials", adminAuthMiddleware, isAdmin, getTestimonials);
router.patch(
  "/update_testimonial/:testimonialId",
  adminAuthMiddleware,
  isAdmin,
  updateTestimonial
);
router.post(
  "/create_testimonial",
  adminAuthMiddleware,
  isAdmin,
  createTestimonial
);
router.delete(
  "/delete_testimonial/:testimonialId",
  adminAuthMiddleware,
  isAdmin,
  deleteTestimonial
);

//Send Bonus and Penalty
router.post(
  "/send_bonus",
  adminAuthMiddleware,
  isAdmin,
  validate(validateReward),
  sendBonus
);
router.post(
  "/send_penalty",
  adminAuthMiddleware,
  isAdmin,
  validate(validateReward),
  sendPenalty
);

//Set Charges
router.post(
  "/set_charges",
  adminAuthMiddleware,
  isAdmin,
  validate(validateCharges),
  setCharges
);

module.exports.adminRoutes = router;
