const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const Schema = mongoose.Schema;

const partDetailsSchema = new Schema({
  partName: {
    type: String,
    required: true,
  },
  brand: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  currentCarMileage: {
    type: Number,
    required: true,
  },
  condition: {
    type: String,
  },
  partNumber: {
    type: String,
  },
  warrantyManufacture: {
    type: Number, // in months
  },
  extendedWarranty: {
    type: Number, // in years
  },
  extendedWarrantyPrice: {
    type: Number,
  },
  receiptNum: {
    type: String,
  },
  attachments: {
    type: [String],
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
      required: true,
    },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    buyingDate: {
      type: Date,
      required: true,
    },
    partDetails: {
      type: partDetailsSchema,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

autoPartSchema.plugin(mongoosePaginate);
autoPartSchema.plugin(aggregatePaginate);
module.exports = mongoose.model("AutoPart", autoPartSchema);
