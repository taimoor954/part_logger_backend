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
      required: true,
    },
    entryDate: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

const vehicleAdditionalDetailsSchema = new Schema(
  {
    engineSize: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    cylinders: {
      type: Number,
      required: true,
    },
    hasTurboCharger: {
      type: Boolean,
      required: true,
    },
    fuel: {
      type: String,
      required: true,
      enum: ["GASOLINE", "DIESEL", "ELECTRIC", "HYBRID", "PROPANE"],
    },
    driveTrain: {
      type: String,
      required: true,
      enum: ["2WD", "4WD", "AWD"],
    },
    transmissionNum: {
      type: Number,
      required: true,
    },
    transmissionType: {
      type: String,
      required: true,
      enum: ["MANUAL", "AUTOMATIC", "SEMI-AUTOMATIC", "CVT"],
    },
    carMilage: {
      type: Number,
      required: true,
    },
    notes: {
      type: String,
      required: false,
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
      type: String,
      required: true,
      enum: ["CAR", "TRUCK", "TRACTOR"],
    },
    vehicleDetails: {
      type: vehicleDetailsSchema,
      required: true,
    },
    additionalDetails: {
      type: vehicleAdditionalDetailsSchema,
      required: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
    images: {
      type: [String],
      required: true,
    },
  },
  { timestamps: true }
);

vehicleSchema.plugin(mongoosePaginate);
vehicleSchema.plugin(aggregatePaginate);
module.exports = mongoose.model("Vehicle", vehicleSchema);
