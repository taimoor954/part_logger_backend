const { ApiResponse, convertToUTCDate } = require("../../helpers");
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
      const autoparts = JSON.parse(req.body.autoParts);
      repair.repairPartDetails.autoPart.push();
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(ApiResponse({}, "Internal server error", false));
  }
};
