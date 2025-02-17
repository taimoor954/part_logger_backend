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
      required: true,
    },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    mechanicId: {
      type: Schema.Types.ObjectId,
      ref: "Worker",
      required: true,
    },
    autoPartIds: {
      type: [Schema.Types.ObjectId],
      ref: "AutoPart",
    },
    maintenanceDate: {
      type: Date,
      required: true,
    },
    details: {
      type: [String],
      required: true,
    },
    carMileage: {
      type: Number,
      required: true,
    },
    estimatedCost: {
      type: Number,
      required: true,
    },
    laborCost: {
      type: Number,
      required: true,
    },
    partsCost: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    attachments: {
      type: [String],
    },
  },
  { timestamps: true }
);

maintenanceSchema.plugin(mongoosePaginate);
maintenanceSchema.plugin(aggregatePaginate);
module.exports = mongoose.model("Maintenance", maintenanceSchema);
