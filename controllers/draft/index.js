const { default: mongoose } = require("mongoose");
const {
  ApiResponse,
  handleFileOperations,
  convertToUTCDate,
  deleteAttachments,
} = require("../../helpers");
const Draft = require("../../models/Draft");
const Vehicle = require("../../models/Vehicle");

exports.deleteDraftById = async (draftId, userId) => {
  try {
    if (!draftId) {
      return;
    }
    const draft = await Draft.findOneAndDelete({
      _id: draftId,
      userId,
    });

    console.log(draft);

    return draft;
  } catch (error) {
    console.error("Error deleting draft:", error);
    return null;
  }
};

exports.createDraft = async (req, res) => {
  try {
    const { title, vehicleId } = req.body;

    // if (!title) {
    //   return res.status(400).json(ApiResponse({}, "Title is required", false));
    // }

    const vehicle = await Vehicle.findOne({
      _id: vehicleId,
      userId: req.user._id,
    });

    if (!vehicle) {
      return res.status(400).json(ApiResponse({}, "Vehicle not found", false));
    }

    const attachments = req.files?.gallery
      ? handleFileOperations([], req.files.gallery, null)
      : [];

    const draft = new Draft({
      userId: req.user._id,
      title,
      attachments,
      vehicleId,
    });

    await draft.save();

    return res
      .status(201)
      .json(ApiResponse(draft, "Draft created successfully"));
  } catch (error) {
    console.error("Error creating draft:", error);
    return res.status(500).json(ApiResponse({}, error, false));
  }
};

exports.getDrafts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const userId = req.user._id;
  let { startDate, endDate, vehicleId } = req.query;
  try {
    let finalAggregate = [];

    finalAggregate.push({
      $match: {
        userId: userId,
      },
    });

    if (vehicleId) {
      finalAggregate.push({
        $match: {
          vehicleId: new mongoose.Types.ObjectId(vehicleId),
        },
      });

      finalAggregate.push({
        $lookup: {
          from: "vehicles",
          localField: "vehicleId",
          foreignField: "_id",
          as: "vehicle",
        },
      });

      finalAggregate.push({
        $unwind: {
          path: "$vehicle",
          preserveNullAndEmptyArrays: true,
        },
      });
    }

    if (startDate) {
      startDate = convertToUTCDate(startDate);
      finalAggregate.push({ $match: { createdAt: { $gte: startDate } } });
    }

    if (endDate) {
      endDate = convertToUTCDate(endDate);
      finalAggregate.push({ $match: { createdAt: { $lte: endDate } } });
    }

    finalAggregate.push({
      $sort: {
        createdAt: -1,
      },
    });

    const myAggregate =
      finalAggregate.length > 0
        ? Draft.aggregate(finalAggregate)
        : Draft.aggregate([]);

    Draft.aggregatePaginate(myAggregate, { page, limit }).then((drafts) => {
      res
        .status(200)
        .json(ApiResponse(drafts, `${drafts.docs.length} drafts found`, true));
    });
  } catch (error) {
    console.error("Error fetching drafts:", error);
    return res.status(500).json(ApiResponse({}, error, false));
  }
};

exports.getDraftById = async (req, res) => {
  const { id } = req.params;
  try {
    const draft = await Draft.findById(id).populate("vehicleId");

    if (!draft) {
      return res.status(404).json(ApiResponse({}, "Draft not found", false));
    }

    return res
      .status(200)
      .json(ApiResponse(draft, "Draft fetched successfully"));
  } catch (error) {
    console.error("Error fetching draft:", error);
    return res.status(500).json(ApiResponse({}, error, false));
  }
};

exports.deleteDraft = async (req, res) => {
  const { id } = req.params;
  try {
    const draft = await Draft.findOneAndDelete({
      _id: id,
      userId: req.user._id,
    });

    if (!draft) {
      return res.status(404).json(ApiResponse({}, "Draft not found", false));
    }

    deleteAttachments(draft.attachments);

    return res
      .status(200)
      .json(ApiResponse(draft, "Draft deleted successfully"));
  } catch (error) {
    console.error("Error deleting draft:", error);
    return res.status(500).json(ApiResponse({}, error, false));
  }
};
