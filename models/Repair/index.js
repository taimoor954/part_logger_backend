const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const Schema = mongoose.Schema;

const repairPartDetailsSchema = new Schema(
  {
    repairs: {
      type: [String],
      required: true,
    },
    autoParts: {
      type: [Schema.Types.ObjectId],
      ref: "AutoPart",
      default: [],
    },
    currentCarMileage: {
      type: Number,
      required: true,
    },
    estimatedRepairCost: {
      type: Number,
      required: true,
    },
    laborCost: {
      type: Number,
      required: true,
    },
    repairPartsCost: {
      type: Number,
      required: true,
    },
    totalRepairCost: {
      type: Number,
      required: true,
    },
    attachments: {
      type: [String],
    },
  },
  { timestamps: true }
);

const repairSchema = new Schema(
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
    mechanicId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    repairDate: {
      type: Date,
      required: true,
    },
    repairPartDetails: {
      type: repairPartDetailsSchema,
      required: true,
    },
  },
  { timestamps: true }
);

repairSchema.plugin(mongoosePaginate);
repairSchema.plugin(aggregatePaginate);
module.exports = mongoose.model("Repair", repairSchema);
