const express = require("express");
const { uploadFile } = require("../../middleware/upload");
const { loginValidator } = require("../../validators/userValidators");
const {
  register,
  login,
  updateProfile,
  getVehiclesAndStores,
} = require("../../controllers/user");
const { userRoute } = require("../../middleware");
const { checkSubscription } = require("../../middleware/subscription");

const router = express.Router();

router.post("/register", uploadFile, register);
router.post("/login", loginValidator, login);
router.put("/updateProfile", userRoute, uploadFile, updateProfile);
router.get(
  "/getVehiclesAndStores",
  userRoute,
  checkSubscription,
  getVehiclesAndStores
);

module.exports = router;
