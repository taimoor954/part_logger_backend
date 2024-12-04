const { ApiResponse } = require("../helpers");
const UserSubscription = require("../models/UserSubscription");
const moment = require("moment");

exports.checkSubscription = async (req, res, next) => {
  const user = req.user;
  try {
    const subscription = await UserSubscription.findOne({ userId: user._id });
    if (!subscription) {
      return res
        .status(403)
        .json(ApiResponse({}, "You are not subscribed", false));
    }

    req.subscription = subscription;

    const currentDate = moment().utc();

    if (moment(subscription.expiryDate).isBefore(currentDate)) {
      return res
        .status(403)
        .json(ApiResponse({}, "Your subscription has expired", false));
    }

    next();
  } catch (error) {
    return res.status(500).json(ApiResponse({}, error.message, false));
  }
};
