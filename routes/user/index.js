const express = require("express");
const { uploadFile } = require("../../middleware/upload");
const { loginValidator } = require("../../validators/userValidators");
const { register, login, updateProfile } = require("../../controllers/user");
const { userRoute } = require("../../middleware");

const router = express.Router();

router.post("/register", uploadFile, register);
router.post("/login", loginValidator, login);
router.put("/updateProfile", userRoute, uploadFile, updateProfile);

module.exports = router;
