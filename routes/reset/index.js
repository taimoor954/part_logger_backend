const express = require("express");
const {
  codeValidator,
  resetValidator,
} = require("../../validators/emailValidators");
const {
  emailVerificationCode,
  verifyRecoverCode,
  resetPassword,
  changePassword,
} = require("../../controllers/reset/index");
const { userRoute } = require("../../middleware");

const router = express.Router();

router.post("/sendVerificationCode", codeValidator, emailVerificationCode);
router.post("/verifyRecoverCode", verifyRecoverCode);
router.post("/resetPassword", resetValidator, resetPassword);
router.post("/changePassword", userRoute, changePassword);

module.exports = router;
