const { ApiResponse } = require("../../helpers");
const VehicleType = require("../../models/VehicleType");
const fs = require("fs");
const Vehicle = require("../../models/Vehicle");
const { default: mongoose } = require("mongoose");

exports.addVehicleType = async (req, res) => {
  const { name, parentId } = req.body;
  try {
    let parent = null;
    if (parentId) {
      parent = await VehicleType.findById(parentId);
      if (!parent) {
        return res
          .status(400)
          .json(ApiResponse({}, "Parent vehicle type not found", false));
      }
    }
    const vehicleType = new VehicleType({
      name,
      parentId: parent ? parent._id : null,
      image: req.file ? req.file.filename : null,
    });

    await vehicleType.save();

    return res
      .status(201)
      .json(ApiResponse(vehicleType, "Vehicle type added successfully", true));
  } catch (error) {
    return res.status(500).json(ApiResponse({}, error.message, false));
  }
};

exports.updateVehicleType = async (req, res) => {
  const { id } = req.params;
  const { name, parentId } = req.body;
  try {
    const vehicleType = await VehicleType.findById(id);
    if (!vehicleType) {
      return res
        .status(404)
        .json(ApiResponse({}, "Vehicle type not found", false));
    }

    let parent = null;
    if (parentId) {
      parent = await VehicleType.findById(parentId);
      if (!parent) {
        return res
          .status(400)
          .json(ApiResponse({}, "Parent vehicle type not found", false));
      }
      vehicleType.parentId = parent._id;
    }

    if (req.file?.filename) {
      if (vehicleType.image) {
        const filePath = `./Uploads/${vehicleType.image}`;
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`Image with file path ${filePath} deleted`);
        }
      }
      vehicleType.image = req.file.filename;
    }

    vehicleType.name = name || vehicleType.name;

    await vehicleType.save();

    return res
      .status(200)
      .json(
        ApiResponse(vehicleType, "Vehicle type updated successfully", true)
      );
  } catch (error) {
    return res.status(500).json(ApiResponse({}, error.message, false));
  }
};

exports.deleteVehicleType = async (req, res) => {
  const { id } = req.params;

  try {
    const vehicleType = await VehicleType.findByIdAndDelete(id);
    if (!vehicleType) {
      return res
        .status(404)
        .json(ApiResponse({}, "Vehicle type not found", false));
    }

    // Delete the image of the parent vehicle type
    if (vehicleType.image) {
      const filePath = `./Uploads/${vehicleType.image}`;
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Image with file path ${filePath} deleted`);
      }
    }

    // Find and delete all child vehicle types
    const childVehicleTypes = await VehicleType.find({ parentId: id });

    for (const child of childVehicleTypes) {
      // Delete child images if exists
      if (child.image) {
        const childFilePath = `./Uploads/${child.image}`;
        if (fs.existsSync(childFilePath)) {
          fs.unlinkSync(childFilePath);
          console.log(`Child image with file path ${childFilePath} deleted`);
        }
      }

      // Delete the child document
      await VehicleType.findByIdAndDelete(child._id);
    }

    return res
      .status(200)
      .json(
        ApiResponse(
          vehicleType,
          "Vehicle type and its children deleted successfully",
          true
        )
      );
  } catch (error) {
    console.error("Error in deleteVehicleType:", error);
    return res.status(500).json(ApiResponse({}, error.message, false));
  }
};

exports.getVehicleTypes = async (req, res) => {
  const { parentId } = req.query;

  try {
    let vehicleTypes = [];

    if (parentId) {
      if (!mongoose.isValidObjectId(parentId)) {
        return res.status(400).json(ApiResponse({}, "Invalid parentId", false));
      }

      // Fetch the parent
      const parent = await VehicleType.findById(parentId).select("-__v");

      if (!parent) {
        return res
          .status(404)
          .json(ApiResponse({}, "Parent vehicle type not found", false));
      }

      // Fetch the children
      const children = await VehicleType.find({ parentId }).select("-__v");

      // Combine parent and children
      vehicleTypes = [parent, ...children];
    } else {
      // If no parentId provided, fetch all top-level vehicle types (those without parent)
      vehicleTypes = await VehicleType.find({
        parentId: null,
      }).select("-__v");
    }

    if (!vehicleTypes.length) {
      return res
        .status(404)
        .json(ApiResponse({}, "No vehicle types found", false));
    }

    return res
      .status(200)
      .json(
        ApiResponse(vehicleTypes, "Vehicle types fetched successfully", true)
      );
  } catch (error) {
    console.error("Error in getVehicleTypes:", error);
    return res.status(500).json(ApiResponse({}, error.message, false));
  }
};

exports.getVehicleType = async (req, res) => {
  const { id } = req.params;

  try {
    const vehicleType = await VehicleType.findById(id)
      .populate("parentId")
      .select("-__v");
    if (!vehicleType) {
      return res
        .status(404)
        .json(ApiResponse({}, "Vehicle type not found", false));
    }

    return res
      .status(200)
      .json(
        ApiResponse(vehicleType, "Vehicle type fetched successfully", true)
      );
  } catch (error) {
    console.error("Error in getVehicleTypeById:", error);
    return res.status(500).json(ApiResponse({}, error.message, false));
  }
};
