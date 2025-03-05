const express = require("express");

const router = express.Router();

const {
  addRecord,
  updateRecord,
  getRecords,
  getRecord,
  deleteRecord,
} = require("../../controllers/record");

const { userRoute } = require("../../middleware");
const { checkSubscription } = require("../../middleware/subscription");
const { uploadMultiple } = require("../../middleware/upload");

router.post(
  "/addRecord",
  userRoute,
  checkSubscription,
  uploadMultiple,
  addRecord
);
router.get("/getRecords/:categoryId", userRoute, checkSubscription, getRecords);
router.get("/getRecord/:recordId", userRoute, checkSubscription, getRecord);
router.put(
  "/updateRecord/:recordId",
  userRoute,
  checkSubscription,
  uploadMultiple,
  updateRecord
);
router.delete("/deleteRecord/:recordId", userRoute, checkSubscription, deleteRecord);

module.exports = router;
