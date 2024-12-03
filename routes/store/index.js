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

const router = express.Router();

router.post("/addStore", userRoute, addStoreValidator, addStore);
router.get("/getStore/:storeId", userRoute, getStore);
router.put("/updateStore/:storeId", userRoute, updateStore);
router.post("/addWorkers/:storeId", userRoute, addWorker);
router.get("/getStoresByUser", userRoute, getStoresByUser);

module.exports = router;
