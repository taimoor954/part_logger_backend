const {
  getAccidentsByIds,
  deleteAccident,
} = require("../controllers/accident");
const {
  getAutoPartsByUser,
  deleteAutoPart,
} = require("../controllers/autoPart");
const { getEquipments } = require("../controllers/equipment");
const { getGasExpenses, deleteGasExpense } = require("../controllers/gas");
const {
  getMaintenances,
  deleteMaintenance,
} = require("../controllers/maintenance");
const { getPets } = require("../controllers/pet");
const { getRepairsByUser, deleteRepair } = require("../controllers/repair");
const { getExpenses, deleteTravelExpense } = require("../controllers/travel");
const { getVets } = require("../controllers/vet");
const { ApiResponse } = require("../helpers");

exports.checkRecordType = async (req, res, next) => {
  const { type = "AUTOPART" } = req.query;

  try {
    switch (type.toUpperCase()) {
      case "AUTOPART":
        await getAutoPartsByUser(req, res);
        break;
      case "REPAIR":
        await getRepairsByUser(req, res);
        break;
      case "MAINTENANCE":
        await getMaintenances(req, res);
        break;
      case "ACCIDENT":
        await getAccidentsByIds(req, res);
        break;
      case "GAS":
        await getGasExpenses(req, res);
        break;
      default:
        return res
          .status(400)
          .json(ApiResponse({}, "Invalid category type", false));
    }
  } catch (error) {
    return res.status(500).json(ApiResponse({}, error.message, false));
  }
};

exports.checkOtherRecordType = async (req, res, next) => {
  const { type = "TRAVEL" } = req.query;

  try {
    switch (type.toUpperCase()) {
      case "TRAVEL":
        await getExpenses(req, res);
        break;
      case "PET":
        await getPets(req, res);
        break;
      case "VET":
        await getVets(req, res);
        break;
      case "HEAVY":
      case "HOME":
      case "SMALL":
      case "TOOL":
        await getEquipments(req, res);
        break;
      default:
        return res
          .status(400)
          .json(ApiResponse({}, "Invalid category type", false));
    }
  } catch (error) {
    return res.status(500).json(ApiResponse({}, error.message, false));
  }
};

exports.deleteRecord = async (req, res, next) => {
  const { type } = req.query;

  try {
    if (!type) {
      return res
        .status(400)
        .json(ApiResponse({}, "Missing record type", false));
    }

    switch (type.toUpperCase()) {
      case "AUTOPART":
        await deleteAutoPart(req, res);
        break;
      case "REPAIR":
        await deleteRepair(req, res);
        break;
      case "MAINTENANCE":
        await deleteMaintenance(req, res);
        break;
      case "ACCIDENT":
        await deleteAccident(req, res);
        break;
      case "GAS":
        await deleteGasExpense(req, res);
        break;
      case "TRAVEL":
        await deleteTravelExpense(req, res);
        break;
      default:
        return res
          .status(400)
          .json(ApiResponse({}, "Invalid category type", false));
    }
  } catch (error) {
    return res.status(500).json(ApiResponse({}, error.message, false));
  }
};
