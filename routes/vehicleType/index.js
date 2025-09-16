const express = require("express");
const {
  addVehicleType,
  updateVehicleType,
  deleteVehicleType,
  getVehicleTypes,
  getVehicleType,
} = require("../../controllers/vehicleType");
const { adminRoute, userRoute } = require("../../middleware");
const { checkSubscription } = require("../../middleware/subscription");
const { uploadMultiple, uploadFile } = require("../../middleware/upload");

const router = express.Router();

router.post("/addVehicleType", adminRoute, uploadFile, addVehicleType);

router.put("/updateVehicleType/:id", adminRoute, uploadFile, updateVehicleType);

router.get("/getVehicleType/:id", userRoute, getVehicleType);

router.get("/getVehicleTypes", userRoute, getVehicleTypes);

router.delete("/deleteVehicleType/:id", adminRoute, deleteVehicleType);

module.exports = router;
