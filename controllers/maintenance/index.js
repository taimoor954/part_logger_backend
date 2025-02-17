const mongoose = require("mongoose");
const {
  ApiResponse,
  updateField,
  handleFileOperations,
  convertToUTCDate,
} = require("../../helpers");

const Vehicle = require("../../models/Vehicle");
const Store = require("../../models/Store");
const Maintenance = require("../../models/Maintenance");
const AutoPart = require("../../models/AutoPart");

exports.addMaintenance = async (req, res) => {
  const userId = req.user._id;
  const {
    vehicleId,
    storeId,
    mechanicId,
    maintenanceDate,
    details,
    carMileage,
    estimatedCost,
    laborCost,
    partsCost,
    totalPrice,
    autoPartIds,
  } = req.body;

  try {
    // Validate Object IDs
    if (
      !mongoose.isValidObjectId(vehicleId) ||
      !mongoose.isValidObjectId(storeId)
    ) {
      return res
        .status(400)
        .json(ApiResponse({}, "Invalid vehicle or store ID", false));
    }

    // Verify if the vehicle exists
    const vehicle = await Vehicle.findOne({ _id: vehicleId, userId });
    if (!vehicle) {
      return res.status(404).json(ApiResponse({}, "Vehicle not found", false));
    }

    // Verify if the store exists
    const store = await Store.findOne({ _id: storeId, userId });
    if (!store) {
      return res.status(404).json(ApiResponse({}, "Store not found", false));
    }

    const mechanicExists = store.mechanics.some(
      (id) => id.toString() === mechanicId
    );

    if (!mechanicExists) {
      return res
        .status(404)
        .json(ApiResponse({}, "Mechanic not found in this store", false));
    }

    let autoPartIdsParsed = [];
    if (autoPartIds && autoPartIds.length > 0) {
      autoPartIdsParsed = JSON.parse(autoPartIds);
      const autoParts = await AutoPart.find({
        _id: { $in: autoPartIdsParsed },
        userId,
      });

      if (autoParts.length !== autoPartIdsParsed.length) {
        return res
          .status(404)
          .json(ApiResponse({}, "One or more auto parts not found", false));
      }
    }
    // Convert maintenanceDate to UTC if provided and should be a past date
    let maintenanceDateUTC;
    if (maintenanceDate) {
      const parsedDate = new Date(maintenanceDate);
      if (isNaN(parsedDate.getTime())) {
        return res
          .status(400)
          .json(ApiResponse({}, "Invalid maintenance date", false));
      }
      if (parsedDate > new Date()) {
        return res
          .status(400)
          .json(
            ApiResponse({}, "Maintenance date should be a past date", false)
          );
      }
      maintenanceDateUTC = convertToUTCDate(parsedDate);
    }

    // Parse details if it's a string
    let detailsParsed = [];
    if (typeof details === "string" && details.trim().length > 0) {
      try {
        detailsParsed = JSON.parse(details);
      } catch (error) {
        return res
          .status(400)
          .json(ApiResponse({}, "Invalid details format", false));
      }
    }

    // Handle attachments (gallery files)
    const attachments = req.files?.gallery
      ? handleFileOperations([], req.files.gallery, null)
      : [];

    // Create a new maintenance record
    const maintenance = new Maintenance({
      userId,
      vehicleId,
      mechanicId,
      storeId,
      maintenanceDate: maintenanceDateUTC,
      details: detailsParsed,
      carMileage,
      estimatedCost,
      laborCost,
      partsCost,
      totalPrice,
      attachments,
      autoPartIds: autoPartIdsParsed,
    });

    await maintenance.save();

    return res
      .status(201)
      .json(
        ApiResponse({ maintenance }, "Maintenance added successfully", true)
      );
  } catch (error) {
    return res.status(500).json(ApiResponse({}, error.message, false));
  }
};

exports.updateMaintenance = async (req, res) => {
  const userId = req.user._id;
  const maintenanceId = req.params.id;
  const {
    vehicleId,
    storeId,
    mechanicId,
    maintenanceDate,
    details,
    carMileage,
    estimatedCost,
    laborCost,
    partsCost,
    totalPrice,
    deletedImages,
    autoPartIds,
  } = req.body;

  try {
    // Validate Object IDs
    if (
      (vehicleId && !mongoose.isValidObjectId(vehicleId)) ||
      (storeId && !mongoose.isValidObjectId(storeId)) ||
      !mongoose.isValidObjectId(maintenanceId)
    ) {
      return res
        .status(400)
        .json(
          ApiResponse({}, "Invalid vehicle, store or maintenance ID", false)
        );
    }

    // Fetch the maintenance record before doing any updates
    const maintenance = await Maintenance.findOne({ _id: maintenanceId });
    if (!maintenance) {
      return res
        .status(404)
        .json(ApiResponse({}, "Maintenance record not found", false));
    }

    // Verify if the vehicle exists (only if vehicleId is provided)
    if (vehicleId) {
      const vehicle = await Vehicle.findOne({ _id: vehicleId, userId });
      if (!vehicle) {
        return res
          .status(404)
          .json(ApiResponse({}, "Vehicle not found", false));
      }
      maintenance.vehicleId = vehicleId;
    }

    // Verify if the store exists (only if storeId is provided)
    if (storeId) {
      const store = await Store.findOne({ _id: storeId, userId });
      if (!store) {
        return res.status(404).json(ApiResponse({}, "Store not found", false));
      }
      maintenance.storeId = storeId;
    }

    // Verify if mechanic exists in the store (only if mechanicId is provided)
    if (mechanicId) {
      const store = await Store.findById(maintenance.storeId); // Get store from maintenance if already set
      const mechanicExists = store.mechanics.some(
        (id) => id.toString() === mechanicId
      );
      if (!mechanicExists) {
        return res
          .status(404)
          .json(ApiResponse({}, "Mechanic not found in this store", false));
      }
      maintenance.mechanicId = mechanicId;
    }

    // Verify if auto parts exist (only if autoPartIds is provided)
    if (autoPartIds) {
      let autoPartIdsParsed = JSON.parse(autoPartIds);
      const autoParts = await AutoPart.find({
        _id: { $in: autoPartIdsParsed },
        userId,
      });

      if (autoParts.length !== autoPartIdsParsed.length) {
        return res
          .status(404)
          .json(ApiResponse({}, "One or more auto parts not found", false));
      }

      maintenance.autoPartIds = autoPartIdsParsed;
    }

    // Convert maintenanceDate to UTC if provided and should be a past date
    if (maintenanceDate) {
      const parsedDate = new Date(maintenanceDate);
      if (isNaN(parsedDate.getTime())) {
        return res
          .status(400)
          .json(ApiResponse({}, "Invalid maintenance date", false));
      }
      if (parsedDate > new Date()) {
        return res
          .status(400)
          .json(
            ApiResponse({}, "Maintenance date should be a past date", false)
          );
      }
      maintenance.maintenanceDate = convertToUTCDate(parsedDate);
    }

    // Parse details if it's a string
    let detailsParsed = [];
    if (details && typeof details === "string" && details.trim().length > 0) {
      try {
        detailsParsed = JSON.parse(details);
      } catch (error) {
        return res
          .status(400)
          .json(ApiResponse({}, "Invalid details format", false));
      }
    }
    maintenance.details =
      detailsParsed.length > 0 ? detailsParsed : maintenance.details;

    // Handle attachments (gallery files)
    maintenance.attachments = handleFileOperations(
      maintenance.attachments,
      req.files?.gallery,
      deletedImages
    );

    // Update the remaining fields only if they are provided
    maintenance.carMileage = carMileage || maintenance.carMileage;
    maintenance.estimatedCost = estimatedCost || maintenance.estimatedCost;
    maintenance.laborCost = laborCost || maintenance.laborCost;
    maintenance.partsCost = partsCost || maintenance.partsCost;
    maintenance.totalPrice = totalPrice || maintenance.totalPrice;

    // Save the updated maintenance record
    await maintenance.save();

    return res
      .status(200)
      .json(
        ApiResponse({ maintenance }, "Maintenance updated successfully", true)
      );
  } catch (error) {
    return res.status(500).json(ApiResponse({}, error.message, false));
  }
};

exports.getMaintenance = async (req, res) => {
  const userId = req.user._id;
  const maintenanceId = req.params.id;

  try {
    // Validate maintenance ID
    if (!mongoose.isValidObjectId(maintenanceId)) {
      return res
        .status(400)
        .json(ApiResponse({}, "Invalid maintenance ID", false));
    }

    // Fetch the maintenance record with populated fields
    const maintenance = await Maintenance.findOne({
      _id: maintenanceId,
      userId,
    }).populate("vehicleId storeId mechanicId autoPartIds");

    // Handle not found case
    if (!maintenance) {
      return res
        .status(404)
        .json(ApiResponse({}, "Maintenance record not found", false));
    }

    // Return the found record
    return res
      .status(200)
      .json(ApiResponse({ maintenance }, "Maintenance record found", true));
  } catch (error) {
    // Handle unexpected errors
    return res.status(500).json(ApiResponse({}, error.message, false));
  }
};

exports.getMaintenances = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const userId = req.user._id;
  let { vehicleId, storeId, startDate, endDate } = req.query;
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

    if (storeId) {
      finalAggregate.push({
        $match: {
          storeId: new mongoose.Types.ObjectId(storeId),
        },
      });
    }
    if (startDate) {
      startDate = convertToUTCDate(startDate);
      finalAggregate.push({ $match: { maintenanceDate: { $gte: startDate } } });
    }

    if (endDate) {
      endDate = convertToUTCDate(endDate);
      finalAggregate.push({ $match: { maintenanceDate: { $lte: endDate } } });
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
      $lookup: {
        from: "stores",
        localField: "storeId",
        foreignField: "_id",
        as: "store",
      },
    });
    // lookup for mechanic
    finalAggregate.push({
      $lookup: {
        from: "workers",
        localField: "mechanicId",
        foreignField: "_id",
        as: "mechanic",
      },
    });

    finalAggregate.push({ $unwind: "$vehicle" });
    finalAggregate.push({ $unwind: "$store" });
    finalAggregate.push({ $unwind: "$mechanic" });

    const myAggregate =
      finalAggregate.length > 0
        ? Maintenance.aggregate(finalAggregate)
        : Maintenance.aggregate([]);

    Maintenance.aggregatePaginate(myAggregate, { page, limit }).then(
      (maintenances) => {
        res
          .status(200)
          .json(
            ApiResponse(
              maintenances,
              `${maintenances.docs.length} maintenances found`,
              true
            )
          );
      }
    );
  } catch (error) {
    return res.status(500).json(ApiResponse({}, error.message, false));
  }
};
