const express = require("express");
const { userRoute } = require("../../middleware");
const {
  addStore,
  addWorker,
  getStore,
  updateStore,
  getStoresByUser,
} = require("../../controllers/store");
const { addStoreValidator } = require("../../validators/storeValidators");
const { checkSubscription } = require("../../middleware/subscription");

const router = express.Router();

router.post(
  "/addStore",
  userRoute,
  checkSubscription,
  addStoreValidator,
  addStore
);
router.get("/getStore/:storeId", userRoute, checkSubscription, getStore);
router.put("/updateStore/:storeId", userRoute, checkSubscription, updateStore);
router.post("/addWorkers/:storeId", userRoute, checkSubscription, addWorker);
router.get("/getStoresByUser", userRoute, checkSubscription, getStoresByUser);

module.exports = router;
