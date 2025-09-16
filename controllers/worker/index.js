const Worker = require("../../models/Worker");
const { ApiResponse } = require("../../helpers");

exports.addWorker = async (req, res) => {
  const userId = req.user._id;
  const { name, type } = req.body;
  try {
    const worker = new Worker({
      userId,
      name,
      type,
    });

    await worker.save();

    return res
      .status(201)
      .json(ApiResponse(worker, "Worker added successfully", true));
  } catch (error) {
    console.error("Error adding auto part:", error.message);
    return res
      .status(500)
      .json(ApiResponse({}, "Internal server error", false));
  }
};

exports.getWorkers = async (req, res) => {
  const userId = req.user._id;
  try {
    const workers = await Worker.find({ userId });
    return res
      .status(200)
      .json(ApiResponse(workers, "Workers retrieved successfully", true));
  } catch (error) {
    console.error("Error getting workers:", error.message);
    return res
      .status(500)
      .json(ApiResponse({}, "Internal server error", false));
  }
};

exports.getWorker = async (req, res) => {
  const { id } = req.params;
  try {
    const worker = await Worker.findOne({ _id: id, userId: req.user._id });
    if (!worker) {
      return res.status(404).json(ApiResponse({}, "Worker not found", false));
    }
    return res
      .status(200)
      .json(ApiResponse(worker, "Worker retrieved successfully", true));
  } catch (error) {
    console.error("Error getting worker:", error.message);
    return res
      .status(500)
      .json(ApiResponse({}, "Internal server error", false));
  }
};

exports.updateWorker = async (req, res) => {
  const { id } = req.params;
  const { name, type } = req.body;
  try {
    const worker = await Worker.findOne({ _id: id, userId: req.user._id });
    if (!worker) {
      return res.status(404).json(ApiResponse({}, "Worker not found", false));
    }
    worker.name = name ? name : worker.name;
    worker.type = type ? type : worker.type;
    await worker.save();

    return res
      .status(200)
      .json(ApiResponse(worker, "Worker updated successfully", true));
  } catch (error) {
    console.error("Error getting worker:", error.message);
    return res
      .status(500)
      .json(ApiResponse({}, "Internal server error", false));
  }
};

exports.deleteWorker = async (req, res) => {
  const { id } = req.params;
  try {
    const worker = await Worker.findOneAndDelete({
      _id: id,
      userId: req.user._id,
    });
    if (!worker) {
      return res.status(404).json(ApiResponse({}, "Worker not found", false));
    }
    return res
      .status(200)
      .json(ApiResponse({}, "Worker deleted successfully", true));
  } catch (error) {
    console.error("Error deleting worker:", error.message);
    return res
      .status(500)
      .json(ApiResponse({}, "Internal server error", false));
  }
};
