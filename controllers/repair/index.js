const {
  ApiResponse,
  convertToUTCDate,
  handleFileOperations,
  deleteAttachments,
} = require("../../helpers");
const moment = require("moment");
const fs = require("fs");
const AutoPart = require("../../models/AutoPart");
const Repair = require("../../models/Repair");
const Store = require("../../models/Store");
const Vehicle = require("../../models/Vehicle");
const exp = require("constants");
const { default: mongoose } = require("mongoose");

exports.addRepair = async (req, res) => {
  let {
    vehicleId,
    storeId,
    mechanicId,
    repairDate,
    repairs,
    autoParts,
    currentCarMileage,
    estimatedRepairCost,
    laborCost,
    repairPartsCost,
    totalRepairCost,
  } = req.body;

  try {
    // Validate if the vehicle exists for the user
    const vehicle = await Vehicle.findOne({
      _id: vehicleId,
      userId: req.user._id,
    });

    if (!vehicle) {
      return res.status(404).json(ApiResponse({}, "Vehicle not found", false));
    }

    // Validate if the store exists for the user
    const store = await Store.findOne({ _id: storeId, userId: req.user._id });
    if (!store) {
      return res.status(404).json(ApiResponse({}, "Store not found", false));
    }

    // Validate if the mechanic exists in the store for the user
    const mechanic = store.mechanics.find(
      (mechanic) => mechanic._id.toString() === mechanicId
    );

    if (!mechanic) {
      return res.status(404).json(ApiResponse({}, "Mechanic not found", false));
    }

    // Parse the repair date into UTC
    const repairDateUTC = repairDate ? convertToUTCDate(repairDate) : undefined;

    // Validate the autoParts if provided
    if (autoParts && autoParts.length > 0) {
      autoParts = JSON.parse(autoParts);
      for (const autoPartId of autoParts) {
        const autoPart = await AutoPart.findOne({
          _id: autoPartId,
          userId: req.user._id,
        });

        if (!autoPart) {
          return res
            .status(404)
            .json(ApiResponse({}, "Auto part not found", false));
        }
      }
    }

    repairs = repairs ? JSON.parse(repairs) : [];
    // convert the repairs array of strings into an array of objects
    repairs = repairs.map((repair) => {
      return { name: repair };
    });

    // Create a new Repair object
    const repair = new Repair({
      userId: req.user._id,
      vehicleId,
      storeId,
      mechanicId,
      repairDate: repairDateUTC,
      repairPartDetails: {
        repairs: repairs,
        autoParts,
        currentCarMileage,
        estimatedRepairCost,
        laborCost,
        repairPartsCost,
        totalRepairCost,
        attachments: req.files.gallery
          ? req.files.gallery.map((image) => image.filename)
          : [],
      },
    });

    // Save the repair to the database
    await repair.save();

    return res
      .status(200)
      .json(ApiResponse(repair, "Repair added successfully", true));
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(ApiResponse({}, "Internal server error", false));
  }
};

exports.updateRepair = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  try {
    const repair = await Repair.findOne({ _id: id, userId });
    if (!repair) {
      return res.status(404).json(ApiResponse({}, "Repair not found", false));
    }

    if (req.body.vehicleId) {
      const vehicle = await Vehicle.findOne({
        _id: req.body.vehicleId,
        userId,
      });
      if (!vehicle) {
        return res
          .status(404)
          .json(ApiResponse({}, "Vehicle not found", false));
      }
      repair.vehicleId = req.body.vehicleId || repair.vehicleId;
    }

    if (req.body.storeId) {
      const store = await Store.findOne({
        _id: req.body.storeId,
        userId: req.user._id,
      });
      if (!store) {
        return res.status(404).json(ApiResponse({}, "Store not found", false));
      }

      repair.storeId = req.body.storeId || repair.storeId;

      if (req.body.mechanicId) {
        const mechanic = store.mechanics.find(
          (mechanic) => mechanic._id.toString() === req.body.mechanicId
        );

        if (!mechanic) {
          return res
            .status(404)
            .json(ApiResponse({}, "Mechanic not found", false));
        }

        repair.mechanicId = req.body.mechanicId || repair.mechanicId;
      }
    }

    if (req.body.repairDate) {
      repair.repairDate = convertToUTCDate(req.body.repairDate);
    }

    if (req.body.repairs) {
      const repairs = JSON.parse(req.body.repairs);
      // add new repairs to the existing repairs array
      repair.repairPartDetails.repairs.push(
        ...repairs.map((repair) => ({ name: repair }))
      );
    }

    // delete the old repairs if provided
    if (req.body.deletedRepairs) {
      const deletedRepairs = JSON.parse(req.body.deletedRepairs);
      // deleted repairs contains the id of the repairs to be deleted
      // filter the existing arrary
      repair.repairPartDetails.repairs =
        repair.repairPartDetails.repairs.filter(
          (repair) => !deletedRepairs.includes(repair._id.toString())
        );
    }

    if (req.body.autoParts) {
      // check if the autoParts are valid
      const autoParts = JSON.parse(req.body.autoParts);
      autoParts.forEach(async (autoPartId) => {
        const autoPart = await AutoPart.findOne({
          _id: autoPartId,
          userId,
        });
        if (!autoPart) {
          return res
            .status(404)
            .json(ApiResponse({}, "Auto part not found", false));
        }
      });
      // check if the autoparts are already in the array and throw error if they are
      autoParts.forEach((autoPartId) => {
        if (repair.repairPartDetails.autoParts.includes(autoPartId)) {
          return res
            .status(400)
            .json(ApiResponse({}, "Auto part already exists", false));
        }
      });
      // add the new autoParts to the existing array
      repair.repairPartDetails.autoParts.push(...autoParts);
    }

    if (req.body.deletedAutoParts) {
      const deletedAutoParts = JSON.parse(req.body.deletedAutoParts);
      repair.repairPartDetails.autoParts =
        repair.repairPartDetails.autoParts.filter(
          (autoPart) => !deletedAutoParts.includes(autoPart.toString())
        );
    }

    repair.repairPartDetails = {
      ...repair.repairPartDetails,
      currentCarMileage: req.body.currentCarMileage || repair.currentCarMileage,
      estimatedRepairCost:
        req.body.estimatedRepairCost || repair.estimatedRepairCost,
      laborCost: req.body.laborCost || repair.laborCost,
      repairPartsCost: req.body.repairPartsCost || repair.repairPartsCost,
      totalRepairCost: req.body.totalRepairCost || repair.totalRepairCost,
    };

    // Handle file operations
    repair.repairPartDetails.attachments = handleFileOperations(
      repair.repairPartDetails.attachments,
      req.files?.gallery,
      req.body.deletedImages
    );

    await repair.save();

    return res.status(200).json(ApiResponse(repair, "Repair updated", true));
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(ApiResponse({}, "Internal server error", false));
  }
};

exports.getRepair = async (req, res) => {
  try {
    const repair = await Repair.findOne({
      _id: req.params.id,
      userId: req.user._id,
    })
      .populate("vehicleId")
      .populate("storeId")
      .populate("repairPartDetails.autoParts");

    if (!repair) {
      return res.status(404).json(ApiResponse({}, "Repair not found", false));
    }

    // Find mechanicId in the store mechanic array
    const mechanic =
      repair.storeId &&
      repair.storeId.mechanics.find(
        (mechanic) => mechanic._id.toString() === repair.mechanicId.toString()
      );

    const repairWithMechanic = {
      ...repair.toObject(),
      mechanic: mechanic || null,
    };

    return res
      .status(200)
      .json(ApiResponse(repairWithMechanic, "Repair found", true));
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(ApiResponse({}, "Internal server error", false));
  }
};

exports.getRepairsByUser = async (req, res) => {
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
      finalAggregate.push({ $match: { repairDate: { $gte: startDate } } });
    }

    if (endDate) {
      endDate = convertToUTCDate(endDate);
      finalAggregate.push({ $match: { repairDate: { $lte: endDate } } });
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

    finalAggregate.push({ $unwind: "$vehicle" });
    finalAggregate.push({ $unwind: "$store" });

    const myAggregate =
      finalAggregate.length > 0
        ? Repair.aggregate(finalAggregate)
        : Repair.aggregate([]);

    Repair.aggregatePaginate(myAggregate, { page, limit })
      .then((repairs) => {
        res
          .status(200)
          .json(
            ApiResponse(repairs, `${repairs.docs.length} repairs found`, true)
          );
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json(ApiResponse({}, err.message, false));
      });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(ApiResponse({}, "Internal server error", false));
  }
};

exports.deleteRepair = async (req, res) => {
  try {
    const repair = await Repair.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!repair) {
      return res.status(404).json(ApiResponse({}, "Repair not found", false));
    }

    deleteAttachments(repair.repairPartDetails.attachments);

    return res.status(200).json(ApiResponse({}, "Repair deleted", true));
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(ApiResponse({}, "Internal server error", false));
  }
};
