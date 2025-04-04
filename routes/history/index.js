const express = require("express");
const { userRoute } = require("../../middleware");
const { checkSubscription } = require("../../middleware/subscription");
const {
  checkRecordType,
  checkOtherRecordType,
} = require("../../middleware/history");

const router = express.Router();

router.get("/getRecords", userRoute, checkSubscription, checkRecordType);
router.get(
  "/getOtherRecords",
  userRoute,
  checkSubscription,
  checkOtherRecordType
);

module.exports = router;
