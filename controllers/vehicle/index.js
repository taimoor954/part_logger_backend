const { ApiResponse } = require("../../helpers");
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

    const entryDateUTC = entryDate
      ? moment(entryDate).utc().toDate()
      : undefined;
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
    const vehicle = await Vehicle.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!vehicle) {
      return res.status(404).json(ApiResponse({}, "Vehicle not found", false));
    }

    vehicle.vehicleType = req.body.vehicleType
      ? req.body.vehicleType
      : vehicle.vehicleType;
    vehicle.vehicleDetails.make = req.body.make
      ? req.body.make
      : vehicle.vehicleDetails.make;
    vehicle.vehicleDetails.model = req.body.model
      ? req.body.model
      : vehicle.vehicleDetails.model;
    vehicle.vehicleDetails.year = req.body.year
      ? req.body.year
      : vehicle.vehicleDetails.year;
    vehicle.vehicleDetails.VIN = req.body.VIN
      ? req.body.VIN
      : vehicle.vehicleDetails.VIN;
    vehicle.vehicleDetails.entryDate = req.body.entryDate
      ? moment(req.body.entryDate).utc().toDate()
      : vehicle.vehicleDetails.entryDate;
    vehicle.vehicleDetails.description = req.body.description
      ? req.body.description
      : vehicle.vehicleDetails.description;
    vehicle.additionalDetails.engineSize = req.body.engineSize
      ? req.body.engineSize
      : vehicle.additionalDetails.engineSize;
    vehicle.additionalDetails.type = req.body.type
      ? req.body.type
      : vehicle.additionalDetails.type;
    vehicle.additionalDetails.cylinders = req.body.cylinders
      ? req.body.cylinders
      : vehicle.additionalDetails.cylinders;
    vehicle.additionalDetails.hasTurboCharger = req.body.hasTurboCharger
      ? req.body.hasTurboCharger
      : vehicle.additionalDetails.hasTurboCharger;
    vehicle.additionalDetails.transmissionNum = req.body.transmissionNum
      ? req.body.transmissionNum
      : vehicle.additionalDetails.transmissionNum;
    vehicle.additionalDetails.transmissionType = req.body.transmissionType
      ? req.body.transmissionType
      : vehicle.additionalDetails.transmissionType;
    vehicle.additionalDetails.carMilage = req.body.carMilage
      ? req.body.carMilage
      : vehicle.additionalDetails.carMilage;
    vehicle.additionalDetails.notes = req.body.notes
      ? req.body.notes
      : vehicle.additionalDetails.notes;
    vehicle.additionalDetails.fuel = req.body.fuel
      ? req.body.fuel
      : vehicle.additionalDetails.fuel;
    vehicle.additionalDetails.driveTrain = req.body.driveTrain
      ? req.body.driveTrain
      : vehicle.additionalDetails.driveTrain;

    if (req.files.gallery) {
      const gallery = req.files.gallery.map((image) => image.filename);
      vehicle.gallery = vehicle.gallery.concat(gallery);
    }

    // there will be an array of deleted images
    if (req.body.deletedImages) {
      const deletedImages = JSON.parse(req.body.deletedImages);
      vehicle.gallery = vehicle.gallery.filter(
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

    await vehicle.save();
    return res
      .status(200)
      .json(ApiResponse(vehicle, "Vehicle updated successfully", true));
  } catch (error) {
    return res.status(500).json(ApiResponse({}, error.message, false));
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
