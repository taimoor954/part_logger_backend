const express = require("express");
const { userRoute } = require("../../middleware");
const { checkSubscription } = require("../../middleware/subscription");
const { uploadMultiple } = require("../../middleware/upload");
const {
  addPet,
  getPets,
  getPet,
  updatePet,
  deletePet,
} = require("../../controllers/pet");

const router = express.Router();

router.post("/addPet", userRoute, checkSubscription, uploadMultiple, addPet);
router.put(
  "/updatePet/:petId",
  userRoute,
  checkSubscription,
  uploadMultiple,
  updatePet
);
router.get("/getPets", userRoute, checkSubscription, getPets);
router.get("/getPet/:petId", userRoute, checkSubscription, getPet);
router.delete("/deletePet/:id", userRoute, checkSubscription, deletePet);

module.exports = router;
