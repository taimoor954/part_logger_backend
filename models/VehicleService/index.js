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
      default: null,
    },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      default: null,
    },
    location: {
      type: String,
      default: "",
    },
    serviceDate: {
      type: Date,
      default: null,
    },
    workerId: {
      type: Schema.Types.ObjectId,
      ref: "Worker",
      default: null,
    },
    partName: {
      type: String,
      default: "",
    },
    autoPartIds: {
      type: [Schema.Types.ObjectId],
      ref: "AutoPart",
      default: [],
    },
    description: {
      type: String,
      default: "",
    },
    partBrand: {
      type: String,
      default: "",
    },
    currentMileage: {
      type: Number,
      default: 0,
    },
    condition: {
      type: String,
      enum: ["NEW", "USED"],
      default: "NEW",
    },
    partDescription: [
      {
        partNum: {
          type: String,
          default: "",
        },
        partDesc: {
          type: String,
          default: "",
        },
      },
    ],
    repairPrice: {
      type: Number,
      default: 0,
    },
    partsCost: {
      type: Number,
      default: 0,
    },
    laborCost: {
      type: Number,
      default: 0,
    },
    estimatedMaintenancePrice: {
      type: Number,
      default: 0,
    },
    actualMaintenancePrice: {
      type: Number,
      default: 0,
    },
    totalMaintenanceCost: {
      type: Number,
      default: 0,
    },
    warranty: {
      type: String,
      enum: ["YES", "NO"],
      default: "NO",
    },
    warrantyTime: {
      type: String,
      default: "",
    },
    warrantyExpiration: {
      type: Date,
      default: null,
    },
    warrantyPrice: {
      type: Number,
      default: 0,
    },
    comment: {
      type: String,
      default: "",
    },
    attachments: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

vehicleServiceSchema.plugin(mongoosePaginate);
vehicleServiceSchema.plugin(aggregatePaginate);
module.exports = mongoose.model("VehicleService", vehicleServiceSchema);
