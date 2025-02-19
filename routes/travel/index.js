const { userRoute } = require("../../middleware");
const { checkSubscription } = require("../../middleware/subscription");
const { uploadMultiple } = require("../../middleware/upload");
const { addTravelExpense } = require("../../controllers/travel");

const express = require("express");

const router = express.Router();

router.post(
  "/addTravelExpense",
  userRoute,
  checkSubscription,
  uploadMultiple,
  addTravelExpense
);

module.exports = router;
