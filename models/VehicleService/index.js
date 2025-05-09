const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const Schema = mongoose.Schema;

const vehicleServiceSchema = new Schema(
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
    serviceDate: {
      type: Date,
      required: true,
    },
    workerId: {
      type: Schema.Types.ObjectId,
      ref: "Worker",
      required: true,
    },
    partRepaired: {
      type: String,
    },
    description: {
      type: String,
    },
    partBrand: {
      type: String,
    },
    currentMileage: {
      type: Number,
    },
    condition: {
      type: String,
      enum: ["NEW", "USED"],
    },
    partDescription: [
      {
        partNum: {
          type: String,
        },

        partDesc: {
          type: String,
        },
      },
    ],
    repairPrice: {
      type: Number,
    },
    partsCost: {
      type: Number,
    },
    laborCost: {
      type: Number,
    },
    warranty: {
      type: String,
      enum: ["YES", "NO", "NOT APPLICABLE"],
    },
    warrantyPrice: {
      type: Number,
    },
    comment: {
      type: String,
    },
    attachments: {
      type: [String],
    },
  },
  { timestamps: true }
);

vehicleServiceSchema.plugin(mongoosePaginate);
vehicleServiceSchema.plugin(aggregatePaginate);
module.exports = mongoose.model("VehicleService", vehicleServiceSchema);
