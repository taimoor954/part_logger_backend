const { userRoute } = require("../../middleware");
const { checkSubscription } = require("../../middleware/subscription");
const { uploadMultiple } = require("../../middleware/upload");
const {
  addTravelExpense,
  updateExpense,
  getExpense,
  getExpenses,
  deleteExpense,
} = require("../../controllers/travel");

const express = require("express");

const router = express.Router();

router.post(
  "/addTravelExpense",
  userRoute,
  checkSubscription,
  uploadMultiple,
  addTravelExpense
);

router.put(
  "/updateExpense/:id",
  userRoute,
  checkSubscription,
  uploadMultiple,
  updateExpense
);

router.get("/getExpenses", userRoute, checkSubscription, getExpenses);
router.get("/getExpense/:id", userRoute, checkSubscription, getExpense);
router.delete(
  "/deleteExpense/:id",
  userRoute,
  checkSubscription,
  deleteExpense
);

module.exports = router;
