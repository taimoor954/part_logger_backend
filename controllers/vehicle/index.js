const {
  ApiResponse,
  convertToUTCDate,
  handleFileOperations,
  deleteAttachments,
} = require("../../helpers");
const Vehicle = require("../../models/Vehicle");
const Subscription = require("../../models/Subscription");
const moment = require("moment");
const fs = require("fs");
const VehicleType = require("../../models/VehicleType");

exports.addVehicle = async (req, res) => {
  const {
    vehicleType,
    make,
    model,
    year,
    VIN,
    purchaseDate,
    description,
    engineSize,
    cylinders,
    turboCharger,
    transmissionType,
    engineOilType,
    engineCoolantType,
    transmissionFluidType,
    transmissionSpeed,
    tireSize,
    tirePressure,
    carMilage,
    notes,
    fuel,
    driveTrain,
    warranty,
  } = req.body;
  try {
    const subscription = await Subscription.findById(
      req.subscription.subscriptionId
    );
    if (!subscription) {
      return res
        .status(403)
        .json(
          ApiResponse(
            {},
            "Subscription does not exist to which user is subscribed",
            false
          )
        );
    }

    const userVehicles = await Vehicle.find({ userId: req.user._id });
    if (userVehicles.length >= subscription.vehicleLimit) {
      return res
        .status(403)
        .json(
          ApiResponse(
            {},
            "You have reached the maximum limit of vehicles allowed",
            false
          )
        );
    }

    const vehicleTypeObj = await VehicleType.findById(vehicleType);
    if (!vehicleTypeObj) {
      return res
        .status(400)
        .json(ApiResponse({}, "Vehicle type does not exist", false));
    }

    const purchaseDateUTC = purchaseDate
      ? convertToUTCDate(purchaseDate)
      : undefined;
    const gallery = req.files.gallery
      ? req.files.gallery.map((image) => image.filename)
      : [];

    console.log(gallery);

    const vehicle = new Vehicle({
      userId: req.user._id,
      vehicleType: vehicleTypeObj._id,
      vehicleDetails: {
        make,
        model,
        year,
        VIN,
        purchaseDate: purchaseDateUTC,
        description,
        warranty,
      },
      additionalDetails: {
        engineSize,
        cylinders,
        turboCharger,
        fuel,
        driveTrain,
        transmissionType,
        engineOilType,
        engineCoolantType,
        transmissionFluidType,
        transmissionSpeed,
        tireSize,
        tirePressure,
        carMilage,
        notes,
      },
      gallery,
    });

    await vehicle.save();

    return res

      .status(200)
      .json(ApiResponse(vehicle, "Vehicle added successfully", true));
  } catch (error) {
    return res.status(500).json(ApiResponse({}, error.message, false));
  }
};

exports.updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate("vehicleType");

    if (!vehicle) {
      return res.status(404).json(ApiResponse({}, "Vehicle not found", false));
    }

    const updateField = (obj, data) => {
      for (let key in data) {
        if (data[key] !== undefined) {
          if (key === "purchaseDate") {
            obj[key] = convertToUTCDate(data[key]);
          } else {
            obj[key] = data[key];
          }
        }
      }
    };

    // Only update if req.body has vehicleDetails
    if (
      req.body.make ||
      req.body.model ||
      req.body.year ||
      req.body.VIN ||
      req.body.purchaseDate ||
      req.body.description ||
      req.body.warranty !== undefined
    ) {
      updateField(vehicle.vehicleDetails, {
        make: req.body.make,
        model: req.body.model,
        year: req.body.year,
        VIN: req.body.VIN,
        warranty: req.body.warranty,
        purchaseDate: req.body.purchaseDate,
        description: req.body.description,
      });
    }

    // Same for additionalDetails
    updateField(vehicle.additionalDetails, {
      engineSize: req.body.engineSize,
      cylinders: req.body.cylinders,
      turboCharger: req.body.turboCharger,
      engineOilType: req.body.engineOilType,
      engineCoolantType: req.body.engineCoolantType,
      transmissionFluidType: req.body.transmissionFluidType,
      transmissionSpeed: req.body.transmissionSpeed,
      tireSize: req.body.tireSize,
      tirePressure: req.body.tirePressure,
      transmissionType: req.body.transmissionType,
      carMilage: req.body.carMilage,
      notes: req.body.notes,
      fuel: req.body.fuel,
      driveTrain: req.body.driveTrain,
    });

    // Handle gallery updates
    vehicle.gallery = handleFileOperations(
      vehicle.gallery,
      req.files?.gallery,
      req.body.deletedImages
    );

    await vehicle.save();

    return res
      .status(200)
      .json(ApiResponse(vehicle, "Vehicle updated successfully", true));
  } catch (error) {
    console.error("Error updating vehicle:", error.message);
    return res
      .status(500)
      .json(ApiResponse({}, "Internal server error", false));
  }
};

exports.getVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate("vehicleType");
    if (!vehicle) {
      return res.status(404).json(ApiResponse({}, "Vehicle not found", false));
    }

    return res.status(200).json(ApiResponse(vehicle, "Vehicle found", true));
  } catch (error) {
    return res.status(500).json(ApiResponse({}, error.message, false));
  }
};

exports.getVehicleByUser = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ userId: req.user._id }).populate(
      "vehicleType"
    );
    return res.status(200).json(ApiResponse(vehicles, "Vehicles found", true));
  } catch (error) {
    return res.status(500).json(ApiResponse({}, error.message, false));
  }
};

exports.deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!vehicle) {
      return res.status(404).json(ApiResponse({}, "Vehicle not found", false));
    }

    deleteAttachments(vehicle.gallery);

    return res.status(200).json(ApiResponse({}, "Vehicle deleted", true));
  } catch (error) {
    return res.status(500).json(ApiResponse({}, error.message, false));
  }
};
