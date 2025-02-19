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
      required: true,
    },
    accidentDate: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    involvedDriverName: {
      type: String,
      required: true,
    },
    involvedDriverPhone: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    attachments: {
      type: [String],
    },
  },
  { timestamps: true }
);

accidentSchema.plugin(mongoosePaginate);
accidentSchema.plugin(aggregatePaginate);
module.exports = mongoose.model("Accident", accidentSchema);
