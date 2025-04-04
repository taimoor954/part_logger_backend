const { getAccidentsByIds } = require("../controllers/accident");
const { getAutoPartsByUser } = require("../controllers/autoPart");
const { getEquipments } = require("../controllers/equipment");
const { getGasExpenses } = require("../controllers/gas");
const { getMaintenances } = require("../controllers/maintenance");
const { getPets } = require("../controllers/pet");
const { getRepairsByUser } = require("../controllers/repair");
const { getExpenses } = require("../controllers/travel");
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
