const { ApiResponse } = require("../../helpers");
const Subscription = require("../../models/Subscription");

exports.addSubscription = async (req, res) => {
  const { planName, planType, planCharges, vehicleLimit } = req.body;
  try {
    const subscription = new Subscription({
      planName,
      planType,
      planCharges,
      vehicleLimit,
    });
    await subscription.save();
    return res
      .status(201)
      .json(ApiResponse(subscription, "Subscription added successfully", true));
  } catch (error) {
    return res.status(400).json(ApiResponse({}, error.message, false));
  }
};

exports.updateSubscription = async (req, res) => {
  const { id } = req.params;
  const { planName, planType, planCharges, vehicleLimit } = req.body;
  try {
    const subscription = await Subscription.findById(id);
    if (!subscription) {
      return res
        .status(404)
        .json(ApiResponse({}, "Subscription not found", false));
    }

    subscription.planName = planName || subscription.planName;
    subscription.planType = planType || subscription.planType;
    subscription.planCharges = planCharges || subscription.planCharges;
    subscription.vehicleLimit = vehicleLimit || subscription.vehicleLimit;

    await subscription.save();
    return res
      .status(200)
      .json(
        ApiResponse(subscription, "Subscription updated successfully", true)
      );
  } catch (error) {
    return res.status(400).json(ApiResponse({}, error.message, false));
  }
};

exports.deleteSubscription = async (req, res) => {
  const { id } = req.params;
  try {
    const subscription = await Subscription.findByIdAndDelete(id);

    if (!subscription) {
      return res
        .status(404)
        .json(ApiResponse({}, "Subscription not found", false));
    }

    return res
      .status(200)
      .json(
        ApiResponse(subscription, "Subscription deleted successfully", true)
      );
  } catch (error) {
    return res.status(400).json(ApiResponse({}, error.message, false));
  }
};

exports.getSubscription = async (req, res) => {
  const { id } = req.params;
  try {
    const subscription = await Subscription.findById(id);
    if (!subscription) {
      return res
        .status(404)
        .json(ApiResponse({}, "Subscription not found", false));
    }

    return res
      .status(200)
      .json(ApiResponse(subscription, "Subscription found", true));
  } catch (error) {
    return res.status(400).json(ApiResponse({}, error.message, false));
  }
};

exports.getSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find();
    return res
      .status(200)
      .json(ApiResponse(subscriptions, "Subscriptions found", true));
  } catch (error) {
    return res.status(400).json(ApiResponse({}, error.message, false));
  }
};
