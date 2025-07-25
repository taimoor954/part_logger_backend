const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const Schema = mongoose.Schema;

const subscriptionSchema = new Schema(
  {
    planName: {
      type: String,
      required: true,
    },
    planType: {
      type: String,
      enum: ["MONTHLY", "YEARLY", "TRIAL"],
      required: true,
    },
    planCharges: {
      type: Number,
      required: true,
    },
    vehicleLimit: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
  }
);

subscriptionSchema.plugin(mongoosePaginate);
subscriptionSchema.plugin(aggregatePaginate);
module.exports = mongoose.model("Subscription", subscriptionSchema);
