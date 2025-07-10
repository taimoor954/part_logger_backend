const { ApiResponse } = require("../../helpers");
const Category = require("../../models/Category");
const fs = require("fs");
const path = require("path");

exports.addCategory = async (req, res) => {
  const userId = req.user._id;
  let { title, fields, hasAttachments } = req.body;
  try {
    // Parse fields if it's a string (from form-data)
    if (typeof fields === "string") {
      fields = JSON.parse(fields);
      console.log(fields);
    }
    // Handle file upload (gallery)
    let gallery = "";
    if (req.files && req.files.gallery && req.files.gallery.length > 0) {
      gallery = req.files.gallery[0].filename;
    }
    const category = new Category({
      userId,
      title,
      fields,
      hasAttachments,
      gallery,
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
  let { title, fields, hasAttachments } = req.body;
  try {
    // Parse fields if it's a string (from form-data)
    if (typeof fields === "string") {
      fields = JSON.parse(fields);
    }
    // Handle file upload (gallery)
    let gallery = undefined;
    let oldGallery = null;
    if (req.files && req.files.gallery && req.files.gallery.length > 0) {
      // Find the existing category to get the old gallery filename
      const existingCategory = await Category.findOne({
        _id: req.params.id,
        userId,
      });
      if (existingCategory && existingCategory.gallery) {
        oldGallery = existingCategory.gallery;
      }
      gallery = req.files.gallery[0].filename;
    }
    const updateData = { title, fields, hasAttachments };
    if (gallery !== undefined) {
      updateData.gallery = gallery;
    }
    const category = await Category.findOneAndUpdate(
      { _id: req.params.id, userId },
      updateData,
      { new: true }
    );

    // Delete old gallery file if a new one was uploaded
    if (oldGallery) {
      const oldPath = path.join(__dirname, "../../Uploads", oldGallery);
      fs.unlink(oldPath, (err) => {
        if (err) {
          console.error("Failed to delete old gallery image:", err);
        }
      });
    }

    if (!category) {
      return res.status(404).json(ApiResponse({}, "Category not found", false));
    }

    return res
      .status(200)
      .json(ApiResponse(category, "Category updated successfully", true));
  } catch (error) {
    console.error(error);
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
