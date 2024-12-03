const express = require("express");

const router = express.Router();

router.use("/user", require("./user"));
router.use("/reset", require("./reset"));
router.use("/store", require("./store"));
router.use("/subscription", require("./subscription"));

module.exports = router;
