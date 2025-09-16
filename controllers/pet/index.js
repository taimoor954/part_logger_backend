const {
  ApiResponse,
  handleFileOperations,
  convertToUTCDate,
  deleteAttachments,
} = require("../../helpers");
const Pet = require("../../models/Pet");

exports.addPet = async (req, res) => {
  const {
    specie,
    breed,
    dateOfBirth,
    purchaseDate,
    name,
    price,
    veterinarianName,
    veterinarianPhone,
    description,
  } = req.body;
  try {
    // Validate date of birth and purchase date
    let dateOfBirthUTC = null;
    let purchaseDateUTC = null;
    if (dateOfBirth) {
      dateOfBirthUTC = new Date(dateOfBirth);

      if (isNaN(dateOfBirthUTC.getTime())) {
        return res
          .status(400)
          .json(ApiResponse({}, "Invalid date of birth", false));
      }

      // date of birth should be less than or equal to the current date
      if (dateOfBirthUTC > new Date()) {
        return res
          .status(400)
          .json(
            ApiResponse(
              {},
              "Date of birth should be less than or equal to the current date",
              false
            )
          );
      }
    }

    if (purchaseDate) {
      purchaseDateUTC = new Date(purchaseDate);

      if (isNaN(purchaseDateUTC.getTime())) {
        return res
          .status(400)
          .json(ApiResponse({}, "Invalid purchase date", false));
      }

      // purchase date should be less than or equal to the current date
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

    const pet = new Pet({
      userId: req.user._id,
      specie,
      breed,
      dateOfBirth: dateOfBirthUTC,
      purchaseDate: purchaseDateUTC,
      veterinarianName,
      veterinarianPhone,
      name,
      price,
      attachments,
      description,
    });

    await pet.save();

    return res.status(201).json(ApiResponse(pet, "Pet added", true));
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json(ApiResponse({}, "Internal server error", false));
  }
};

exports.updatePet = async (req, res) => {
  const {
    specie,
    breed,
    dateOfBirth,
    purchaseDate,
    name,
    price,
    deleteImages,
    description,
    veterinarianName,
    veterinarianPhone,
  } = req.body;
  const { id } = req.params;
  try {
    const pet = await Pet.findOne({
      _id: id,
      userId: req.user._id,
    });

    if (!pet) {
      return res.status(404).json(ApiResponse({}, "Pet not found", false));
    }

    // Validate date of birth and purchase date
    let dateOfBirthUTC = null;
    let purchaseDateUTC = null;
    if (dateOfBirth) {
      dateOfBirthUTC = new Date(dateOfBirth);

      if (isNaN(dateOfBirthUTC.getTime())) {
        return res
          .status(400)
          .json(ApiResponse({}, "Invalid date of birth", false));
      }

      // date of birth should be less than or equal to the current date
      if (dateOfBirthUTC > new Date()) {
        return res
          .status(400)
          .json(
            ApiResponse(
              {},
              "Date of birth should be less than or equal to the current date",
              false
            )
          );
      }

      pet.dateOfBirth = dateOfBirthUTC;
    }

    if (purchaseDate) {
      purchaseDateUTC = new Date(purchaseDate);

      if (isNaN(purchaseDateUTC.getTime())) {
        return res
          .status(400)
          .json(ApiResponse({}, "Invalid purchase date", false));
      }

      // purchase date should be less than or equal to the current date
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

      pet.purchaseDate = purchaseDateUTC;
    }

    pet.specie = specie ? specie : pet.specie;
    pet.breed = breed ? breed : pet.breed;
    pet.name = name ? name : pet.name;
    pet.price = price ? price : pet.price;
    pet.veterinarianName = veterinarianName
      ? veterinarianName
      : pet.veterinarianName;
    pet.veterinarianPhone = veterinarianPhone
      ? veterinarianPhone
      : pet.veterinarianPhone;
    pet.description = description ? description : pet.description;

    pet.attachments = handleFileOperations(
      pet.attachments,
      req.files?.gallery,
      deleteImages
    );

    await pet.save();

    return res.status(200).json(ApiResponse(pet, "Pet updated", true));
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json(ApiResponse({}, "Internal server error", false));
  }
};

exports.getPet = async (req, res) => {
  const { petId } = req.params;
  try {
    const pet = await Pet.findOne({
      _id: petId,
      userId: req.user._id,
    });

    if (!pet) {
      return res.status(404).json(ApiResponse({}, "Pet not found", false));
    }

    return res.status(200).json(ApiResponse(pet, "Pet found", true));
  } catch (error) {
    console.error(err);
    return res
      .status(500)
      .json(ApiResponse({}, "Internal server error", false));
  }
};

exports.getPets = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const userId = req.user._id;
  let { startDate, endDate, keyword } = req.query;

  try {
    let finalAggregate = [];

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

    if (keyword) {
      finalAggregate.push({
        $match: {
          $or: [
            { name: { $regex: keyword, $options: "i" } },
            { specie: { $regex: keyword, $options: "i" } },
            { breed: { $regex: keyword, $options: "i" } },
          ],
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
        ? Pet.aggregate(finalAggregate)
        : Pet.aggregate([]);

    Pet.aggregatePaginate(myAggregate, { page, limit }).then((pets) => {
      res
        .status(200)
        .json(ApiResponse(pets, `${pets.docs.length} pets found`, true));
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json(ApiResponse({}, "Internal server error", false));
  }
};

exports.deletePet = async (req, res) => {
  const { id } = req.params;
  try {
    const pet = await Pet.findOneAndDelete({
      _id: id,
      userId: req.user._id,
    });

    if (!pet) {
      return res.status(404).json(ApiResponse({}, "Pet not found", false));
    }

    deleteAttachments(pet.attachments);

    return res.status(200).json(ApiResponse({}, "Pet deleted", true));
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json(ApiResponse({}, "Internal server error", false));
  }
};
