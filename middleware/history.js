const {
  getAccidentsByIds,
  deleteAccident,
  updateAccident,
} = require("../controllers/accident");
const {
  getAutoPartsByUser,
  deleteAutoPart,
  updateAutoPart,
} = require("../controllers/autoPart");
const {
  getEquipments,
  deleteEquipment,
  updateEquipment,
} = require("../controllers/equipment");
const {
  getGasExpenses,
  deleteGasExpense,
  updateGasExpense,
} = require("../controllers/gas");
const {
  getMaintenances,
  deleteMaintenance,
  updateMaintenance,
} = require("../controllers/maintenance");
const { getPets, deletePet, updatePet } = require("../controllers/pet");
const { getRecords } = require("../controllers/record");
const {
  getRepairsByUser,
  deleteRepair,
  updateRepair,
} = require("../controllers/repair");
const {
  getExpenses,
  deleteTravelExpense,
  updateTravelExpense,
} = require("../controllers/travel");
const {
  getVehicleServices,
  deleteVehicleService,
  updateVehicleService,
} = require("../controllers/vehicleService");
const { getVets, deleteVet, updateVet } = require("../controllers/vet");
const { ApiResponse } = require("../helpers");

exports.checkRecordType = async (req, res, next) => {
  const { type = "AUTOPART" } = req.query;

  try {
    switch (type.toUpperCase()) {
      case "VEHICLE_SERVICE":
        await getVehicleServices(req, res);
        break;
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
      case "CUSTOM":
        await getRecords(req, res);
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

exports.checkDeleteRecord = async (req, res, next) => {
  const { type } = req.query;

  try {
    if (!type) {
      return res
        .status(400)
        .json(ApiResponse({}, "Missing record type", false));
    }

    switch (type.toUpperCase()) {
      case "VEHICLE_SERVICE":
        await deleteVehicleService(req, res);
        break;
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
      case "PET":
        await deletePet(req, res);
        break;
      case "VET":
        await deleteVet(req, res);
        break;
      case "HEAVY":
      case "HOME":
      case "SMALL":
      case "TOOL":
        await deleteEquipment(req, res);
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

exports.checkUpdateRecord = async (req, res, next) => {
  const { type } = req.query;
  console.log(req.body);

  try {
    if (!type) {
      return res
        .status(400)
        .json(ApiResponse({}, "Missing record type", false));
    }

    switch (type.toUpperCase()) {
      case "VEHICLE_SERVICE":
        await updateVehicleService(req, res);
        break;
      case "AUTOPART":
        await updateAutoPart(req, res);
        break;
      case "REPAIR":
        await updateRepair(req, res);
        break;
      case "MAINTENANCE":
        await updateMaintenance(req, res);
        break;
      case "ACCIDENT":
        await updateAccident(req, res);
        break;
      case "GAS":
        await updateGasExpense(req, res);
        break;
      case "TRAVEL":
        await updateTravelExpense(req, res);
        break;
      case "PET":
        await updatePet(req, res);
        break;
      case "VET":
        await updateVet(req, res);
        break;
      case "HEAVY":
      case "HOME":
      case "SMALL":
      case "TOOL":
        await updateEquipment(req, res);
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
