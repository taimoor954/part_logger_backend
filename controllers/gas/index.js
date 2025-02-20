const Vehicle = require("../../models/Vehicle");
const Gas = require("../../models/Gas");
const {
  ApiResponse,
  handleFileOperations,
  convertToUTCDate,
} = require("../../helpers");
const { default: mongoose } = require("mongoose");

exports.addGasExpense = async (req, res) => {
  const userId = req.user._id;
  const { vehicleId, gasDate, gallons, price, carMileage } = req.body;

  try {
    const vehicle = await Vehicle.findOne({ _id: vehicleId, userId });

    if (!vehicle) {
      return res.status(404).json(ApiResponse({}, "Vehicle not found", false));
    }

    // Validate gas date
    let gasDateUTC = null;
    if (gasDate) {
      gasDateUTC = new Date(gasDate);

      if (isNaN(gasDateUTC.getTime())) {
        return res.status(400).json(ApiResponse({}, "Invalid gas date", false));
      }

      // Gas date should be less than or equal to the current date
      if (gasDateUTC > new Date()) {
        return res
          .status(400)
          .json(
            ApiResponse(
              {},
              "Gas date should be less than or equal to the current date",
              false
            )
          );
      }
    }

    const attachments = req.files?.gallery
      ? handleFileOperations([], req.files.gallery, null)
      : [];

    const gas = new Gas({
      userId,
      vehicleId,
      gasDate: gasDateUTC,
      gallons,
      price,
      carMileage,
      attachments,
    });

    await gas.save();
    return res.status(201).json(ApiResponse(gas, "Gas expense added", true));
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json(ApiResponse({}, "Internal server error", false));
  }
};

exports.updateGasExpense = async (req, res) => {
  const userId = req.user._id;
  const { vehicleId, gasDate, gallons, price, carMileage, deletedImages } =
    req.body;

  try {
    const gas = await Gas.findOne({
      _id: req.params.id,
      userId,
    });

    if (!gas) {
      return res
        .status(404)
        .json(ApiResponse({}, "Gas expense not found", false));
    }

    if (vehicleId) {
      const vehicle = await Vehicle.findOne({ _id: vehicleId, userId });
      if (!vehicle) {
        return res
          .status(404)
          .json(ApiResponse({}, "Vehicle not found", false));
      }

      gas.vehicleId = vehicleId;
    }

    if (gasDate) {
      const gasDateUTC = new Date(gasDate);
      if (isNaN(gasDateUTC.getTime())) {
        return res.status(400).json(ApiResponse({}, "Invalid gas date", false));
      }

      // Gas date should be less than or equal to the current date
      if (gasDateUTC > new Date()) {
        return res
          .status(400)
          .json(
            ApiResponse(
              {},
              "Gas date should be less than or equal to the current date",
              false
            )
          );
      }

      gas.gasDate = gasDateUTC;
    }

    gas.gallons = gallons || gas.gallons;
    gas.price = price || gas.price;
    gas.carMileage = carMileage || gas.carMileage;

    // Handle attachments (gallery files)
    gas.attachments = handleFileOperations(
      gas.attachments,
      req.files?.gallery,
      deletedImages
    );
    await gas.save();
    return res
      .status(200)
      .json(ApiResponse(gas, "Gas expense updated successfully", true));
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json(ApiResponse({}, "Internal server error", false));
  }
};

exports.deleteGasExpense = async (req, res) => {
  const userId = req.user._id;
  try {
    const gas = await Gas.findOneAndDelete({
      _id: req.params.id,
      userId,
    });

    if (!gas) {
      return res
        .status(404)
        .json(ApiResponse({}, "Gas expense not found", false));
    }

    return res
      .status(200)
      .json(ApiResponse({}, "Gas expense deleted successfully", true));
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json(ApiResponse({}, "Internal server error", false));
  }
};

exports.getGasExpenses = async (req, res) => {
  const userId = req.user._id;
  let { vehicleId, startDate, endDate, page, limit } = req.query;

  try {
    let finalAggregate = [];

    finalAggregate.push({
      $match: {
        userId,
      },
    });

    if (vehicleId) {
      finalAggregate.push({
        $match: {
          vehicleId: new mongoose.Types.ObjectId(vehicleId),
        },
      });
    }

    if (startDate) {
      startDate = convertToUTCDate(startDate);
      finalAggregate.push({ $match: { gasDate: { $gte: startDate } } });
    }

    if (endDate) {
      endDate = convertToUTCDate(endDate);
      finalAggregate.push({ $match: { gasDate: { $lte: endDate } } });
    }

    finalAggregate.push({
      $lookup: {
        from: "vehicles",
        localField: "vehicleId",
        foreignField: "_id",
        as: "vehicle",
      },
    });

    finalAggregate.push({
      $unwind: "$vehicle",
    });

    finalAggregate.push({
      $project: {
        _id: 1,
        vehicleId: 1,
        gasDate: 1,
        gallons: 1,
        price: 1,
        carMileage: 1,
        attachments: 1,
        vehicleDetails: "$vehicle.vehicleDetails",
        createdAt: 1,
        updatedAt: 1,
      },
    });

    finalAggregate.push({
      $sort: {
        gasDate: -1,
      },
    });

    const myAggregate =
      finalAggregate.length > 0
        ? Gas.aggregate(finalAggregate)
        : Gas.aggregate([]);

    Gas.aggregatePaginate(myAggregate, { page, limit }).then((gas) => {
      res
        .status(200)
        .json(ApiResponse(gas, `${gas.docs.length} gas found`, true));
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json(ApiResponse({}, "Internal server error", false));
  }
};

exports.getGasExpense = async (req, res) => {
  const userId = req.user._id;
  try {
    const gas = await Gas.findOne({
      _id: req.params.id,
      userId,
    }).populate("vehicleId", "vehicleDetails");

    if (!gas) {
      return res
        .status(404)
        .json(ApiResponse({}, "Gas expense not found", false));
    }

    return res.status(200).json(ApiResponse(gas, "Gas expense found", true));
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json(ApiResponse({}, "Internal server error", false));
  }
};
