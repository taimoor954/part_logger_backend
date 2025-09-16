const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const Schema = mongoose.Schema;

const partDetailsSchema = new Schema({
  partName: {
    type: String,
    default: "",
  },
  brand: {
    type: String,
    default: "",
  },
  price: {
    type: Number,
    default: 0,
  },
  currentCarMileage: {
    type: Number,
    default: 0,
  },
  condition: {
    type: String,
    default: "",
  },
  partNumber: {
    type: String,
    default: "",
  },
  warrantyManufacture: {
    type: Number, // in months
    default: 0,
  },
  extendedWarranty: {
    type: Number, // in years
    default: 0,
  },
  extendedWarrantyPrice: {
    type: Number,
    default: 0,
  },
  receiptNum: {
    type: String,
    default: "",
  },
  attachments: {
    type: [String],
    default: [],
  },
});

const autoPartSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    vehicleId: {
      type: Schema.Types.ObjectId,
      ref: "Vehicle",
      default: null,
    },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      default: null,
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    buyingDate: {
      type: Date,
      default: null,
    },
    partDetails: {
      type: partDetailsSchema,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

autoPartSchema.plugin(mongoosePaginate);
autoPartSchema.plugin(aggregatePaginate);
module.exports = mongoose.model("AutoPart", autoPartSchema);
