const express = require("express");
const { adminRoute, userRoute } = require("../../middleware");
const {
  addSubscription,
  updateSubscription,
  deleteSubscription,
  getSubscription,
  getSubscriptions,
} = require("../../controllers/subscription");

const router = express.Router();

router.post("/addSubscription", adminRoute, addSubscription);
router.put("/updateSubscription/:id", adminRoute, updateSubscription);
router.delete("/deleteSubscription/:id", adminRoute, deleteSubscription);
router.get("/getSubscription/:id", adminRoute, getSubscription);
router.get("/getSubscriptions", userRoute, getSubscriptions);

module.exports = router;
