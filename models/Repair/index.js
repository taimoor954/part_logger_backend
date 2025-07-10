const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const Schema = mongoose.Schema;

const indivdualRepairSchema = new Schema({
  name: {
    type: String,
    default: "",
  },
});

const repairPartDetailsSchema = new Schema(
  {
    repairs: {
      type: [indivdualRepairSchema],
      default: [],
    },
    autoParts: {
      type: [Schema.Types.ObjectId],
      ref: "AutoPart",
      default: [],
    },
    currentCarMileage: {
      type: Number,
      default: 0,
    },
    estimatedRepairCost: {
      type: Number,
      default: 0,
    },
    laborCost: {
      type: Number,
      default: 0,
    },
    repairPartsCost: {
      type: Number,
      default: 0,
    },
    totalRepairCost: {
      type: Number,
      default: 0,
    },
    attachments: {
      type: [String],
      default: [],
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
      default: null,
    },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      default: null,
    },
    mechanicId: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    repairDate: {
      type: Date,
      default: null,
    },
    repairPartDetails: {
      type: repairPartDetailsSchema,
      default: {},
    },
  },
  { timestamps: true }
);

repairSchema.plugin(mongoosePaginate);
repairSchema.plugin(aggregatePaginate);
module.exports = mongoose.model("Repair", repairSchema);
