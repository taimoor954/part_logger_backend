const express = require("express");
const {
  getDrafts,
  createDraft,
  getDraftById,
  deleteDraft,
} = require("../../controllers/draft");
const { userRoute } = require("../../middleware");
const { checkSubscription } = require("../../middleware/subscription");
const { uploadMultiple } = require("../../middleware/upload");

const router = express.Router();

router.post(
  "/createDraft",
  userRoute,
  checkSubscription,
  uploadMultiple,
  createDraft
);
router.get("/getDrafts", userRoute, checkSubscription, getDrafts);
router.get("/getDraftById/:id", userRoute, checkSubscription, getDraftById);
router.delete("/deleteDraft/:id", userRoute, checkSubscription, deleteDraft);

module.exports = router;
