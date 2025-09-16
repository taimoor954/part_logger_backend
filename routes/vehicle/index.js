const express = require("express");
const { updateVehicle, deleteVehicle } = require("../../controllers/vehicle");
const { getVehicle } = require("../../controllers/vehicle");
const { addVehicle, getVehicleByUser } = require("../../controllers/vehicle");
const { userRoute } = require("../../middleware");
const { checkSubscription } = require("../../middleware/subscription");
const { uploadMultiple } = require("../../middleware/upload");

const router = express.Router();

router.post(
  "/addVehicle",
  userRoute,
  checkSubscription,
  uploadMultiple,
  addVehicle
);

router.put(
  "/updateVehicle/:id",
  userRoute,
  checkSubscription,
  uploadMultiple,
  updateVehicle
);

router.get("/getVehicleById/:id", userRoute, checkSubscription, getVehicle);
router.get("/getVehicleByUser", userRoute, checkSubscription, getVehicleByUser);
router.delete(
  "/deleteVehicle/:id",
  userRoute,
  checkSubscription,
  deleteVehicle
);

module.exports = router;
