const express = require("express");

const { userRoute } = require("../../middleware");
const { checkSubscription } = require("../../middleware/subscription");
const { uploadMultiple } = require("../../middleware/upload");
const {
  addGasExpense,
  getGasExpenses,
  getGasExpense,
  updateGasExpense,
  deleteGasExpense,
} = require("../../controllers/gas");

const router = express.Router();

router.post(
  "/addGasExpense",
  userRoute,
  checkSubscription,
  uploadMultiple,
  addGasExpense
);

router.put(
  "/updateGasExpense/:id",
  userRoute,
  checkSubscription,
  uploadMultiple,
  updateGasExpense
);

router.get("/getGasExpenses", userRoute, checkSubscription, getGasExpenses);
router.get("/getGasExpense/:id", userRoute, checkSubscription, getGasExpense);
router.delete(
  "/deleteGasExpense/:id",
  userRoute,
  checkSubscription,
  deleteGasExpense
);

module.exports = router;
