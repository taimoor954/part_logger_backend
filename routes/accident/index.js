const express = require("express");
const { userRoute } = require("../../middleware");
const { uploadMultiple } = require("../../middleware/upload");
const { checkSubscription } = require("../../middleware/subscription");
const {
  addAccident,
  updateAccident,
  getAccident,
  getAccidentsByIds,
  deleteAccident,
} = require("../../controllers/accident");
const router = express.Router();

router.post(
  "/addAccident",
  userRoute,
  checkSubscription,
  uploadMultiple,
  addAccident
);

router.put(
  "/updateAccident/:id",
  userRoute,
  checkSubscription,
  uploadMultiple,
  updateAccident
);

router.get("/getAccident/:id", userRoute, checkSubscription, getAccident);
router.get("/getAccidents", userRoute, checkSubscription, getAccidentsByIds);
router.delete("/deleteAccident/:id", userRoute, checkSubscription, deleteAccident);

module.exports = router;
