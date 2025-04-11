const express = require("express");
const { userRoute } = require("../../middleware");
const { checkSubscription } = require("../../middleware/subscription");
const {
  checkRecordType,
  checkOtherRecordType,
  checkDeleteRecord,
} = require("../../middleware/history");

const router = express.Router();

router.get("/getRecords", userRoute, checkSubscription, checkRecordType);
router.get(
  "/getOtherRecords",
  userRoute,
  checkSubscription,
  checkOtherRecordType
);
router.delete(
  "/deleteRecord/:id",
  userRoute,
  checkSubscription,
  checkDeleteRecord
);

module.exports = router;
