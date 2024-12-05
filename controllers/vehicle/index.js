const {
  ApiResponse,
  convertToUTCDate,
  handleFileOperations,
} = require("../../helpers");
const Vehicle = require("../../models/Vehicle");
const Subscription = require("../../models/Subscription");
const moment = require("moment");
const fs = require("fs");

exports.addVehicle = async (req, res) => {
  const {
    vehicleType,
    make,
    model,
    year,
    VIN,
    entryDate,
    description,
    engineSize,
    type,
    cylinders,
    hasTurboCharger,
    transmissionNum,
    transmissionType,
    carMilage,
    notes,
    fuel,
    driveTrain,
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

    const entryDateUTC = entryDate ? convertToUTCDate(entryDate) : undefined;
    const gallery = req.files.gallery
      ? req.files.gallery.map((image) => image.filename)
      : [];

    console.log(gallery);

    const vehicle = new Vehicle({
      userId: req.user._id,
      vehicleType,
      vehicleDetails: {
        make,
        model,
        year,
        VIN,
        entryDate: entryDateUTC,
        description,
      },
      additionalDetails: {
        engineSize,
        type,
        cylinders,
        hasTurboCharger,
        fuel,
        driveTrain,
        transmissionNum,
        transmissionType,
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
    // Find the vehicle by ID and user
    const vehicle = await Vehicle.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!vehicle) {
      return res.status(404).json(ApiResponse({}, "Vehicle not found", false));
    }

    // Update vehicle fields if provided
    const updateField = (currentValue, newValue) =>
      newValue !== undefined ? newValue : currentValue;

    vehicle.vehicleType = updateField(
      vehicle.vehicleType,
      req.body.vehicleType
    );
    vehicle.vehicleDetails = {
      ...vehicle.vehicleDetails,
      make: updateField(vehicle.vehicleDetails.make, req.body.make),
      model: updateField(vehicle.vehicleDetails.model, req.body.model),
      year: updateField(vehicle.vehicleDetails.year, req.body.year),
      VIN: updateField(vehicle.vehicleDetails.VIN, req.body.VIN),
      entryDate: req.body.entryDate
        ? convertToUTCDate(req.body.entryDate)
        : vehicle.vehicleDetails.entryDate,
      description: updateField(
        vehicle.vehicleDetails.description,
        req.body.description
      ),
    };

    vehicle.additionalDetails = {
      ...vehicle.additionalDetails,
      engineSize: updateField(
        vehicle.additionalDetails.engineSize,
        req.body.engineSize
      ),
      type: updateField(vehicle.additionalDetails.type, req.body.type),
      cylinders: updateField(
        vehicle.additionalDetails.cylinders,
        req.body.cylinders
      ),
      hasTurboCharger: updateField(
        vehicle.additionalDetails.hasTurboCharger,
        req.body.hasTurboCharger
      ),
      transmissionNum: updateField(
        vehicle.additionalDetails.transmissionNum,
        req.body.transmissionNum
      ),
      transmissionType: updateField(
        vehicle.additionalDetails.transmissionType,
        req.body.transmissionType
      ),
      carMilage: updateField(
        vehicle.additionalDetails.carMilage,
        req.body.carMilage
      ),
      notes: updateField(vehicle.additionalDetails.notes, req.body.notes),
      fuel: updateField(vehicle.additionalDetails.fuel, req.body.fuel),
      driveTrain: updateField(
        vehicle.additionalDetails.driveTrain,
        req.body.driveTrain
      ),
    };

    // Handle gallery updates (add or delete images)
    vehicle.gallery = handleFileOperations(
      vehicle.gallery,
      req.files?.gallery,
      req.body.deletedImages
    );

    // Save changes
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
    });
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
    const vehicles = await Vehicle.find({ userId: req.user._id });
    return res.status(200).json(ApiResponse(vehicles, "Vehicles found", true));
  } catch (error) {
    return res.status(500).json(ApiResponse({}, error.message, false));
  }
};
