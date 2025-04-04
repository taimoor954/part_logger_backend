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
    const parseArray = (data) =>
      typeof data === "string" ? JSON.parse(data) : data;
    const parsedSellers = parseArray(sellers);
    const parsedMechanics = parseArray(mechanics);

    // Create sellers and get their IDs
    let sellerIds = [];
    if (parsedSellers.length > 0) {
      const createdSellers = await Worker.insertMany(
        parsedSellers.map((seller) => ({
          userId,
          name: seller,
          type: "SELLER",
        }))
      );
      sellerIds = createdSellers.map((seller) => seller._id);
    }

    // Create mechanics and get their IDs
    let mechanicIds = [];
    if (parsedMechanics.length > 0) {
      const createdMechanics = await Worker.insertMany(
        parsedMechanics.map((mechanic) => ({
          userId,
          name: mechanic,
          type: "MECHANIC",
        }))
      );
      mechanicIds = createdMechanics.map((mechanic) => mechanic._id);
    }

    // Create store with seller and mechanic IDs
    const store = new Store({
      userId,
      storeName,
      storeAddress: {
        address,
        city,
        state,
      },
      sellers: sellerIds,
      mechanics: mechanicIds,
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
  const userId = req.user._id;

  try {
    // Find the existing store
    const store = await Store.findOne({ _id: storeId, userId });
    if (!store) {
      return res.status(404).json(ApiResponse({}, "Store not found", false));
    }

    // Ensure sellers and mechanics are arrays
    const parseArray = (data) =>
      typeof data === "string" ? JSON.parse(data) : data;
    const parsedSellers = parseArray(sellers);
    const parsedMechanics = parseArray(mechanics);

    // Create new sellers and get their IDs
    let newSellerIds = [];
    if (parsedSellers.length > 0) {
      const createdSellers = await Worker.insertMany(
        parsedSellers.map((seller) => ({
          userId,
          name: seller,
          type: "SELLER",
        }))
      );
      newSellerIds = createdSellers.map((seller) => seller._id);
    }

    // Create new mechanics and get their IDs
    let newMechanicIds = [];
    if (parsedMechanics.length > 0) {
      const createdMechanics = await Worker.insertMany(
        parsedMechanics.map((mechanic) => ({
          userId,
          name: mechanic,
          type: "MECHANIC",
        }))
      );
      newMechanicIds = createdMechanics.map((mechanic) => mechanic._id);
    }

    // Update store with new worker IDs
    store.sellers = [...store.sellers, ...newSellerIds];
    store.mechanics = [...store.mechanics, ...newMechanicIds];

    // Optional: Remove duplicates if needed
    store.sellers = [...new Set(store.sellers)];
    store.mechanics = [...new Set(store.mechanics)];

    await store.save();

    // Optionally populate the workers for the response
    const updatedStore = await Store.findById(storeId)
      .populate("sellers")
      .populate("mechanics");

    return res
      .status(200)
      .json(ApiResponse(updatedStore, "Workers added successfully", true));
  } catch (error) {
    return res.status(500).json(ApiResponse({}, error.message, false));
  }
};
exports.getStore = async (req, res) => {
  const { storeId } = req.params;
  try {
    const store = await Store.findById(storeId)
      .populate("sellers")
      .populate("mechanics");

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
  const userId = req.user._id;

  try {
    // Find the existing store
    const store = await Store.findOne({ _id: storeId, userId });
    if (!store) {
      return res.status(404).json(ApiResponse({}, "Store not found", false));
    }

    // Parse arrays if they come as strings
    const parseArray = (data) =>
      typeof data === "string" ? JSON.parse(data) : data;
    oldSellers = parseArray(oldSellers);
    newSellers = parseArray(newSellers);
    oldMechanics = parseArray(oldMechanics);
    newMechanics = parseArray(newMechanics);

    // Remove old sellers
    if (oldSellers.length > 0) {
      store.sellers = store.sellers.filter(
        (sellerId) => !oldSellers.includes(sellerId.toString())
      );
      await Worker.deleteMany({
        _id: { $in: oldSellers },
        userId,
        type: "SELLER",
      });
    }

    // Remove old mechanics
    if (oldMechanics.length > 0) {
      store.mechanics = store.mechanics.filter(
        (mechanicId) => !oldMechanics.includes(mechanicId.toString())
      );
      await Worker.deleteMany({
        _id: { $in: oldMechanics },
        userId,
        type: "MECHANIC",
      });
    }

    // Add new sellers
    let newSellerIds = [];
    if (newSellers.length > 0) {
      const createdSellers = await Worker.insertMany(
        newSellers.map((seller) => ({
          userId,
          name: seller,
          type: "SELLER",
        }))
      );
      newSellerIds = createdSellers.map((seller) => seller._id);
      store.sellers = [...store.sellers, ...newSellerIds];
    }

    // Add new mechanics
    let newMechanicIds = [];
    if (newMechanics.length > 0) {
      const createdMechanics = await Worker.insertMany(
        newMechanics.map((mechanic) => ({
          userId,
          name: mechanic,
          type: "MECHANIC",
        }))
      );
      newMechanicIds = createdMechanics.map((mechanic) => mechanic._id);
      store.mechanics = [...store.mechanics, ...newMechanicIds];
    }

    // Update store details if provided
    if (storeName) store.storeName = storeName;
    if (address || city || state) {
      store.storeAddress = {
        address: address || store.storeAddress.address,
        city: city || store.storeAddress.city,
        state: state || store.storeAddress.state,
      };
    }

    await store.save();

    // Get updated store with populated workers
    const updatedStore = await Store.findById(storeId)
      .populate("sellers")
      .populate("mechanics");

    return res
      .status(200)
      .json(ApiResponse(updatedStore, "Store updated successfully", true));
  } catch (error) {
    return res.status(500).json(ApiResponse({}, error.message, false));
  }
};
exports.getStoresByUser = async (req, res) => {
  const userId = req.user._id;
  try {
    const stores = await Store.find({ userId })
      .populate("sellers")
      .populate("mechanics");
    return res.status(200).json(ApiResponse(stores, "Stores found", true));
  } catch (error) {
    return res.status(400).json(ApiResponse({}, error.message, false));
  }
};
