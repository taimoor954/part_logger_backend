const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const Schema = mongoose.Schema;

const gasSchema = new Schema(
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
    gasDate: {
      type: Date,
      default: null,
    },
    gallons: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      default: 0,
    },
    carMileage: {
      type: Number,
      default: 0,
    },
    attachments: {
      type: [String],
      default: [],
    },
    description: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

gasSchema.plugin(mongoosePaginate);
gasSchema.plugin(aggregatePaginate);
module.exports = mongoose.model("Gas", gasSchema);
