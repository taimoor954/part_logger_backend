const express = require("express");
const {
  savePayment,
  getUserSubscriptions,
} = require("../../controllers/payment");
const { userRoute } = require("../../middleware");

const router = express.Router();

router.post("/savePayment", userRoute, savePayment);
router.get("/getUserSubscriptions", userRoute, getUserSubscriptions);

module.exports = router;
