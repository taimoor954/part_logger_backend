const mongoose = require("mongoose");
const {
  ApiResponse,
  handleFileOperations,
  convertToUTCDate,
} = require("../../helpers");
const Accident = require("../../models/Accident");
const Vehicle = require("../../models/Vehicle");

exports.addAccident = async (req, res) => {
  const userId = req.user._id;
  const {
    vehicleId,
    accidentDate,
    location,
    involvedDriverName,
    involvedDriverPhone,
    description,
  } = req.body;

  try {
    // Verify the vehicleId
    if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
      return res.status(400).json(ApiResponse({}, "Invalid vehicle ID", false));
    }

    const vehicle = await Vehicle.findOne({
      _id: new mongoose.Types.ObjectId(vehicleId),
      userId,
    });

    if (!vehicle) {
      return res.status(404).json(ApiResponse({}, "Vehicle not found", false));
    }

    // Accident date should be in the past and converted to UTC
    let accidentDateUTC;
    if (accidentDate) {
      accidentDateUTC = new Date(accidentDate);
      if (isNaN(accidentDateUTC.getTime())) {
        return res
          .status(400)
          .json(ApiResponse({}, "Invalid accident date", false));
      }

      if (accidentDateUTC > new Date()) {
        return res
          .status(400)
          .json(ApiResponse({}, "Accident date should be in the past", false));
      }
    }

    // Handle attachments (gallery files)
    const attachments = req.files?.gallery
      ? handleFileOperations([], req.files.gallery, null)
      : [];

    // Create the accident record
    const accident = new Accident({
      userId,
      vehicleId,
      accidentDate: accidentDateUTC,
      location,
      involvedDriverName,
      involvedDriverPhone,
      description,
      attachments,
    });

    await accident.save();

    return res
      .status(201)
      .json(ApiResponse(accident, "Accident added successfully", true));
  } catch (error) {
    return res.status(500).json(ApiResponse({}, error.message, false));
  }
};

exports.updateAccident = async (req, res) => {
  const userId = req.user._id;
  const {
    vehicleId,
    accidentDate,
    location,
    involvedDriverName,
    involvedDriverPhone,
    description,
    deletedImages,
  } = req.body;

  try {
    // Validate accident ID
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res
        .status(400)
        .json(ApiResponse({}, "Invalid accident ID", false));
    }

    const accident = await Accident.findOne({
      _id: req.params.id, // No need to convert again
      userId,
    });

    if (!accident) {
      return res.status(404).json(ApiResponse({}, "Accident not found", false));
    }

    // Validate and update vehicle ID if provided
    if (vehicleId) {
      if (!mongoose.Types.ObjectId.isValid(vehicleId)) {
        return res
          .status(400)
          .json(ApiResponse({}, "Invalid vehicle ID", false));
      }

      const vehicle = await Vehicle.findOne({
        _id: vehicleId,
        userId,
      });

      if (!vehicle) {
        return res
          .status(404)
          .json(ApiResponse({}, "Vehicle not found", false));
      }

      accident.vehicleId = vehicleId;
    }

    // Validate and update accidentDate if provided
    if (accidentDate) {
      let accidentDateUTC = new Date(accidentDate);
      if (isNaN(accidentDateUTC.getTime())) {
        return res
          .status(400)
          .json(ApiResponse({}, "Invalid accident date", false));
      }

      if (accidentDateUTC > new Date()) {
        return res
          .status(400)
          .json(ApiResponse({}, "Accident date should be in the past", false));
      }

      accident.accidentDate = accidentDateUTC;
    }

    // Update fields if provided
    accident.location = location ?? accident.location;
    accident.involvedDriverName =
      involvedDriverName ?? accident.involvedDriverName;
    accident.involvedDriverPhone =
      involvedDriverPhone ?? accident.involvedDriverPhone;
    accident.description = description ?? accident.description;

    // Handle file operations
    accident.attachments = handleFileOperations(
      accident.attachments,
      req.files?.gallery || [], // Ensure it's an array
      deletedImages
    );

    await accident.save();

    return res
      .status(200)
      .json(ApiResponse(accident, "Accident updated successfully", true));
  } catch (error) {
    return res.status(500).json(ApiResponse({}, error.message, false));
  }
};

exports.getAccident = async (req, res) => {
  const userId = req.user._id;
  const accidentId = req.params.id;
  try {
    // Validate accident ID
    if (!mongoose.Types.ObjectId.isValid(accidentId)) {
      return res
        .status(400)
        .json(ApiResponse({}, "Invalid accident ID", false));
    }

    const accident = await Accident.findOne({
      _id: accidentId,
      userId,
    }).populate({
      path: "vehicleId",
      select: "vehicleDetails.make vehicleDetails.model vehicleDetails.year",
    });

    if (!accident) {
      return res.status(404).json(ApiResponse({}, "Accident not found", false));
    }

    return res
      .status(200)
      .json(ApiResponse(accident, "Accident retrieved successfully", true));
  } catch (error) {
    return res.status(500).json(ApiResponse({}, error.message, false));
  }
};

exports.getAccidentsByIds = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const userId = req.user._id;
  let { vehicleId, startDate, endDate } = req.query;
  try {
    let finalAggregate = [];

    finalAggregate.push({ $match: { userId } });
    if (vehicleId) {
      finalAggregate.push({
        $match: {
          vehicleId: new mongoose.Types.ObjectId(vehicleId),
        },
      });
    }

    if (startDate) {
      startDate = convertToUTCDate(startDate);
      finalAggregate.push({ $match: { accidentDate: { $gte: startDate } } });
    }

    if (endDate) {
      endDate = convertToUTCDate(endDate);
      finalAggregate.push({ $match: { accidentDate: { $lte: endDate } } });
    }

    finalAggregate.push({
      $lookup: {
        from: "vehicles",
        localField: "vehicleId",
        foreignField: "_id",
        as: "vehicle",
      },
    });

    finalAggregate.push({ $unwind: "$vehicle" });

    // Sort by accidentDate in descending order (latest first)
    finalAggregate.push({
      $sort: { accidentDate: -1 },
    });

    finalAggregate.push({
      $project: {
        _id: 1,
        vehicleId: 1,
        accidentDate: 1,
        location: 1,
        involvedDriverName: 1,
        involvedDriverPhone: 1,
        description: 1,
        attachments: 1,
        vehicleDetails: "$vehicle.vehicleDetails",
        createdAt: 1,
        updatedAt: 1,
      },
    });

    const myAggregate =
      finalAggregate.length > 0
        ? Accident.aggregate(finalAggregate)
        : Accident.aggregate([]);

    Accident.aggregatePaginate(myAggregate, { page, limit }).then(
      (accidents) => {
        res
          .status(200)
          .json(
            ApiResponse(
              accidents,
              `${accidents.docs.length} accidents found`,
              true
            )
          );
      }
    );
  } catch (error) {
    return res.status(500).json(ApiResponse({}, error.message, false));
  }
};
