const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const Schema = mongoose.Schema;

const addressSchema = new Schema({
  address: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
});

const workerSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const storeSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    storeName: {
      type: String,
      required: true,
      trim: true,
    },
    storeAddress: {
      type: addressSchema,
      required: true,
    },
    sellers: {
      type: [workerSchema],
      required: false,
      default: [],
    },
    mechanics: {
      type: [workerSchema],
      required: false,
      default: [],
    },
  },
  { timestamps: true }
);

storeSchema.plugin(mongoosePaginate);
storeSchema.plugin(aggregatePaginate);
module.exports = mongoose.model("Store", storeSchema);
