const { ApiResponse } = require("../../helpers");
const Subscription = require("../../models/Subscription");
const UserSubscription = require("../../models/UserSubscription");
const moment = require("moment");

exports.activateFreeTrial = async (userId) => {
  try {
    let freeTrialPlan = await Subscription.findOne({
      planType: "TRIAL",
    });

    if (!freeTrialPlan) {
      // Create the free trial plan if it doesn't exist
      freeTrialPlan = new Subscription({
        planName: "Free Trial",
        planType: "TRIAL",
        planCharges: 0,
        vehicleLimit: 3,
      });
      await freeTrialPlan.save();
    }

    // Check if user already has a free trial subscription
    const existingTrial = await UserSubscription.findOne({
      userId,
      subscriptionId: freeTrialPlan._id,
    });
    if (existingTrial) {
      return res
        .status(400)
        .json(ApiResponse({}, "User already has a free trial.", false));
    }

    const now = moment().utc();
    const expiresAt = now.clone().add(14, "days");

    const userSubscription = new UserSubscription({
      userId,
      subscriptionId: freeTrialPlan._id,
      subscribedAt: now.toDate(),
      expiresAt: expiresAt.toDate(),
    });

    await userSubscription.save();

    console.log("14-day free trial activated successfully.");
  } catch (error) {
    console.error("Error activating free trial:", error);
  }
};

exports.savePayment = async (req, res) => {
  const { subscriptionId } = req.body;
  const userId = req.user.id;

  try {
    // Find the subscription by ID
    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      return res
        .status(404)
        .json(ApiResponse({}, "Subscription not found", false));
    }

    let userSubscription = await UserSubscription.findOne({
      subscriptionId,
      userId,
    });
    if (userSubscription) {
      return res
        .status(400)
        .json(ApiResponse({}, "User already subscribed", false));
    }

    // Set subscribedAt to current UTC time
    const subscribedAt = moment().utc();

    // Calculate expiration date based on plan type
    let expiresAt;
    if (subscription.planType === "MONTHLY") {
      expiresAt = subscribedAt.clone().add(1, "months"); // Clone to avoid modifying the original moment object
    } else if (subscription.planType === "YEARLY") {
      expiresAt = subscribedAt.clone().add(1, "years");
    } else {
      return res
        .status(400)
        .json(ApiResponse({}, "Invalid subscription plan type", false));
    }

    // Create and save the user subscription
    userSubscription = new UserSubscription({
      userId,
      subscriptionId,
      subscribedAt: subscribedAt.toDate(), // Ensure the date is stored in the correct format
      expiresAt: expiresAt.toDate(),
    });

    await userSubscription.save();

    // Respond with success
    return res
      .status(201)
      .json(
        ApiResponse(
          userSubscription,
          "User subscription added successfully",
          true
        )
      );
  } catch (error) {
    console.error("Error saving payment:", error);
    return res
      .status(500)
      .json(
        ApiResponse({}, error.message || "An unexpected error occurred", false)
      );
  }
};

exports.getUserSubscriptions = async (req, res) => {
  const userId = req.user.id;

  try {
    const userSubscriptions = await UserSubscription.find({
      userId,
      status: "ACTIVE",
    }).populate("subscriptionId");

    return res
      .status(200)
      .json(
        ApiResponse(
          userSubscriptions,
          "User subscriptions retrieved successfully",
          true
        )
      );
  } catch (error) {
    console.error("Error fetching user subscriptions:", error);
    return res
      .status(500)
      .json(
        ApiResponse({}, error.message || "An unexpected error occurred", false)
      );
  }
};
