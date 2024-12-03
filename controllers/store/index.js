const { ApiResponse } = require("../../helpers");
const Store = require("../../models/Store");

exports.addStore = async (req, res) => {
  const { storeName, address, city, state, sellers, mechanics } = req.body;
  const userId = req.user._id;
  try {
    const store = new Store({
      userId,
      storeName,
      storeAddress: {
        address,
        city,
        state,
      },
      sellers: sellers && sellers,
      mechanics: mechanics && mechanics,
    });
    await store.save();
    return res
      .status(201)
      .json(ApiResponse(store, "Store added successfully", true));
  } catch (error) {
    return res.status(400).json(ApiResponse({}, error.message, false));
  }
};

exports.addWorker = async (req, res) => {
  const { storeId } = req.params;
  const { sellers = [], mechanics = [] } = req.body;

  try {
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json(ApiResponse({}, "Store not found", false));
    }

    store.sellers.push(...sellers);
    store.mechanics.push(...mechanics);

    await store.save();

    return res
      .status(200)
      .json(ApiResponse(store, "Worker added successfully", true));
  } catch (error) {
    return res.status(400).json(ApiResponse({}, error.message, false));
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
  const {
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
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json(ApiResponse({}, "Store not found", false));
    }

    // Update store details
    if (storeName) store.storeName = storeName;

    store.storeAddress = {
      address: address || store.storeAddress.address,
      city: city || store.storeAddress.city,
      state: state || store.storeAddress.state,
    };

    // Update sellers
    if (oldSellers.length > 0) {
      store.sellers = store.sellers.filter(
        (seller) => !oldSellers.includes(seller._id.toString())
      );
    }
    if (newSellers.length > 0) {
      store.sellers.push(...newSellers);
    }

    // Update mechanics
    if (oldMechanics.length > 0) {
      store.mechanics = store.mechanics.filter(
        (mechanic) => !oldMechanics.includes(mechanic._id.toString())
      );
    }
    if (newMechanics.length > 0) {
      store.mechanics.push(...newMechanics);
    }

    // Save updated store
    await store.save();

    return res
      .status(200)
      .json(ApiResponse(store, "Store updated successfully", true));
  } catch (error) {
    return res.status(400).json(ApiResponse({}, error.message, false));
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
