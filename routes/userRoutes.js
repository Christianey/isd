const router = require("express").Router();
const auth = require("../middleware/auth");
const userCntrls = require("../controllers/userCntrls");

router.get("/user/:id", auth, userCntrls.getUser);
router.get("/users", auth, userCntrls.getAllUsers);

module.exports.userRoutes = router;
