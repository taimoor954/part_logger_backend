const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const Schema = mongoose.Schema;

const travelSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    from: {
      type: String,
      required: true,
    },
    to: {
      type: String,
      required: true,
    },
    departureDate: {
      type: Date,
      required: true,
    },
    arrivalDate: {
      type: Date,
      required: true,
    },
    flightExpense: {
      type: Number,
      required: true,
    },
    hotelExpense: {
      type: Number,
      required: true,
    },
    mealExpense: {
      type: Number,
      required: true,
    },
    carRentalExpense: {
      type: Number,
    },
    otherExpense: {
      type: Number,
    },
    attachments: {
      type: [String],
    },
  },
  { timestamps: true }
);

travelSchema.plugin(mongoosePaginate);
travelSchema.plugin(aggregatePaginate);
module.exports = mongoose.model("Travel", travelSchema);
