const { ApiResponse } = require("../../helpers");
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
    const vehicle = await Vehicle.findOne({
      _id: vehicleId,
      userId: req.user._id,
    });

    if (!vehicle) {
      return res.status(404).json(ApiResponse({}, "Vehicle not found", false));
    }

    const store = await Store.findOne({ _id: storeId, userId: req.user._id });

    if (!store) {
      return res.status(404).json(ApiResponse({}, "Store not found", false));
    }

    const seller = await Store.findOne({
      sellers: {
        $elemMatch: {
          _id: sellerId,
        },
      },
    });

    if (!seller) {
      return res.status(404).json(ApiResponse({}, "Seller not found", false));
    }

    const buyingDateUTC = buyingDate
      ? moment(buyingDate).utc().toDate()
      : undefined;

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
        attachments: req.files.gallery
          ? req.files.gallery.map((image) => image.filename)
          : [],
      },
    });

    await autoPart.save();

    return res
      .status(200)
      .json(ApiResponse(autoPart, "Auto part added successfully", true));
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(ApiResponse({}, "Internal server error", false));
  }
};

exports.updateAutoPart = async (req, res) => {
  try {
    const autoPart = await AutoPart.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!autoPart) {
      return res
        .status(404)
        .json(ApiResponse({}, "Auto part not found", false));
    }

    if (req.body.vehicleId) {
      const vehicle = await Vehicle.findOne({
        _id: req.body.vehicleId,
        userId: req.user._id,
      });
      if (!vehicle) {
        return res
          .status(404)
          .json(ApiResponse({}, "Vehicle not found", false));
      }

      autoPart.vehicleId = req.body.vehicleId
        ? req.body.vehicleId
        : autoPart.vehicleId;
    }

    if (req.body.storeId) {
      const store = await Store.findOne({
        _id: req.body.storeId,
        userId: req.user._id,
      });
      if (!store) {
        return res.status(404).json(ApiResponse({}, "Store not found", false));
      }
      autoPart.storeId = req.body.storeId ? req.body.storeId : autoPart.storeId;
    }

    if (req.body.sellerId) {
      const seller = await Store.findOne({
        sellers: {
          $elemMatch: {
            _id: req.body.sellerId,
          },
        },
      });
      if (!seller) {
        return res.status(404).json(ApiResponse({}, "Seller not found", false));
      }
      autoPart.sellerId = req.body.sellerId
        ? req.body.sellerId
        : autoPart.sellerId;
    }

    autoPart.buyingDate = req.body.buyingDate
      ? moment(req.body.buyingDate).utc().toDate()
      : autoPart.buyingDate;

    autoPart.partDetails.partName = req.body.partName
      ? req.body.partName
      : autoPart.partDetails.partName;
    autoPart.partDetails.brand = req.body.brand
      ? req.body.brand
      : autoPart.partDetails.brand;
    autoPart.partDetails.price = req.body.price
      ? req.body.price
      : autoPart.partDetails.price;
    autoPart.partDetails.currentCarMileage = req.body.currentCarMileage
      ? req.body.currentCarMileage
      : autoPart.partDetails.currentCarMileage;
    autoPart.partDetails.condition = req.body.condition
      ? req.body.condition
      : autoPart.partDetails.condition;
    autoPart.partDetails.partNumber = req.body.partNumber
      ? req.body.partNumber
      : autoPart.partDetails.partNumber;
    autoPart.partDetails.warrantyManufacture = req.body.warrantyManufacture
      ? req.body.warrantyManufacture
      : autoPart.partDetails.warrantyManufacture;
    autoPart.partDetails.extendedWarranty = req.body.extendedWarranty
      ? req.body.extendedWarranty
      : autoPart.partDetails.extendedWarranty;
    autoPart.partDetails.extendedWarrantyPrice = req.body.extendedWarrantyPrice
      ? req.body.extendedWarrantyPrice
      : autoPart.partDetails.extendedWarrantyPrice;
    autoPart.partDetails.receiptNum = req.body.receiptNum
      ? req.body.receiptNum
      : autoPart.partDetails.receiptNum;

    if (req.files.gallery) {
      const gallery = req.files.gallery.map((image) => image.filename);
      autoPart.partDetails.attachments =
        autoPart.partDetails.attachments.concat(gallery);
    }

    if (req.body.deletedImages) {
      const deletedImages = JSON.parse(req.body.deletedImages);
      autoPart.partDetails.attachments =
        autoPart.partDetails.attachments.filter(
          (image) => !deletedImages.includes(image)
        );

      // delete the images from the server
      deletedImages.forEach((image) => {
        const filePath = `./Uploads/${image}`;
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`Image with file path ${filePath} deleted`);
        }
      });
    }

    await autoPart.save();

    return res
      .status(200)
      .json(ApiResponse(autoPart, "Auto part updated successfully", true));
  } catch (error) {
    return res.status(500).json(ApiResponse({}, error.message, false));
  }
};
