const express = require("express");

const router = express.Router();

router.use("/user", require("./user"));
router.use("/reset", require("./reset"));
router.use("/store", require("./store"));
router.use("/subscription", require("./subscription"));
router.use("/feedback", require("./feedback"));
router.use("/payment", require("./payment"));
router.use("/vehicle", require("./vehicle"));
router.use("/autopart", require("./autoPart"));
router.use("/repair", require("./repair"));
router.use("/worker", require("./worker"));
router.use("/maintenance", require("./maintenance"));
router.use("/accident", require("./accident"));
router.use("/travel", require("./travel"));
router.use("/gas", require("./gas"));
router.use("/pet", require("./pet"));
router.use("/vet", require("./vet"));
router.use("/equipment", require("./equipment"));
router.use("/category", require("./category"));
router.use("/record", require("./record"));
router.use("/history", require("./history"));
router.use("/vehicleService", require("./vehicleService"));
router.use("/vehicleType", require("./vehicleType"));
router.use("/draft", require("./draft"));
module.exports = router;
