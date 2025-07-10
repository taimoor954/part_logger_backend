const express = require("express");
const {
  addCategory,
  updateCategory,
  getCategories,
  getCategory,
  deleteCategory,
} = require("../../controllers/category");
const { userRoute } = require("../../middleware");
const { checkSubscription } = require("../../middleware/subscription");
const { uploadMultiple } = require("../../middleware/upload");

const router = express.Router();

router.post(
  "/addCategory",
  userRoute,
  checkSubscription,
  uploadMultiple,
  addCategory
);
router.get("/getCategories", userRoute, checkSubscription, getCategories);
router.get("/getCategory/:id", userRoute, checkSubscription, getCategory);
router.put(
  "/updateCategory/:id",
  userRoute,
  checkSubscription,
  uploadMultiple,
  updateCategory
);
router.delete(
  "/deleteCategory/:id",
  userRoute,
  checkSubscription,
  deleteCategory
);

module.exports = router;
