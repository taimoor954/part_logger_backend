const {
  ApiResponse,
  handleFileOperations,
  convertToUTCDate,
} = require("../../helpers");
const Pet = require("../../models/Pet");
const Vet = require("../../models/Vet");

exports.addVet = async (req, res) => {
  const { petId, checkupDate, payment, otherExpense, details } = req.body;
  const userId = req.user._id;
  try {
    const pet = await Pet.findOne({ _id: petId, userId });

    if (!pet) {
      return res.status(404).json(ApiResponse({}, "Pet not found", false));
    }

    // Validate checkup date
    let checkupDateUTC = null;
    if (checkupDate) {
      checkupDateUTC = new Date(checkupDate);

      if (isNaN(checkupDateUTC.getTime())) {
        return res
          .status(400)
          .json(ApiResponse({}, "Invalid checkup date", false));
      }

      // Checkup date should be less than or equal to the current date
      if (checkupDateUTC > new Date()) {
        return res
          .status(400)
          .json(
            ApiResponse(
              {},
              "Checkup date should be less than or equal to the current date",
              false
            )
          );
      }
    }

    const attachments = req.files?.gallery
      ? handleFileOperations([], req.files.gallery, null)
      : [];

    const vet = new Vet({
      petId,
      userId,
      checkupDate: checkupDateUTC,
      payment,
      otherExpense,
      details,
      attachments,
    });

    await vet.save();
    return res.status(201).json(ApiResponse(vet, "Vet added successfully"));
  } catch (error) {
    return res.status(500).json(ApiResponse({}, error.message, false));
  }
};

exports.updateVet = async (req, res) => {
  const { checkupDate, payment, otherExpense, details, deleteImages, petId } =
    req.body;
  const { vetId } = req.params;
  try {
    const vet = await Vet.findOne({
      _id: vetId,
      userId: req.user._id,
    });

    if (!vet) {
      return res.status(404).json(ApiResponse({}, "Vet not found", false));
    }

    if (petId) {
      const pet = await Pet.findOne({ _id: petId, userId: req.user._id });
      if (!pet) {
        return res.status(404).json(ApiResponse({}, "Pet not found", false));
      }

      vet.petId = petId;
    }

    // Validate checkup date
    let checkupDateUTC = null;
    if (checkupDate) {
      checkupDateUTC = new Date(checkupDate);

      if (isNaN(checkupDateUTC.getTime())) {
        return res
          .status(400)
          .json(ApiResponse({}, "Invalid checkup date", false));
      }

      // Checkup date should be less than or equal to the current date
      if (checkupDateUTC > new Date()) {
        return res
          .status(400)
          .json(
            ApiResponse(
              {},
              "Checkup date should be less than or equal to the current date",
              false
            )
          );
      }
    }

    vet.attachments = handleFileOperations(
      vet.attachments,
      req.files?.gallery,
      deleteImages
    );

    vet.checkupDate = checkupDateUTC;
    vet.payment = payment;
    vet.otherExpense = otherExpense;
    vet.details = details;

    await vet.save();
    return res.status(200).json(ApiResponse(vet, "Vet updated successfully"));
  } catch (error) {
    return res.status(500).json(ApiResponse({}, error.message, false));
  }
};

exports.getVet = async (req, res) => {
  const { vetId } = req.params;
  try {
    const vet = await Vet.findOne({
      _id: vetId,
      userId: req.user._id,
    }).populate("petId");

    if (!vet) {
      return res.status(404).json(ApiResponse({}, "Vet not found", false));
    }

    return res.status(200).json(ApiResponse(vet, "Vet found"));
  } catch (error) {
    return res.status(500).json(ApiResponse({}, error.message, false));
  }
};

exports.getVets = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const userId = req.user._id;
  let { startDate, endDate } = req.query;
  try {
    let finalAggregate = [];

    finalAggregate.push({
      $match: {
        userId,
      },
    });

    finalAggregate.push({
      $lookup: {
        from: "pets",
        localField: "petId",
        foreignField: "_id",
        as: "pet",
      },
    });

    finalAggregate.push({
      $unwind: "$pet",
    });

    if (startDate) {
      startDate = convertToUTCDate(startDate);
      finalAggregate.push({ $match: { checkupDate: { $gte: startDate } } });
    }

    if (endDate) {
      endDate = convertToUTCDate(endDate);
      finalAggregate.push({ $match: { checkupDate: { $lte: endDate } } });
    }

    finalAggregate.push({
      $sort: {
        checkupDate: -1,
      },
    });

    const myAggregate =
      finalAggregate.length > 0
        ? Vet.aggregate(finalAggregate)
        : Vet.aggregate([]);

    Vet.aggregatePaginate(myAggregate, { page, limit }).then((vets) => {
      res
        .status(200)
        .json(ApiResponse(vets, `${vets.docs.length} vets found`, true));
    });
  } catch (error) {
    return res.status(500).json(ApiResponse({}, error.message, false));
  }
};

exports.deleteVet = async (req, res) => {
  const { vetId } = req.params;
  try {
    const vet = await Vet.findOneAndDelete({
      _id: vetId,
      userId: req.user._id,
    });

    if (!vet) {
      return res.status(404).json(ApiResponse({}, "Vet not found", false));
    }

    return res.status(200).json(ApiResponse({}, "Vet deleted successfully"));
  } catch (error) {
    return res.status(500).json(ApiResponse({}, error.message, false));
  }
};
