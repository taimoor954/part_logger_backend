const express = require("express");
const { userRoute } = require("../../middleware");
const { checkSubscription } = require("../../middleware/subscription");
const {
  checkRecordType,
  checkOtherRecordType,
  checkDeleteRecord,
  checkUpdateRecord,
} = require("../../middleware/history");
const { uploadMultiple } = require("../../middleware/upload");
const { getExpenses } = require("../../controllers/expense");

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

router.put(
  "/updateRecord/:id",
  userRoute,
  checkSubscription,
  uploadMultiple,
  checkUpdateRecord
);

router.get("/getExpenses", userRoute, checkSubscription, getExpenses);

module.exports = router;
