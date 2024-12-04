const express = require("express");
const { uploadMultiple } = require("../../middleware/upload");
const { userRoute } = require("../../middleware");
const { checkSubscription } = require("../../middleware/subscription");
const { addRepair, updateRepair } = require("../../controllers/repair");

const router = express.Router();

router.post(
  "/addRepair",
  userRoute,
  checkSubscription,
  uploadMultiple,
  addRepair
);

// router.put(
//   "/updateRepair/:id",
//   userRoute,
//   checkSubscription,
//   uploadMultiple,
//   updateRepair
// );

module.exports = router;
