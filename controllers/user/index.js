const User = require("../../models/User");
const { generateToken, ApiResponse } = require("../../helpers");
const bcrypt = require("bcrypt");
const moment = require("moment");
const fs = require("fs");
const Vehicle = require("../../models/Vehicle");
const Store = require("../../models/Store");

// Signup Controller
exports.register = async (req, res) => {
  const { firstName, lastName, email, password, phone, gender, isAdmin } =
    req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json(ApiResponse({}, "A User with this Email Already Exists", false));
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      gender,
      phone,
      isAdmin: isAdmin ? isAdmin : false,
    });

    if (req.body.image) {
      user.image = req.body.image;
    }
    const token = generateToken(user);
    await user.save();
    res
      .status(200)
      .json(
        ApiResponse(
          { user, token },
          "Your Account has been created Successfully",
          true
        )
      );
  } catch (error) {
    console.log(error);
    return res.status(500).json(ApiResponse({}, error.message, false));
  }
};

// Login Controller for User
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json(ApiResponse({}, "No User Found With this Email", false));
    }
    if (user?.status === "INACTIVE") {
      return res
        .status(400)
        .json(ApiResponse({}, "Your Account is Not Approved By Admin!", false));
    }
    const compare = await bcrypt.compare(password, user.password);
    if (!compare) {
      return res
        .status(401)
        .json(ApiResponse({}, "Invalid Credentials", false));
    }
    const token = generateToken(user);
    res
      .status(200)
      .send(ApiResponse({ token, user }, "Logged In Successfully", true));
  } catch (error) {
    console.log(error);
    return res.status(500).json(ApiResponse({}, error.message, false));
  }
};

exports.updateProfile = async (req, res) => {
  try {
    let user = await User.findById(req.user._id);
    let updated = {};
    if (!user) {
      return res.status(404).json(ApiResponse({}, "User Not Found", false));
    }

    updated.firstName = req.body.firstName
      ? req.body.firstName
      : user.firstName;
    updated.lastName = req.body.lastName ? req.body.lastName : user.lastName;
    updated.phone = req.body.phone ? req.body.phone : user.phone;
    updated.gender = req.body.gender ? req.body.gender : user?.gender;

    if (req.body.image) {
      if (user.image !== "") {
        const filePath = `./Uploads/${user.image}`;
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`Image with file path ${filePath} deleted`);
        }
      }
      updated.image = req.body.image;
    }

    user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updated },
      { new: true }
    );

    res
      .status(200)
      .json(ApiResponse(user, "Profile Updated Successfully", true));
  } catch (error) {
    console.error(error);
    res.status(500).json(ApiResponse({}, error.message, false));
  }
};

exports.getVehiclesAndStores = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ userId: req.user._id });
    const stores = await Store.find({ userId: req.user._id });
    res
      .status(200)
      .json(
        ApiResponse(
          { vehicles, stores },
          "Vehicles and Stores Fetched Successfully",
          true
        )
      );
  } catch (error) {
    console.error(error);
    res.status(500).json(ApiResponse({}, error.message, false));
  }
};
