const express = require("express");
const router = express.Router();
const { userRoute } = require("../../middleware");
const {
  addWorker,
  updateWorker,
  deleteWorker,
  getWorker,
  getWorkers,
} = require("../../controllers/worker");

router.post("/addWorker", userRoute, addWorker);
router.get("/getWorkers", userRoute, getWorkers);
router.get("/getWorker/:id", userRoute, getWorker);
router.put("/updateWorker/:id", userRoute, updateWorker);
router.delete("/deleteWorker/:id", userRoute, deleteWorker);

module.exports = router;
