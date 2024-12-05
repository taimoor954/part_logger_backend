const express = require("express");
const { uploadMultiple } = require("../../middleware/upload");
const { userRoute } = require("../../middleware");
const { checkSubscription } = require("../../middleware/subscription");
const {
  addRepair,
  updateRepair,
  getRepair,
  getRepairsByUser,
} = require("../../controllers/repair");

const router = express.Router();

router.post(
  "/addRepair",
  userRoute,
  checkSubscription,
  uploadMultiple,
  addRepair
);

router.put(
  "/updateRepair/:id",
  userRoute,
  checkSubscription,
  uploadMultiple,
  updateRepair
);

router.get("/getRepair/:id", userRoute, checkSubscription, getRepair);
router.get(
  "/getRepairsByUserId",
  userRoute,
  checkSubscription,
  getRepairsByUser
);

module.exports = router;
