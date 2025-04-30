const {
  ApiResponse,
  convertToUTCDate,
  handleFileOperations,
  deleteAttachments,
} = require("../../helpers");
const Equipment = require("../../models/Equipment");

exports.addEquipment = async (req, res) => {
  const { equipmentName, equipmentType, purchaseDate, price } = req.body;
  const userId = req.user._id;
  try {
    // Validate purchase date
    let purchaseDateUTC = null;
    if (purchaseDate) {
      purchaseDateUTC = new Date(purchaseDate);

      if (isNaN(purchaseDateUTC.getTime())) {
        return res
          .status(400)
          .json(ApiResponse({}, "Invalid purchase date", false));
      }

      // Purchase date should be less than or equal to the current date
      if (purchaseDateUTC > new Date()) {
        return res
          .status(400)
          .json(
            ApiResponse(
              {},
              "Purchase date should be less than or equal to the current date",
              false
            )
          );
      }
    }

    const attachments = req.files?.gallery
      ? handleFileOperations([], req.files.gallery, null)
      : [];

    const equipment = new Equipment({
      userId,
      equipmentName,
      equipmentType,
      purchaseDate: purchaseDateUTC,
      price,
      attachments,
    });

    await equipment.save();

    return res
      .status(201)
      .json(ApiResponse(equipment, "Equipment added successfully"));
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json(ApiResponse({}, "Internal server error", false));
  }
};

exports.updateEquipment = async (req, res) => {
  const { equipmentName, equipmentType, purchaseDate, price, deleteImages } =
    req.body;
  const userId = req.user._id;
  const { type } = req?.query;
  try {
    const equipment = await Equipment.findOne({
      _id: req.params.id,
      userId,
      equipmentType: type,
    });

    if (!equipment) {
      return res
        .status(404)
        .json(ApiResponse({}, "Equipment not found", false));
    }

    // Validate purchase date
    let purchaseDateUTC = null;
    if (purchaseDate) {
      purchaseDateUTC = new Date(purchaseDate);

      if (isNaN(purchaseDateUTC.getTime())) {
        return res
          .status(400)
          .json(ApiResponse({}, "Invalid purchase date", false));
      }

      // Purchase date should be less than or equal to the current date
      if (purchaseDateUTC > new Date()) {
        return res
          .status(400)
          .json(
            ApiResponse(
              {},
              "Purchase date should be less than or equal to the current date",
              false
            )
          );
      }

      equipment.purchaseDate = purchaseDateUTC;
    }

    equipment.attachments = handleFileOperations(
      equipment.attachments,
      req.files?.gallery,
      deleteImages
    );

    equipment.equipmentName = equipmentName
      ? equipmentName
      : equipment.equipmentName;
    equipment.equipmentType = equipmentType
      ? equipmentType
      : equipment.equipmentType;
    equipment.price = price ? price : equipment.price;

    await equipment.save();
    return res.status(200).json(ApiResponse(equipment, "Equipment updated"));
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json(ApiResponse({}, "Internal server error", false));
  }
};

exports.getEquipment = async (req, res) => {
  const { equipmentId } = req.params;
  try {
    const equipment = await Equipment.findOne({
      _id: equipmentId,
      userId: req.user._id,
    });

    if (!equipment) {
      return res
        .status(404)
        .json(ApiResponse({}, "Equipment not found", false));
    }

    return res.status(200).json(ApiResponse(equipment, "Equipment found"));
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json(ApiResponse({}, "Internal server error", false));
  }
};

exports.getEquipments = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const userId = req.user._id;
  let { startDate, endDate, type, keyword } = req.query;

  try {
    let finalAggregate = [];

    // Match user id
    finalAggregate.push({
      $match: {
        userId,
      },
    });

    if (startDate) {
      startDate = convertToUTCDate(startDate);
      finalAggregate.push({ $match: { purchaseDate: { $gte: startDate } } });
    }

    if (endDate) {
      endDate = convertToUTCDate(endDate);
      finalAggregate.push({ $match: { purchaseDate: { $lte: endDate } } });
    }

    if (type) {
      type = type.toUpperCase();
      finalAggregate.push({ $match: { equipmentType: type } });
    }

    if (keyword) {
      finalAggregate.push({
        $match: {
          $or: [{ equipmentName: { $regex: keyword, $options: "i" } }],
        },
      });
    }

    finalAggregate.push({
      $sort: {
        purchaseDate: -1,
      },
    });

    const myAggregate =
      finalAggregate.length > 0
        ? Equipment.aggregate(finalAggregate)
        : Equipment.aggregate([]);

    Equipment.aggregatePaginate(myAggregate, { page, limit }).then(
      (equipments) => {
        res
          .status(200)
          .json(
            ApiResponse(
              equipments,
              `${equipments.docs.length} equipments found`,
              true
            )
          );
      }
    );
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json(ApiResponse({}, "Internal server error", false));
  }
};

exports.deleteEquipment = async (req, res) => {
  const { id } = req.params;
  try {
    const equipment = await Equipment.findOneAndDelete({
      _id: id,
      userId: req.user._id,
    });

    if (!equipment) {
      return res
        .status(404)
        .json(ApiResponse({}, "Equipment not found", false));
    }

    deleteAttachments(equipment.attachments);

    return res.status(200).json(ApiResponse({}, "Equipment deleted"));
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json(ApiResponse({}, "Internal server error", false));
  }
};
