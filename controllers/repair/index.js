const { ApiResponse } = require("../../helpers");
const moment = require("moment");
const fs = require("fs");
const AutoPart = require("../../models/AutoPart");
const Repair = require("../../models/Repair");
const Store = require("../../models/Store");
const Vehicle = require("../../models/Vehicle");

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

    const mechanic = await Store.findOne({
      mechanics: {
        $elemMatch: {
          _id: sellerId,
        },
      },
    });

    if (!mechanic) {
      return res.status(404).json(ApiResponse({}, "Mechanic not found", false));
    }

    const repairDateUTC = moment(repairDate).utc().toDate();

    // Validate the autoParts
    autoParts = JSON.parse(autoParts);
    if (autoParts && autoParts.length > 0) {
      autoParts.forEach(async (autoPartId) => {
        const autoPart = await AutoPart.findOne({
          _id: autoPartId,
          userId: req.user._id,
        });

        if (!autoPart) {
          return res
            .status(404)
            .json(ApiResponse({}, "Auto part not found", false));
        }
      });
    }

    const repair = new Repair({
      userId: req.user._id,
      vehicleId,
      storeId,
      mechanicId,
      repairDate: repairDateUTC,
      repairPartDetails: {
        repairs: JSON.parse(repairs),
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
