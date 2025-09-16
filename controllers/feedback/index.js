const { ApiResponse } = require("../../helpers");
const Feedback = require("../../models/Feedback");

exports.addFeedback = async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  const userId = req.user.id;
  try {
    const feedback = new Feedback({
      userId,
      name,
      email,
      phone,
      subject,
      message,
    });
    await feedback.save();
    return res
      .status(201)
      .json(ApiResponse(feedback, "Feedback added successfully", true));
  } catch (error) {
    return res.status(500).json(ApiResponse({}, error.message, false));
  }
};

exports.getFeedbacks = async (req, res) => {
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;
  const { startDate, endDate } = req.query;
  try {
    let finalAggregate = [];

    finalAggregate.push({
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "user",
      },
    });

    finalAggregate.push({
      $unwind: "$user",
    });

    if (startDate) {
      finalAggregate.push({
        $match: {
          createdAt: {
            $gte: new Date(startDate),
          },
        },
      });
    }

    if (endDate) {
      finalAggregate.push({
        $match: {
          createdAt: {
            $lte: new Date(endDate),
          },
        },
      });
    }

    // remove password from user object
    finalAggregate.push({
      $project: {
        "user.password": 0,
      },
    });

    const myAggregate =
      finalAggregate.length > 0
        ? Feedback.aggregate(finalAggregate)
        : Feedback.aggregate([]);

    Feedback.aggregatePaginate(myAggregate, { page, limit })
      .then((feedbacks) => {
        res
          .status(200)
          .json(
            ApiResponse(
              feedbacks,
              `${feedbacks.docs.length} feedbacks found`,
              true
            )
          );
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json(ApiResponse({}, err.message, false));
      });
  } catch (error) {
    return res.status(500).json(ApiResponse({}, error.message, false));
  }
};

exports.getFeedbackById = async (req, res) => {
  const { id } = req.params;
  try {
    const feedback = await Feedback.findById(id);
    if (!feedback) {
      return res.status(404).json(ApiResponse({}, "Feedback not found", false));
    }
    return res.status(200).json(ApiResponse(feedback, "Feedback found", true));
  } catch (error) {
    return res.status(500).json(ApiResponse({}, error.message, false));
  }
};
