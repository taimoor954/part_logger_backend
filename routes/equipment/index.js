const express = require("express");

const { userRoute } = require("../../middleware");
const { checkSubscription } = require("../../middleware/subscription");
const { uploadMultiple } = require("../../middleware/upload");

const {
  addEquipment,
  getEquipments,
  getEquipment,
  updateEquipment,
  deleteEquipment,
} = require("../../controllers/equipment");

const router = express.Router();

router.post(
  "/addEquipment",
  userRoute,
  checkSubscription,
  uploadMultiple,
  addEquipment
);
router.put(
  "/updateEquipment/:id",
  userRoute,
  checkSubscription,
  uploadMultiple,
  updateEquipment
);
router.get("/getEquipments", userRoute, checkSubscription, getEquipments);
router.get(
  "/getEquipment/:equipmentId",
  userRoute,
  checkSubscription,
  getEquipment
);
router.delete(
  "/deleteEquipment/:equipmentId",
  userRoute,
  checkSubscription,
  deleteEquipment
);

module.exports = router;
