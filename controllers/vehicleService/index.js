const mongoose = require("mongoose");
const {
  ApiResponse,
  updateField,
  handleFileOperations,
  convertToUTCDate,
  deleteAttachments,
} = require("../../helpers");
const Store = require("../../models/Store");
const Vehicle = require("../../models/Vehicle");
const VehicleService = require("../../models/VehicleService");
const Worker = require("../../models/Worker");
const { deleteDraftById } = require("../draft");

exports.addVehicleService = async (req, res) => {
  const userId = req.user._id;
  const {
    vehicleId,
    storeId,
    serviceDate,
    workerId,
    partRepaired,
    description,
    partBrand,
    currentMileage,
    condition,
    partNum,
    repairPrice,
    partsCost,
    laborCost,
    warranty,
    warrantyPrice,
    comment,
  } = req.body;
  try {
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

    // Verify if the worker exists
    const worker = await Worker.findOne({ _id: workerId, userId });
    if (!worker) {
      return res.status(404).json(ApiResponse({}, "Worker not found", false));
    }
    // Verify if the service date is valid
    let serviceDateUTC = null;
    if (serviceDate) {
      const parsedDate = new Date(serviceDate);
      if (isNaN(parsedDate.getTime())) {
        return res
          .status(400)
          .json(ApiResponse({}, "Invalid service date", false));
      }
      if (parsedDate > new Date()) {
        return res
          .status(400)
          .json(ApiResponse({}, "Service date should be in the past", false));
      }

      serviceDateUTC = convertToUTCDate(parsedDate);
    }

    // Handle attachments (gallery files)
    const draft = await deleteDraftById(req.query?.draftId, req.user._id);

    // Handle attachments (gallery files)
    const attachments = handleFileOperations(
      draft?.attachments ? draft.attachments : [],
      req.files?.gallery,
      req.query?.deletedImages
    );

    // Create the vehicle service
    const vehicleService = new VehicleService({
      userId,
      vehicleId,
      storeId,
      serviceDate: serviceDateUTC,
      workerId,
      partRepaired,
      description,
      partBrand,
      currentMileage,
      condition,
      partNum,
      repairPrice,
      partsCost,
      laborCost,
      warranty,
      warrantyPrice,
      comment,
      attachments,
    });

    await vehicleService.save();

    return res
      .status(201)
      .json(
        ApiResponse(vehicleService, "Vehicle service added successfully", true)
      );
  } catch (error) {
    console.error("Error in addVehicleService:", error);
    return res.status(500).json(ApiResponse({}, error.message, false));
  }
};

exports.updateVehicleService = async (req, res) => {
  const userId = req.user._id;
  const vehicleServiceId = req.params.id; // Assuming you pass ID in params

  const {
    vehicleId,
    storeId,
    serviceDate,
    workerId,
    partRepaired,
    description,
    partBrand,
    currentMileage,
    condition,
    partNum,
    repairPrice,
    partsCost,
    laborCost,
    warranty,
    warrantyPrice,
    comment,
  } = req.body;

  try {
    if (!mongoose.isValidObjectId(vehicleServiceId)) {
      return res
        .status(400)
        .json(ApiResponse({}, "Invalid Vehicle Service ID", false));
    }

    // Find the existing vehicle service record
    const vehicleService = await VehicleService.findOne({
      _id: vehicleServiceId,
      userId,
    });
    if (!vehicleService) {
      return res
        .status(404)
        .json(ApiResponse({}, "Vehicle service record not found", false));
    }

    // Optional: Validate vehicleId, storeId, workerId if they are provided
    if (vehicleId && !mongoose.isValidObjectId(vehicleId)) {
      return res.status(400).json(ApiResponse({}, "Invalid vehicle ID", false));
    }
    if (storeId && !mongoose.isValidObjectId(storeId)) {
      return res.status(400).json(ApiResponse({}, "Invalid store ID", false));
    }
    if (workerId && !mongoose.isValidObjectId(workerId)) {
      return res.status(400).json(ApiResponse({}, "Invalid worker ID", false));
    }

    if (vehicleId) {
      const vehicle = await Vehicle.findOne({ _id: vehicleId, userId });
      if (!vehicle) {
        return res
          .status(404)
          .json(ApiResponse({}, "Vehicle not found", false));
      }
    }

    if (storeId) {
      const store = await Store.findOne({ _id: storeId, userId });
      if (!store) {
        return res.status(404).json(ApiResponse({}, "Store not found", false));
      }
    }

    if (workerId) {
      const worker = await Worker.findOne({ _id: workerId, userId });
      if (!worker) {
        return res.status(404).json(ApiResponse({}, "Worker not found", false));
      }
    }

    // Validate serviceDate if provided
    let serviceDateUTC = vehicleService.serviceDate;
    if (serviceDate) {
      const parsedDate = new Date(serviceDate);
      if (isNaN(parsedDate.getTime())) {
        return res
          .status(400)
          .json(ApiResponse({}, "Invalid service date", false));
      }
      if (parsedDate > new Date()) {
        return res
          .status(400)
          .json(ApiResponse({}, "Service date should be in the past", false));
      }

      serviceDateUTC = convertToUTCDate(parsedDate);
    }

    // Handle attachments (gallery files)
    vehicleService.attachments = handleFileOperations(
      vehicleService.attachments,
      req.files?.gallery,
      req.query?.deletedImages
    );

    // Update fields
    vehicleService.vehicleId = vehicleId || vehicleService.vehicleId;
    vehicleService.storeId = storeId || vehicleService.storeId;
    vehicleService.workerId = workerId || vehicleService.workerId;
    vehicleService.serviceDate = serviceDateUTC;
    vehicleService.partRepaired = partRepaired ?? vehicleService.partRepaired;
    vehicleService.description = description ?? vehicleService.description;
    vehicleService.partBrand = partBrand ?? vehicleService.partBrand;
    vehicleService.currentMileage =
      currentMileage ?? vehicleService.currentMileage;
    vehicleService.condition = condition ?? vehicleService.condition;
    vehicleService.partNum = partNum ?? vehicleService.partNum;
    vehicleService.repairPrice = repairPrice ?? vehicleService.repairPrice;
    vehicleService.partsCost = partsCost ?? vehicleService.partsCost;
    vehicleService.laborCost = laborCost ?? vehicleService.laborCost;
    vehicleService.warranty = warranty ?? vehicleService.warranty;
    vehicleService.warrantyPrice =
      warrantyPrice ?? vehicleService.warrantyPrice;
    vehicleService.comment = comment ?? vehicleService.comment;

    await vehicleService.save();

    return res
      .status(200)
      .json(
        ApiResponse(
          vehicleService,
          "Vehicle service updated successfully",
          true
        )
      );
  } catch (error) {
    console.error("Error in updateVehicleService:", error);
    return res.status(500).json(ApiResponse({}, error.message, false));
  }
};

exports.getVehicleService = async (req, res) => {
  const userId = req.user._id;
  const vehicleServiceId = req.params.id; // Assuming you pass ID in params

  try {
    if (!mongoose.isValidObjectId(vehicleServiceId)) {
      return res
        .status(400)
        .json(ApiResponse({}, "Invalid Vehicle Service ID", false));
    }

    // Find the existing vehicle service record
    const vehicleService = await VehicleService.findOne({
      _id: vehicleServiceId,
      userId,
    }).populate("vehicleId storeId workerId");
    if (!vehicleService) {
      return res
        .status(404)
        .json(ApiResponse({}, "Vehicle service record not found", false));
    }

    return res
      .status(200)
      .json(
        ApiResponse(
          vehicleService,
          "Vehicle service retrieved successfully",
          true
        )
      );
  } catch (error) {
    console.error("Error in getVehicleService:", error);
    return res.status(500).json(ApiResponse({}, error.message, false));
  }
};

exports.getVehicleServices = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const userId = req.user._id;
  let { vehicleId, storeId, startDate, endDate, keyword } = req.query;
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
      finalAggregate.push({ $match: { serviceDate: { $gte: startDate } } });
    }

    if (endDate) {
      endDate = convertToUTCDate(endDate);
      finalAggregate.push({ $match: { serviceDate: { $lte: endDate } } });
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
        localField: "workerId",
        foreignField: "_id",
        as: "mechanic",
      },
    });

    finalAggregate.push({ $unwind: "$vehicle" });
    finalAggregate.push({ $unwind: "$store" });
    finalAggregate.push({ $unwind: "$mechanic" });

    if (keyword) {
      finalAggregate.push({
        $match: {
          $or: [
            {
              "vehicle.vehicleDetails.make": { $regex: keyword, $options: "i" },
            },
            {
              "vehicle.vehicleDetails.model": {
                $regex: keyword,
                $options: "i",
              },
            },
            { "store.storeName": { $regex: keyword, $options: "i" } },
            { "mechanic.name": { $regex: keyword, $options: "i" } },
          ],
        },
      });
    }

    const myAggregate =
      finalAggregate.length > 0
        ? VehicleService.aggregate(finalAggregate)
        : VehicleService.aggregate([]);

    VehicleService.aggregatePaginate(myAggregate, { page, limit }).then(
      (vehicleServices) => {
        res
          .status(200)
          .json(
            ApiResponse(
              vehicleServices,
              `${vehicleServices.docs.length} vehicle services found`,
              true
            )
          );
      }
    );
  } catch (error) {
    console.error("Error in getVehicleServices:", error);
    return res.status(500).json(ApiResponse({}, error.message, false));
  }
};

exports.deleteVehicleService = async (req, res) => {
  const userId = req.user._id;
  const vehicleServiceId = req.params.id; // Assuming you pass ID in params

  try {
    // Find the existing vehicle service record
    const vehicleService = await VehicleService.findOneAndDelete({
      _id: vehicleServiceId,
      userId,
    });
    if (!vehicleService) {
      return res
        .status(404)
        .json(ApiResponse({}, "Vehicle service record not found", false));
    }

    deleteAttachments(vehicleService.attachments);

    return res
      .status(200)
      .json(ApiResponse({}, "Vehicle service deleted successfully", true));
  } catch (error) {
    console.error("Error in deleteVehicleService:", error);
    return res.status(500).json(ApiResponse({}, error.message, false));
  }
};
