const { default: mongoose } = require("mongoose");
const {
  ApiResponse,
  handleFileOperations,
  deleteAttachments,
} = require("../../helpers");
const Category = require("../../models/Category");
const Record = require("../../models/Record");

exports.addRecord = async (req, res) => {
  const userId = req.user._id;
  let { categoryId, data, description } = req.body;

  try {
    // Validate if category exists for the user
    const category = await Category.findOne({ _id: categoryId, userId });
    if (!category) {
      return res.status(404).json(ApiResponse({}, "Category not found", false));
    }

    try {
      data = JSON.parse(data);
    } catch (error) {
      return res
        .status(400)
        .json(
          ApiResponse({}, "Invalid data format. Expected a JSON string.", false)
        );
    }

    // Validate if `data` is an array
    if (!Array.isArray(data) || data.length === 0) {
      return res
        .status(400)
        .json(
          ApiResponse({}, "Invalid data format. Expected an array.", false)
        );
    }

    // Validate each field in `data`
    const validFieldIds = category.fields.map((field) => field._id.toString());

    // Ensure `data` contains all required fields
    const providedFieldIds = data.map((item) => item.fieldId);
    const missingFields = validFieldIds.filter(
      (fieldId) => !providedFieldIds.includes(fieldId)
    );

    if (missingFields.length > 0) {
      return res
        .status(400)
        .json(
          ApiResponse(
            {},
            `Missing required fields: ${missingFields.join(", ")}`,
            false
          )
        );
    }

    for (const item of data) {
      if (!item.fieldId || !item.value) {
        return res
          .status(400)
          .json(
            ApiResponse(
              {},
              "Each data entry must contain fieldId and value.",
              false
            )
          );
      }

      // Check if `fieldId` exists in category's fields
      if (!validFieldIds.includes(item.fieldId)) {
        return res
          .status(400)
          .json(ApiResponse({}, `Invalid fieldId: ${item.fieldId}`, false));
      }

      // Validate value type based on the category field type
      const field = category.fields.find(
        (f) => f._id.toString() === item.fieldId
      );
      if (field.type === "TEXT" && typeof item.value !== "string") {
        return res
          .status(400)
          .json(
            ApiResponse(
              {},
              `Value for fieldId ${item.fieldId} must be a string`,
              false
            )
          );
      }
      if (field.type === "DATE" && isNaN(Date.parse(item.value))) {
        return res
          .status(400)
          .json(
            ApiResponse(
              {},
              `Value for fieldId ${item.fieldId} must be a valid date`,
              false
            )
          );
      }
    }

    /// Check if category requires attachments
    let attachments = [];
    if (category.hasAttachments) {
      if (!req.files?.gallery || req.files.gallery.length === 0) {
        return res
          .status(400)
          .json(
            ApiResponse(
              {},
              "Attachments are required for this category.",
              false
            )
          );
      }
      attachments = handleFileOperations([], req.files.gallery, null);
    }

    // Create and save the record
    const newRecord = new Record({
      userId,
      categoryId,
      data,
      attachments,
      description,
    });

    await newRecord.save();

    return res
      .status(201)
      .json(ApiResponse(newRecord, "Record added successfully", true));
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(ApiResponse({}, "Internal server error", false));
  }
};

exports.updateRecord = async (req, res) => {
  const userId = req.user._id;
  let { data, attachments, removeAttachments, description } = req.body;
  const { recordId } = req.params;

  try {
    // Find the record
    const record = await Record.findOne({ _id: recordId, userId });
    if (!record) {
      return res.status(404).json(ApiResponse({}, "Record not found", false));
    }

    // Find the category associated with this record
    const category = await Category.findOne({ _id: record.categoryId, userId });
    if (!category) {
      return res.status(404).json(ApiResponse({}, "Category not found", false));
    }

    if (data) {
      data = JSON.parse(data);
      // Validate if `data` is an array
      if (!Array.isArray(data) || data.length === 0) {
        return res
          .status(400)
          .json(
            ApiResponse({}, "Invalid data format. Expected an array.", false)
          );
      }

      // Validate each field in `data`
      const validFieldIds = category.fields.map((field) =>
        field._id.toString()
      );
      // Ensure `data` contains all required fields
      const providedFieldIds = data.map((item) => item.fieldId);
      const missingFields = validFieldIds.filter(
        (fieldId) => !providedFieldIds.includes(fieldId)
      );

      if (missingFields.length > 0) {
        return res
          .status(400)
          .json(
            ApiResponse(
              {},
              `Missing required fields: ${missingFields.join(", ")}`,
              false
            )
          );
      }
      for (const item of data) {
        if (!item.fieldId || !item.value) {
          return res
            .status(400)
            .json(
              ApiResponse(
                {},
                "Each data entry must contain fieldId and value.",
                false
              )
            );
        }

        // Check if `fieldId` exists in category's fields
        if (!validFieldIds.includes(item.fieldId)) {
          return res
            .status(400)
            .json(ApiResponse({}, `Invalid fieldId: ${item.fieldId}`, false));
        }

        // Validate value type based on the category field type
        const field = category.fields.find(
          (f) => f._id.toString() === item.fieldId
        );
        if (field.type === "TEXT" && typeof item.value !== "string") {
          return res
            .status(400)
            .json(
              ApiResponse(
                {},
                `Value for fieldId ${item.fieldId} must be a string`,
                false
              )
            );
        }
        if (field.type === "DATE" && isNaN(Date.parse(item.value))) {
          return res
            .status(400)
            .json(
              ApiResponse(
                {},
                `Value for fieldId ${item.fieldId} must be a valid date`,
                false
              )
            );
        }
      }
      record.data = data;
    }

    if (category.hasAttachments) {
      let updatedAttachments = handleFileOperations(
        record.attachments,
        req.files?.gallery,
        removeAttachments
      );
      if (updatedAttachments.length === 0) {
        return res
          .status(400)
          .json(
            ApiResponse(
              {},
              "Attachments are required for this category.",
              false
            )
          );
      }
      record.attachments = updatedAttachments;
    }

    if (description) {
      record.description = description;
    }

    await record.save();

    return res
      .status(200)
      .json(ApiResponse(record, "Record updated successfully", true));
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(ApiResponse({}, "Internal server error", false));
  }
};

exports.deleteRecord = async (req, res) => {
  const userId = req.user._id;
  const { recordId } = req.params;

  try {
    const record = await Record.findOneAndDelete({ _id: recordId, userId });
    if (!record) {
      return res.status(404).json(ApiResponse({}, "Record not found", false));
    }

    deleteAttachments(record.attachments);

    return res
      .status(200)
      .json(ApiResponse({}, "Record deleted successfully", true));
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(ApiResponse({}, "Internal server error", false));
  }
};

exports.getRecord = async (req, res) => {
  const userId = req.user._id;
  const { recordId } = req.params;

  try {
    const record = await Record.findOne({ _id: recordId, userId }).populate(
      "categoryId"
    );
    if (!record) {
      return res.status(404).json(ApiResponse({}, "Record not found", false));
    }

    return res.status(200).json(ApiResponse(record, "Record found", true));
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(ApiResponse({}, "Internal server error", false));
  }
};

exports.getRecords = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const { categoryId } = req.query;
  const userId = req.user._id;
  try {
    let finalAggregate = [];

    finalAggregate.push({
      $match: { userId, categoryId: new mongoose.Types.ObjectId(categoryId) },
    });

    finalAggregate.push({
      $lookup: {
        from: "categories",
        localField: "categoryId",
        foreignField: "_id",
        as: "category",
      },
    });

    finalAggregate.push({
      $unwind: "$category",
    });

    const myAggregate =
      finalAggregate.length > 0
        ? Record.aggregate(finalAggregate)
        : Record.aggregate([]);

    Record.aggregatePaginate(myAggregate, { page, limit }).then((records) => {
      res
        .status(200)
        .json(
          ApiResponse(records, `${records.docs.length} records found`, true)
        );
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json(ApiResponse({}, "Internal server error", false));
  }
};
