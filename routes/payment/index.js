const express = require("express");
const { savePayment } = require("../../controllers/payment");
const { userRoute } = require("../../middleware");

const router = express.Router();

router.post("/savePayment", userRoute, savePayment);

module.exports = router;
