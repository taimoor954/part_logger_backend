const Travel = require("../../models/Travel");
const { handleFileOperations, deleteAttachments } = require("../../helpers");
const { convertToUTCDate } = require("../../helpers");
const { ApiResponse } = require("../../helpers");

exports.addTravelExpense = async (req, res) => {
  const userId = req.user._id;
  const {
    flightExpense,
    hotelExpense,
    mealExpense,
    carRentalExpense,
    description,
    otherExpense,
  } = req.body;

  let parsedFlightInfo;

  try {
    // Parse flightInfo
    try {
      parsedFlightInfo = JSON.parse(req.body.flightInfo);
    } catch (parseErr) {
      return res
        .status(400)
        .json(
          ApiResponse(
            {},
            "Invalid flightInfo format. Must be a JSON array.",
            false
          )
        );
    }

    // Validate parsedFlightInfo
    if (!Array.isArray(parsedFlightInfo) || parsedFlightInfo.length === 0) {
      return res
        .status(400)
        .json(ApiResponse({}, "flightInfo must be a non-empty array", false));
    }

    const validatedFlightInfo = [];

    for (let i = 0; i < parsedFlightInfo.length; i++) {
      const { from, to, departureDate, arrivalDate } = parsedFlightInfo[i];

      if (!from || !to || !departureDate || !arrivalDate) {
        return res
          .status(400)
          .json(
            ApiResponse(
              {},
              `Missing required fields in flightInfo at index ${i}`,
              false
            )
          );
      }

      const departureDateUTC = new Date(departureDate);
      const arrivalDateUTC = new Date(arrivalDate);

      if (isNaN(departureDateUTC.getTime())) {
        return res
          .status(400)
          .json(ApiResponse({}, `Invalid departureDate at index ${i}`, false));
      }

      if (isNaN(arrivalDateUTC.getTime())) {
        return res
          .status(400)
          .json(ApiResponse({}, `Invalid arrivalDate at index ${i}`, false));
      }

      if (arrivalDateUTC <= departureDateUTC) {
        return res
          .status(400)
          .json(
            ApiResponse(
              {},
              `arrivalDate should be after departureDate at index ${i}`,
              false
            )
          );
      }

      validatedFlightInfo.push({
        from,
        to,
        departureDate: departureDateUTC,
        arrivalDate: arrivalDateUTC,
      });
    }

    const attachments = req.files?.gallery
      ? handleFileOperations([], req.files.gallery, null)
      : [];

    const travel = new Travel({
      userId,
      flightInfo: validatedFlightInfo,
      flightExpense,
      hotelExpense,
      mealExpense,
      carRentalExpense,
      otherExpense,
      description,
      attachments,
    });

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
    flightInfo,
    flightExpense,
    hotelExpense,
    mealExpense,
    carRentalExpense,
    otherExpense,
    description,
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

    // Parse and validate flightInfo if provided
    if (flightInfo) {
      let parsedFlightInfo;

      try {
        parsedFlightInfo = JSON.parse(flightInfo);
      } catch (parseErr) {
        return res
          .status(400)
          .json(
            ApiResponse(
              {},
              "Invalid flightInfo format. Must be a JSON array.",
              false
            )
          );
      }

      if (!Array.isArray(parsedFlightInfo) || parsedFlightInfo.length === 0) {
        return res
          .status(400)
          .json(ApiResponse({}, "flightInfo must be a non-empty array", false));
      }

      const validatedFlightInfo = [];

      for (let i = 0; i < parsedFlightInfo.length; i++) {
        const { from, to, departureDate, arrivalDate } = parsedFlightInfo[i];

        if (!from || !to || !departureDate || !arrivalDate) {
          return res
            .status(400)
            .json(
              ApiResponse(
                {},
                `Missing required fields in flightInfo at index ${i}`,
                false
              )
            );
        }

        const departureDateUTC = new Date(departureDate);
        const arrivalDateUTC = new Date(arrivalDate);

        if (isNaN(departureDateUTC.getTime())) {
          return res
            .status(400)
            .json(
              ApiResponse({}, `Invalid departureDate at index ${i}`, false)
            );
        }

        if (isNaN(arrivalDateUTC.getTime())) {
          return res
            .status(400)
            .json(ApiResponse({}, `Invalid arrivalDate at index ${i}`, false));
        }

        if (arrivalDateUTC <= departureDateUTC) {
          return res
            .status(400)
            .json(
              ApiResponse(
                {},
                `arrivalDate should be after departureDate at index ${i}`,
                false
              )
            );
        }

        validatedFlightInfo.push({
          from,
          to,
          departureDate: departureDateUTC,
          arrivalDate: arrivalDateUTC,
        });
      }

      travel.flightInfo = validatedFlightInfo;
    }

    // Update expenses if provided
    if (flightExpense !== undefined) travel.flightExpense = flightExpense;
    if (hotelExpense !== undefined) travel.hotelExpense = hotelExpense;
    if (mealExpense !== undefined) travel.mealExpense = mealExpense;
    if (carRentalExpense !== undefined)
      travel.carRentalExpense = carRentalExpense;
    if (otherExpense !== undefined) travel.otherExpense = otherExpense;
    if (description !== undefined) travel.description = description;

    // Handle attachments
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

    // Date filter (based on createdAt)
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

    // Keyword filter (search inside flightInfo.from or flightInfo.to)
    if (keyword) {
      matchQuery.$or = [
        {
          flightInfo: {
            $elemMatch: {
              from: { $regex: keyword, $options: "i" },
            },
          },
        },
        {
          flightInfo: {
            $elemMatch: {
              to: { $regex: keyword, $options: "i" },
            },
          },
        },
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
