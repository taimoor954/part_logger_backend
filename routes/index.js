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

module.exports = router;
