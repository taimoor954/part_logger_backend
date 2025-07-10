const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const Schema = mongoose.Schema;

const maintenanceSchema = new Schema(
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
      ref: "Worker",
      default: null,
    },
    autoPartIds: {
      type: [Schema.Types.ObjectId],
      ref: "AutoPart",
      default: [],
    },
    maintenanceDate: {
      type: Date,
      default: null,
    },
    details: {
      type: [String],
      default: [],
    },
    carMileage: {
      type: Number,
      default: 0,
    },
    estimatedCost: {
      type: Number,
      default: 0,
    },
    laborCost: {
      type: Number,
      default: 0,
    },
    partsCost: {
      type: Number,
      default: 0,
    },
    totalPrice: {
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

maintenanceSchema.plugin(mongoosePaginate);
maintenanceSchema.plugin(aggregatePaginate);
module.exports = mongoose.model("Maintenance", maintenanceSchema);
