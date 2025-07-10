const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const Schema = mongoose.Schema;

const vehicleDetailsSchema = new Schema(
  {
    make: {
      type: String,
      required: true,
    },
    model: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    VIN: {
      type: String,
      default: "",
    },
    purchaseDate: {
      type: Date,
      default: null,
    },
    description: {
      type: String,
      required: false,
      default: "",
    },
    warranty: {
      type: String,
      enum: ["NO", "YES"],
    },
  },
  { timestamps: true }
);

const vehicleAdditionalDetailsSchema = new Schema(
  {
    engineSize: {
      type: Number,
    },
    cylinders: {
      type: Number,
    },
    turboCharger: {
      type: Boolean,
      // enum: ["NO", "SUPERCHARGER", "TURBO_CHARGER", "OTHER"],
    },
    fuel: {
      type: String,
      // enum: ["GAS", "DIESEL", "ELECTRIC", "HYBRID", "PROPANE", "OTHER"],
    },
    engineOilType: {
      type: String,
      default: "",
    },
    engineCoolantType: {
      type: String,
      default: "",
    },
    transmissionFluidType: {
      type: String,
      default: "",
    },
    transmissionType: {
      type: String,
      // enum: [
      //   "MANUAL",
      //   "AUTOMATIC",
      //   "SEMI_AUTOMATIC",
      //   "CVT",
      //   "HYBRID",
      //   "ELECTRIC_DRIVE",
      //   "HYDROSTATIC",
      //   "OTHER",
      // ],
    },
    transmissionSpeed: {
      type: String,
    },
    driveTrain: {
      type: String,
      // enum: ["2WD", "4WD", "AWD", "OTHER"],
    },
    tireSize: {
      type: Number,
    },
    tirePressure: {
      type: Number,
    },
    carMilage: {
      type: Number,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const vehicleSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    vehicleType: {
      type: Schema.Types.ObjectId,
      ref: "VehicleType",
      required: true,
    },
    vehicleDetails: {
      type: vehicleDetailsSchema,
      required: true,
    },
    additionalDetails: {
      type: vehicleAdditionalDetailsSchema,
      required: false,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
    gallery: {
      type: [String],
    },
  },
  { timestamps: true }
);

vehicleSchema.plugin(mongoosePaginate);
vehicleSchema.plugin(aggregatePaginate);
module.exports = mongoose.model("Vehicle", vehicleSchema);
