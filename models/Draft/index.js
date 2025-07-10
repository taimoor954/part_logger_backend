const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const Schema = mongoose.Schema;

const draftSchema = new Schema(
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
    title: {
      type: String,
      trim: true,
      default: "",
    },
    attachments: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

draftSchema.plugin(mongoosePaginate);
draftSchema.plugin(aggregatePaginate);
module.exports = mongoose.model("Draft", draftSchema);
