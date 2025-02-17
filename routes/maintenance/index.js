const express = require("express");
const { userRoute } = require("../../middleware");
const { checkSubscription } = require("../../middleware/subscription");
const { uploadMultiple } = require("../../middleware/upload");
const {
  addMaintenance,
  updateMaintenance,
  getMaintenance,
  getMaintenances,
} = require("../../controllers/maintenance");

const router = express.Router();

router.post(
  "/addMaintenance",
  userRoute,
  checkSubscription,
  uploadMultiple,
  addMaintenance
);

router.put(
  "/updateMaintenance/:id",
  userRoute,
  checkSubscription,
  uploadMultiple,
  updateMaintenance
);

router.get("/getMaintenance/:id", userRoute, checkSubscription, getMaintenance);
router.get(
  "/getMaintenancesByUserId",
  userRoute,
  checkSubscription,
  getMaintenances
);

module.exports = router;
