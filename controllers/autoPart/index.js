const {
  ApiResponse,
  updateField,
  handleFileOperations,
  convertToUTCDate,
  deleteAttachments,
} = require("../../helpers");
const AutoPart = require("../../models/AutoPart");
const Store = require("../../models/Store");
const Vehicle = require("../../models/Vehicle");
const moment = require("moment");
const fs = require("fs");
const { default: mongoose } = require("mongoose");
const { deleteDraftById } = require("../draft");

exports.addAutoPart = async (req, res) => {
  const {
    vehicleId,
    storeId,
    sellerId,
    buyingDate,
    partName,
    brand,
    price,
    currentCarMileage,
    condition,
    partNumber,
    warrantyManufacture,
    extendedWarranty,
    extendedWarrantyPrice,
    receiptNum,
  } = req.body;

  try {
    // Validate vehicle existence
    const vehicle = await Vehicle.findOne({
      _id: vehicleId,
      userId: req.user._id,
    });
    if (!vehicle) {
      return res.status(404).json(ApiResponse({}, "Vehicle not found", false));
    }

    // Validate store existence
    const store = await Store.findOne({ _id: storeId, userId: req.user._id });
    if (!store) {
      return res.status(404).json(ApiResponse({}, "Store not found", false));
    }

    // Validate seller existence if provided
    const seller = store.sellers.find(
      (seller) => seller._id.toString() === sellerId
    );

    if (!seller) {
      return res.status(404).json(ApiResponse({}, "Seller not found", false));
    }

    // Convert buying date to UTC
    const buyingDateUTC = buyingDate ? convertToUTCDate(buyingDate) : undefined;

    const draft = await deleteDraftById(req.query?.draftId, req.user._id);

    // Handle attachments (gallery files)
    const attachments = handleFileOperations(
      draft?.attachments ? draft.attachments : [],
      req.files?.gallery,
      req.body?.deletedImages
    );

    // Create a new auto part
    const autoPart = new AutoPart({
      userId: req.user._id,
      vehicleId,
      storeId,
      sellerId,
      buyingDate: buyingDateUTC,
      partDetails: {
        partName,
        brand,
        price,
        currentCarMileage,
        condition,
        partNumber,
        warrantyManufacture,
        extendedWarranty,
        extendedWarrantyPrice,
        receiptNum,
        attachments,
      },
    });

    await autoPart.save();

    return res
      .status(200)
      .json(ApiResponse(autoPart, "Auto part added successfully", true));
  } catch (error) {
    console.error("Error adding auto part:", error.message);
    return res
      .status(500)
      .json(ApiResponse({}, "Internal server error", false));
  }
};

exports.updateAutoPart = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { vehicleId, storeId, sellerId, deletedImages, buyingDate } =
      req.body;

    console.log(req.body);

    // Find the AutoPart by ID and user ID
    const autoPart = await AutoPart.findOne({ _id: id, userId });
    if (!autoPart) {
      return res
        .status(404)
        .json(ApiResponse({}, "Auto part not found", false));
    }

    // Update vehicleId if provided and valid
    if (vehicleId) {
      const vehicle = await Vehicle.findOne({ _id: vehicleId, userId });
      if (!vehicle) {
        return res
          .status(404)
          .json(ApiResponse({}, "Vehicle not found", false));
      }
      autoPart.vehicleId = vehicleId;
    }

    // Update storeId if provided and valid
    if (storeId) {
      const store = await Store.findOne({ _id: storeId, userId });
      if (!store) {
        return res.status(404).json(ApiResponse({}, "Store not found", false));
      }
      autoPart.storeId = storeId;
    }

    // Validate sellerId only if storeId is provided
    if (sellerId) {
      if (!storeId) {
        return res
          .status(400)
          .json(
            ApiResponse({}, "storeId is required for seller validation", false)
          );
      }
      const seller = await Store.findOne({
        _id: storeId,
        userId,
        sellers: { $elemMatch: { _id: sellerId } },
      });
      if (!seller) {
        return res.status(404).json(ApiResponse({}, "Seller not found", false));
      }
      autoPart.sellerId = sellerId;
    }

    // Update buyingDate
    if (buyingDate) {
      autoPart.buyingDate = moment(buyingDate).utc().toDate();
    }

    // Update part details
    const partDetailsFields = [
      "partName",
      "brand",
      "price",
      "currentCarMileage",
      "condition",
      "partNumber",
      "warrantyManufacture",
      "extendedWarranty",
      "extendedWarrantyPrice",
      "receiptNum",
    ];
    partDetailsFields.forEach((field) =>
      updateField(autoPart.partDetails, req.body, field)
    );

    // Handle file operations
    autoPart.partDetails.attachments = handleFileOperations(
      autoPart.partDetails.attachments,
      req.files?.gallery,
      deletedImages
    );

    // Save the updated AutoPart
    await autoPart.save();

    return res
      .status(200)
      .json(ApiResponse(autoPart, "Auto part updated successfully", true));
  } catch (error) {
    console.error("Error updating auto part:", error.message);
    return res.status(500).json(ApiResponse({}, error.message, false));
  }
};

exports.getAutoPart = async (req, res) => {
  const { id } = req.params;
  try {
    const autoPart = await AutoPart.findOne({ _id: id, userId: req.user._id })
      .populate("vehicleId")
      .populate("storeId");
    if (!autoPart) {
      return res
        .status(404)
        .json(ApiResponse({}, "Auto part not found", false));
    }

    const seller =
      autoPart.storeId &&
      autoPart.storeId.sellers.find(
        (seller) => seller._id.toString() === autoPart.sellerId.toString()
      );

    const autoPartWithSeller = {
      ...autoPart.toObject(),
      seller: seller || null,
    };

    return res
      .status(200)
      .json(ApiResponse(autoPartWithSeller, "Auto part found", true));
  } catch (error) {
    return res.status(500).json(ApiResponse({}, error.message, false));
  }
};

exports.getAutoPartsByUser = async (req, res) => {
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
      finalAggregate.push({ $match: { buyingDate: { $gte: startDate } } });
    }

    if (endDate) {
      endDate = convertToUTCDate(endDate);
      finalAggregate.push({ $match: { buyingDate: { $lte: endDate } } });
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
        ? AutoPart.aggregate(finalAggregate)
        : AutoPart.aggregate([]);

    AutoPart.aggregatePaginate(myAggregate, { page, limit }).then(
      (autoParts) => {
        res
          .status(200)
          .json(
            ApiResponse(
              autoParts,
              `${autoParts.docs.length} auto parts found`,
              true
            )
          );
      }
    );
  } catch (error) {
    return res.status(500).json(ApiResponse({}, error.message, false));
  }
};

exports.deleteAutoPart = async (req, res) => {
  const { id } = req.params;
  try {
    const autoPart = await AutoPart.findOneAndDelete({
      _id: id,
      userId: req.user._id,
    });

    if (!autoPart) {
      return res
        .status(404)
        .json(ApiResponse({}, "Auto part not found", false));
    }

    deleteAttachments(autoPart.partDetails.attachments);
    return res
      .status(200)
      .json(ApiResponse({}, "Auto part deleted successfully", true));
  } catch (error) {
    return res.status(500).json(ApiResponse({}, error.message, false));
  }
};
