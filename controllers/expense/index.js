const { ApiResponse } = require("../../helpers");
const VehicleService = require("../../models/VehicleService");
const Accident = require("../../models/Accident");
const Gas = require("../../models/Gas");
const Pet = require("../../models/Pet");
const Vet = require("../../models/Vet");
const Equipment = require("../../models/Equipment");

exports.getExpenses = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const { startDate, endDate, keyword } = req.query;
  try {
    const userId = req.user._id;
    // Build date filters
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter = {
        $gte: startDate ? new Date(startDate) : new Date(0),
        $lte: endDate ? new Date(endDate) : new Date(),
      };
    }
    // Build keyword regex
    const keywordRegex = keyword ? new RegExp(keyword, "i") : null;
    // Query all models in parallel with keyword filtering
    const [vehicleServices, accidents, gasExpenses, pets, vets, equipments] =
      await Promise.all([
        VehicleService.find({
          userId,
          ...(startDate || endDate ? { serviceDate: dateFilter } : {}),
          ...(keywordRegex
            ? {
                $or: [
                  { description: keywordRegex },
                  { partBrand: keywordRegex },
                  { comment: keywordRegex },
                ],
              }
            : {}),
        })
          .select(
            "_id serviceDate repairPrice partsCost laborCost warrantyPrice description partBrand comment createdAt updatedAt"
          )
          .lean(),
        Accident.find({
          userId,
          ...(startDate || endDate ? { accidentDate: dateFilter } : {}),
          ...(keywordRegex
            ? {
                $or: [
                  { location: keywordRegex },
                  { involvedDriverName: keywordRegex },
                  { involvedDriverPhone: keywordRegex },
                  { description: keywordRegex },
                ],
              }
            : {}),
        })
          .select(
            "_id accidentDate location involvedDriverName involvedDriverPhone description createdAt updatedAt"
          )
          .lean(),
        Gas.find({
          userId,
          ...(startDate || endDate ? { gasDate: dateFilter } : {}),
          ...(keywordRegex
            ? {
                $or: [{ description: keywordRegex }],
              }
            : {}),
        })
          .select("_id gasDate price description createdAt updatedAt")
          .lean(),
        Pet.find({
          userId,
          ...(startDate || endDate ? { purchaseDate: dateFilter } : {}),
          ...(keywordRegex
            ? {
                $or: [
                  { name: keywordRegex },
                  { specie: keywordRegex },
                  { breed: keywordRegex },
                  { veterinarianName: keywordRegex },
                  { veterinarianPhone: keywordRegex },
                  { description: keywordRegex },
                ],
              }
            : {}),
        })
          .select(
            "_id purchaseDate price name specie breed veterinarianName veterinarianPhone description createdAt updatedAt"
          )
          .lean(),
        Vet.find({
          userId,
          ...(startDate || endDate ? { checkupDate: dateFilter } : {}),
          ...(keywordRegex
            ? {
                $or: [{ details: keywordRegex }],
              }
            : {}),
        })
          .select(
            "_id checkupDate payment otherExpense details createdAt updatedAt"
          )
          .lean(),
        Equipment.find({
          userId,
          ...(startDate || endDate ? { purchaseDate: dateFilter } : {}),
          ...(keywordRegex
            ? {
                $or: [
                  { equipmentName: keywordRegex },
                  { equipmentType: keywordRegex },
                  { description: keywordRegex },
                ],
              }
            : {}),
        })
          .select(
            "_id purchaseDate price equipmentName equipmentType description createdAt updatedAt"
          )
          .lean(),
      ]);

    // Normalize and combine results
    const allExpenses = [
      ...vehicleServices.map((e) => ({
        type: "VEHICLE_SERVICE",
        date: e.serviceDate,
        amount:
          (e.repairPrice || 0) +
          (e.partsCost || 0) +
          (e.laborCost || 0) +
          (e.warrantyPrice || 0),
        ...e,
      })),
      ...accidents.map((e) => ({
        type: "ACCIDENT",
        date: e.accidentDate,
        amount: 0, // No explicit amount in accident
        ...e,
      })),
      ...gasExpenses.map((e) => ({
        type: "GAS",
        date: e.gasDate,
        amount: e.price || 0,
        ...e,
      })),
      ...pets.map((e) => ({
        type: "PET",
        date: e.purchaseDate,
        amount: e.price || 0,
        ...e,
      })),
      ...vets.map((e) => ({
        type: "VET",
        date: e.checkupDate,
        amount: (e.payment || 0) + (e.otherExpense || 0),
        ...e,
      })),
      ...equipments.map((e) => ({
        type: "EQUIPMENT",
        date: e.purchaseDate,
        amount: e.price || 0,
        ...e,
      })),
    ];

    // Sort by date descending
    allExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Pagination metadata
    const total = allExpenses.length;
    const totalPages = Math.ceil(total / limit);
    const paginated = allExpenses.slice((page - 1) * limit, page * limit);

    return res.status(200).json(
      ApiResponse(
        {
          docs: paginated,
          page,
          limit,
          total,
          totalPages,
        },
        "Recent expenses found",
        true
      )
    );
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(ApiResponse({}, "Internal server error", false));
  }
};
