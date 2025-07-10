const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const Schema = mongoose.Schema;

const accidentSchema = new Schema(
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
    accidentDate: {
      type: Date,
      default: null,
    },
    location: {
      type: String,
      default: "",
    },
    involvedDriverName: {
      type: String,
      default: "",
    },
    involvedDriverPhone: {
      type: String,
      default: "",
    },
    description: {
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

accidentSchema.plugin(mongoosePaginate);
accidentSchema.plugin(aggregatePaginate);
module.exports = mongoose.model("Accident", accidentSchema);
