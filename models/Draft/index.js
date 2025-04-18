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
      required: true,
    },
    title: {
      type: String,
      trim: true,
    },
    attachments: {
      type: [String],
    },
  },
  { timestamps: true }
);

draftSchema.plugin(mongoosePaginate);
draftSchema.plugin(aggregatePaginate);
module.exports = mongoose.model("Draft", draftSchema);
