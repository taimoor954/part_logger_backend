const express = require("express");
const { uploadFile } = require("../../middleware/upload");
const { loginValidator } = require("../../validators/userValidators");
const {
  register,
  login,
  updateProfile,
  getVehiclesAndStores,
  getUsers,
  getUserById,
  toggleStatus,
} = require("../../controllers/user");
const { userRoute, adminRoute } = require("../../middleware");
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

// admin routes
router.get("/getUsers", adminRoute, getUsers);
router.get("/getUserById/:id", adminRoute, getUserById);
router.put("/toggleStatus/:id", adminRoute, toggleStatus);

module.exports = router;
