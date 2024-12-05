const {
  ApiResponse,
  updateField,
  handleFileOperations,
  convertToUTCDate,
} = require("../../helpers");
const AutoPart = require("../../models/AutoPart");
const Store = require("../../models/Store");
const Vehicle = require("../../models/Vehicle");
const moment = require("moment");
const fs = require("fs");

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

    // Handle attachments (gallery files)
    const attachments = handleFileOperations([], req.files?.gallery, null);

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
