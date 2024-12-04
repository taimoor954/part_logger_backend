const express = require("express");
const { addAutoPart, updateAutoPart } = require("../../controllers/autoPart");
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

module.exports = router;
