const { ApiResponse } = require("../helpers");
const User = require("../models/User");
require("dotenv").config();
const jwt = require("jsonwebtoken");

// For User authenticated Routes
exports.userRoute = async (req, res, next) => {
  let token = req.body.token || req.query.token || req.headers["authorization"];
  try {
    if (!token) {
      return res.status(403).json(ApiResponse({}, "Access Forbidden", false));
    }
    const decoded = jwt.verify(
      token.replace("Bearer ", ""),
      process.env.JWT_SECRET
    );

    let user = await User.findById(decoded._id).select("-password");
    if (!user) {
      return res
        .status(401)
        .json(ApiResponse({}, "Unauthorized Access", false));
    }
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    return res
      .status(401)
      .send(ApiResponse({}, "Invalid Token, Please sign in again", false));
  }
};

// For Admin authenticated Routes
exports.adminRoute = async (req, res, next) => {
  let token = req.body.token || req.query.token || req.headers["authorization"];
  try {
    if (!token) {
      return res.status(403).json(ApiResponse({}, "Access Forbidden", false));
    }
    const decoded = jwt.verify(
      token.replace("Bearer ", ""),
      process.env.JWT_SECRET
    );

    if (!decoded.isAdmin) {
      return res
        .status(401)
        .json(ApiResponse(decoded.isAdmin, "Unauthorized Access", false));
    }
    let admin = await User.findById(decoded._id).select("-password");
    if (!admin) {
      return res
        .status(401)
        .json(ApiResponse({}, "Unauthorized Access", false));
    }
    req.user = admin;
    next();
  } catch (error) {
    console.log(error);
    return res
      .status(401)
      .send(ApiResponse({}, "Invalid Token, Please sign in again", false));
  }
};
