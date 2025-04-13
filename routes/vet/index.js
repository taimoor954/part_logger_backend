const express = require("express");
const { userRoute } = require("../../middleware");
const { checkSubscription } = require("../../middleware/subscription");
const { uploadMultiple } = require("../../middleware/upload");

const {
  addVet,
  getVets,
  getVet,
  updateVet,
  deleteVet,
} = require("../../controllers/vet");

const router = express.Router();

router.post("/addVet", userRoute, checkSubscription, uploadMultiple, addVet);
router.put(
  "/updateVet/:id",
  userRoute,
  checkSubscription,
  uploadMultiple,
  updateVet
);

router.get("/getVets", userRoute, checkSubscription, getVets);
router.get("/getVet/:vetId", userRoute, checkSubscription, getVet);
router.delete("/deleteVet/:id", userRoute, checkSubscription, deleteVet);

module.exports = router;
