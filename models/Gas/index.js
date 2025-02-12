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
      required: true,
    },
    gasDate: {
      type: Date,
      required: true,
    },
    gallons: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    carMileage: {
      type: Number,
      required: true,
    },
    attachments: {
      type: [String],
    },
  },
  { timestamps: true }
);

gasSchema.plugin(mongoosePaginate);
gasSchema.plugin(aggregatePaginate);
module.exports = mongoose.model("Gas", gasSchema);
