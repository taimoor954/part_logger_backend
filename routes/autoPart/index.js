const express = require("express");
const {
  addAutoPart,
  updateAutoPart,
  getAutoPart,
  getAutoPartsByUser,
  deleteAutoPart,
} = require("../../controllers/autoPart");
const { userRoute } = require("../../middleware");
const { checkSubscription } = require("../../middleware/subscription");
const { uploadMultiple } = require("../../middleware/upload");

const router = express.Router();

router.post(
  "/addAutoPart",
  userRoute,
  checkSubscription,
  uploadMultiple,
  addAutoPart
);

router.put(
  "/updateAutoPart/:id",
  userRoute,
  checkSubscription,
  uploadMultiple,
  updateAutoPart
);

router.get("/getAutoPart/:id", userRoute, checkSubscription, getAutoPart);
router.get(
  "/getAutoPartsByUserId",
  userRoute,
  checkSubscription,
  getAutoPartsByUser
);
router.delete(
  "/deleteAutoPart/:id",
  userRoute,
  checkSubscription,
  deleteAutoPart
);

module.exports = router;
