const express = require("express");
const { userRoute, adminRoute } = require("../../middleware");
const {
  addFeedback,
  getFeedbacks,
  getFeedbackById,
} = require("../../controllers/feedback");
const { addFeedbackValidator } = require("../../validators/feedbackValdators");
const { checkSubscription } = require("../../middleware/subscription");

const router = express.Router();

router.post(
  "/addFeedback",
  userRoute,
  checkSubscription,
  addFeedbackValidator,
  addFeedback
);
router.get("/getFeedbacks", adminRoute, getFeedbacks);
router.get("/getFeedback/:id", adminRoute, getFeedbackById);

module.exports = router;
