const express = require("express");
const { userRoute } = require("../../middleware");
const { checkSubscription } = require("../../middleware/subscription");
const { uploadMultiple } = require("../../middleware/upload");
const {
  addVehicleService,
  updateVehicleService,
  getVehicleService,
  getVehicleServices,
  deleteVehicleService,
} = require("../../controllers/vehicleService");

const router = express.Router();

router.post(
  "/addVehicleService",
  userRoute,
  checkSubscription,
  uploadMultiple,
  addVehicleService
);
router.put(
  "/updateVehicleService/:id",
  userRoute,
  checkSubscription,
  uploadMultiple,
  updateVehicleService
);
router.get(
  "/getVehicleService/:id",
  userRoute,
  checkSubscription,
  getVehicleService
);

router.get(
  "/getVehicleServicesByUserId",
  userRoute,
  checkSubscription,
  getVehicleServices
);

router.delete(
  "/deleteVehicleService/:id",
  userRoute,
  checkSubscription,
  deleteVehicleService
);

module.exports = router;
