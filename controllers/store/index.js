const { ApiResponse } = require("../../helpers");
const Store = require("../../models/Store");
const mongoose = require("mongoose");
const Worker = require("../../models/Worker");

exports.addStore = async (req, res) => {
  const {
    storeName,
    address,
    city,
    state,
    sellers = [],
    mechanics = [],
  } = req.body;
  const userId = req.user._id;

  try {
    // Ensure sellers and mechanics are arrays
    let parsedSellers =
      typeof sellers === "string" ? JSON.parse(sellers) : sellers;
    let parsedMechanics =
      typeof mechanics === "string" ? JSON.parse(mechanics) : mechanics;

    if (!Array.isArray(parsedSellers) || !Array.isArray(parsedMechanics)) {
      return res
        .status(400)
        .json(ApiResponse({}, "Sellers and mechanics must be arrays", false));
    }

    // Validate ObjectIds
    parsedSellers = parsedSellers.filter((id) => mongoose.isValidObjectId(id));
    parsedMechanics = parsedMechanics.filter((id) =>
      mongoose.isValidObjectId(id)
    );

    // Fetch workers from DB
    const validSellers = await Worker.find({ _id: { $in: parsedSellers } });
    const validMechanics = await Worker.find({ _id: { $in: parsedMechanics } });

    if (validSellers.length !== parsedSellers.length) {
      return res
        .status(404)
        .json(ApiResponse({}, "One or more sellers not found", false));
    }

    if (validMechanics.length !== parsedMechanics.length) {
      return res
        .status(404)
        .json(ApiResponse({}, "One or more mechanics not found", false));
    }

    // Create store with sellers and mechanics
    const store = new Store({
      userId,
      storeName,
      storeAddress: {
        address,
        city,
        state,
      },
      sellers: Array.from(new Set(parsedSellers)),
      mechanics: Array.from(new Set(parsedMechanics)),
    });

    await store.save();

    return res
      .status(201)
      .json(ApiResponse(store, "Store added successfully", true));
  } catch (error) {
    return res.status(500).json(ApiResponse({}, error.message, false));
  }
};

exports.addWorker = async (req, res) => {
  const { storeId } = req.params;
  let { sellers = [], mechanics = [] } = req.body;

  try {
    if (!mongoose.isValidObjectId(storeId)) {
      return res.status(400).json(ApiResponse({}, "Invalid store ID", false));
    }

    // Ensure sellers and mechanics are arrays
    if (typeof sellers === "string") {
      try {
        sellers = JSON.parse(sellers);
        if (!Array.isArray(sellers)) throw new Error();
      } catch (error) {
        return res
          .status(400)
          .json(ApiResponse({}, "Invalid sellers format", false));
      }
    }

    if (typeof mechanics === "string") {
      try {
        mechanics = JSON.parse(mechanics);
        if (!Array.isArray(mechanics)) throw new Error();
      } catch (error) {
        return res
          .status(400)
          .json(ApiResponse({}, "Invalid mechanics format", false));
      }
    }

    if (!Array.isArray(sellers) || !Array.isArray(mechanics)) {
      return res
        .status(400)
        .json(ApiResponse({}, "Sellers and mechanics must be arrays", false));
    }

    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json(ApiResponse({}, "Store not found", false));
    }

    // Validate worker IDs
    sellers = sellers.filter((id) => mongoose.isValidObjectId(id));
    mechanics = mechanics.filter((id) => mongoose.isValidObjectId(id));

    const newSellers = await Worker.find({
      _id: { $in: sellers },
      type: "SELLER",
    });
    const newMechanics = await Worker.find({
      _id: { $in: mechanics },
      type: "MECHANIC",
    });

    if (newSellers.length !== sellers.length) {
      return res
        .status(404)
        .json(ApiResponse({}, "One or more sellers not found", false));
    }

    if (newMechanics.length !== mechanics.length) {
      return res
        .status(404)
        .json(ApiResponse({}, "One or more mechanics not found", false));
    }

    // Add workers without duplicates
    store.sellers = Array.from(
      new Set([...store.sellers.map(String), ...sellers])
    );
    store.mechanics = Array.from(
      new Set([...store.mechanics.map(String), ...mechanics])
    );

    await store.save();

    return res
      .status(200)
      .json(ApiResponse(store, "Workers added successfully", true));
  } catch (error) {
    return res.status(500).json(ApiResponse({}, error.message, false));
  }
};

exports.getStore = async (req, res) => {
  const { storeId } = req.params;
  try {
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json(ApiResponse({}, "Store not found", false));
    }
    return res.status(200).json(ApiResponse(store, "Store found", true));
  } catch (error) {
    return res.status(400).json(ApiResponse({}, error.message, false));
  }
};

exports.updateStore = async (req, res) => {
  const { storeId } = req.params;
  let {
    storeName,
    address,
    city,
    state,
    oldSellers = [],
    newSellers = [],
    oldMechanics = [],
    newMechanics = [],
  } = req.body;

  try {
    if (!mongoose.isValidObjectId(storeId)) {
      return res.status(400).json(ApiResponse({}, "Invalid store ID", false));
    }

    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json(ApiResponse({}, "Store not found", false));
    }

    // Ensure data is parsed correctly
    const parseArray = (data) =>
      typeof data === "string" ? JSON.parse(data) : data;
    oldSellers = parseArray(oldSellers);
    newSellers = parseArray(newSellers);
    oldMechanics = parseArray(oldMechanics);
    newMechanics = parseArray(newMechanics);

    if (
      !Array.isArray(oldSellers) ||
      !Array.isArray(newSellers) ||
      !Array.isArray(oldMechanics) ||
      !Array.isArray(newMechanics)
    ) {
      return res
        .status(400)
        .json(ApiResponse({}, "Invalid worker data format", false));
    }

    // Validate ObjectIds
    oldSellers = oldSellers.filter((id) => mongoose.isValidObjectId(id));
    newSellers = newSellers.filter((id) => mongoose.isValidObjectId(id));
    oldMechanics = oldMechanics.filter((id) => mongoose.isValidObjectId(id));
    newMechanics = newMechanics.filter((id) => mongoose.isValidObjectId(id));

    // Ensure new workers exist before adding
    const validNewSellers = await Worker.find({ _id: { $in: newSellers } });
    const validNewMechanics = await Worker.find({ _id: { $in: newMechanics } });

    if (validNewSellers.length !== newSellers.length) {
      return res
        .status(404)
        .json(ApiResponse({}, "One or more new sellers not found", false));
    }

    if (validNewMechanics.length !== newMechanics.length) {
      return res
        .status(404)
        .json(ApiResponse({}, "One or more new mechanics not found", false));
    }

    // Convert IDs to strings for consistent comparison
    const currentSellers = store.sellers.map(String);
    const currentMechanics = store.mechanics.map(String);

    // Remove old sellers & add new ones (ensuring uniqueness)
    store.sellers = Array.from(
      new Set([
        ...currentSellers.filter((id) => !oldSellers.includes(id)),
        ...newSellers,
      ])
    );

    // Remove old mechanics & add new ones (ensuring uniqueness)
    store.mechanics = Array.from(
      new Set([
        ...currentMechanics.filter((id) => !oldMechanics.includes(id)),
        ...newMechanics,
      ])
    );

    // Save updated store
    await store.save();

    return res
      .status(200)
      .json(ApiResponse(store, "Store updated successfully", true));
  } catch (error) {
    return res.status(500).json(ApiResponse({}, error.message, false));
  }
};

exports.getStoresByUser = async (req, res) => {
  const userId = req.user._id;
  try {
    const stores = await Store.find({ userId });
    return res.status(200).json(ApiResponse(stores, "Stores found", true));
  } catch (error) {
    return res.status(400).json(ApiResponse({}, error.message, false));
  }
};
