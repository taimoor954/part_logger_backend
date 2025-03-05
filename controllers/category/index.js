const { ApiResponse } = require("../../helpers");
const Category = require("../../models/Category");

exports.addCategory = async (req, res) => {
  const userId = req.user._id;
  const { title, fields, hasAttachments } = req.body;
  try {
    const category = new Category({
      userId,
      title,
      fields,
      hasAttachments,
    });

    await category.save();

    return res
      .status(201)
      .json(ApiResponse(category, "Category added successfully", true));
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json(ApiResponse({}, "Internal server error", false));
  }
};

exports.updateCategory = async (req, res) => {
  const userId = req.user._id;
  const { title, fields, hasAttachments } = req.body;
  try {
    const category = await Category.findOneAndUpdate(
      { _id: req.params.id, userId },
      { title, fields, hasAttachments },
      { new: true }
    );

    if (!category) {
      return res.status(404).json(ApiResponse({}, "Category not found", false));
    }

    return res
      .status(200)
      .json(ApiResponse(category, "Category updated successfully", true));
  } catch (error) {
    console.error(err);
    return res
      .status(500)
      .json(ApiResponse({}, "Internal server error", false));
  }
};

exports.getCategories = async (req, res) => {
  const userId = req.user._id;
  try {
    const categories = await Category.find({ userId });

    return res
      .status(200)
      .json(ApiResponse(categories, "Categories fetched successfully", true));
  } catch (error) {
    console.error(err);
    return res
      .status(500)
      .json(ApiResponse({}, "Internal server error", false));
  }
};

exports.getCategory = async (req, res) => {
  const userId = req.user._id;
  try {
    const category = await Category.findOne({ _id: req.params.id, userId });

    if (!category) {
      return res.status(404).json(ApiResponse({}, "Category not found", false));
    }

    return res
      .status(200)
      .json(ApiResponse(category, "Category fetched successfully", true));
  } catch (error) {
    console.error(err);
    return res
      .status(500)
      .json(ApiResponse({}, "Internal server error", false));
  }
};

exports.deleteCategory = async (req, res) => {
  const userId = req.user._id;
  try {
    const category = await Category.findOneAndDelete({
      _id: req.params.id,
      userId,
    });

    if (!category) {
      return res.status(404).json(ApiResponse({}, "Category not found", false));
    }

    return res
      .status(200)
      .json(ApiResponse({}, "Category deleted successfully", true));
  } catch (error) {
    console.error(err);
    return res
      .status(500)
      .json(ApiResponse({}, "Internal server error", false));
  }
};
