const Travel = require("../../models/Travel");
const { handleFileOperations, deleteAttachments } = require("../../helpers");
const { convertToUTCDate } = require("../../helpers");
const { ApiResponse } = require("../../helpers");

exports.addTravelExpense = async (req, res) => {
  const userId = req.user._id;
  const {
    from,
    to,
    departureDate,
    arrivalDate,
    flightExpense,
    hotelExpense,
    mealExpense,
    carRentalExpense,
    otherExpense,
  } = req.body;

  try {
    let departureDateUTC, arrivalDateUTC;

    // Verify the departureDate
    if (departureDate) {
      departureDateUTC = new Date(departureDate);
      if (isNaN(departureDateUTC.getTime())) {
        return res
          .status(400)
          .json(ApiResponse({}, "Invalid departure date", false));
      }
    } else {
      return res
        .status(400)
        .json(ApiResponse({}, "Departure date is required", false));
    }

    // Verify the arrivalDate
    if (arrivalDate) {
      arrivalDateUTC = new Date(arrivalDate);
      if (isNaN(arrivalDateUTC.getTime())) {
        return res
          .status(400)
          .json(ApiResponse({}, "Invalid arrival date", false));
      }

      // Arrival date should be greater than departure date
      if (arrivalDateUTC <= departureDateUTC) {
        return res
          .status(400)
          .json(
            ApiResponse(
              {},
              "Arrival date should be greater than departure date",
              false
            )
          );
      }
    }

    const attachments = req.files?.gallery
      ? handleFileOperations([], req.files.gallery, null)
      : [];

    const travel = new Travel({
      userId,
      from,
      to,
      departureDate: departureDateUTC,
      arrivalDate: arrivalDateUTC,
      flightExpense,
      hotelExpense,
      mealExpense,
      carRentalExpense,
      otherExpense,
      attachments,
    });

    // Save travel expense record
    await travel.save();

    return res
      .status(201)
      .json(ApiResponse(travel, "Travel expense added successfully", true));
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json(ApiResponse({}, "Internal server error", false));
  }
};

exports.updateTravelExpense = async (req, res) => {
  const userId = req.user._id;
  const {
    departureDate,
    arrivalDate,
    from,
    to,
    flightExpense,
    mealExpense,
    carRentalExpense,
    otherExpense,
    hotelExpense,
    deletedImages,
  } = req.body;
  try {
    const travel = await Travel.findOne({
      _id: req.params.id,
      userId,
    });

    if (!travel) {
      return res
        .status(404)
        .json(ApiResponse({}, "Travel expense not found", false));
    }

    if (departureDate) {
      const departureDateUTC = new Date(departureDate);
      if (isNaN(departureDateUTC.getTime())) {
        return res
          .status(400)
          .json(ApiResponse({}, "Invalid departure date", false));
      }
      travel.departureDate = departureDateUTC;
    }

    if (arrivalDate) {
      const arrivalDateUTC = new Date(arrivalDate);
      if (isNaN(arrivalDateUTC.getTime())) {
        return res
          .status(400)
          .json(ApiResponse({}, "Invalid arrival date", false));
      }

      if (arrivalDateUTC <= travel.departureDate) {
        return res
          .status(400)
          .json(
            ApiResponse(
              {},
              "Arrival date should be greater than departure date",
              false
            )
          );
      }

      travel.arrivalDate = arrivalDateUTC;
    }

    travel.from = from || travel.from;
    travel.to = to || travel.to;
    travel.flightExpense = flightExpense || travel.flightExpense;
    travel.hotelExpense = hotelExpense || travel.hotelExpense;
    travel.mealExpense = mealExpense || travel.mealExpense;
    travel.carRentalExpense = carRentalExpense || travel.carRentalExpense;
    travel.otherExpense = otherExpense || travel.otherExpense;

    // Handle file operations
    travel.attachments = handleFileOperations(
      travel.attachments,
      req.files?.gallery,
      deletedImages
    );

    await travel.save();

    return res
      .status(200)
      .json(ApiResponse(travel, "Travel expense updated successfully", true));
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(ApiResponse({}, "Internal server error", false));
  }
};

exports.getExpenses = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const userId = req.user._id;
  let { startDate, endDate, keyword } = req.query;

  try {
    let matchQuery = { userId };

    if (startDate) {
      const start = new Date(startDate);
      if (!isNaN(start.getTime())) {
        matchQuery.createdAt = { $gte: start };
      } else {
        return res
          .status(400)
          .json(ApiResponse({}, "Invalid startDate", false));
      }
    }

    if (endDate) {
      const end = new Date(endDate);
      if (!isNaN(end.getTime())) {
        matchQuery.createdAt = matchQuery.createdAt || {};
        matchQuery.createdAt.$lte = end;
      } else {
        return res.status(400).json(ApiResponse({}, "Invalid endDate", false));
      }
    }

    if (keyword) {
      matchQuery.$or = [
        { from: { $regex: keyword, $options: "i" } },
        { to: { $regex: keyword, $options: "i" } },
      ];
    }

    const myAggregate = Travel.aggregate([
      { $match: matchQuery },
      { $sort: { createdAt: -1 } },
    ]);

    const travels = await Travel.aggregatePaginate(myAggregate, {
      page,
      limit,
    });

    return res
      .status(200)
      .json(ApiResponse(travels, `${travels.docs.length} travels found`, true));
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(ApiResponse({}, "Internal server error", false));
  }
};

exports.getExpense = async (req, res) => {
  const userId = req.user._id;
  try {
    const travel = await Travel.findOne({
      _id: req.params.id,
      userId,
    });

    if (!travel) {
      return res
        .status(404)
        .json(ApiResponse({}, "Travel expense not found", false));
    }

    return res
      .status(200)
      .json(ApiResponse(travel, "Travel expense found", true));
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(ApiResponse({}, "Internal server error", false));
  }
};

exports.deleteTravelExpense = async (req, res) => {
  const userId = req.user._id;
  try {
    const travel = await Travel.findOneAndDelete({
      _id: req.params.id,
      userId,
    });

    if (!travel) {
      return res
        .status(404)
        .json(ApiResponse({}, "Travel expense not found", false));
    }

    deleteAttachments(travel.attachments);

    return res
      .status(200)
      .json(ApiResponse({}, "Travel expense deleted successfully", true));
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(ApiResponse({}, "Internal server error", false));
  }
};
