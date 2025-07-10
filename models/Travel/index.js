const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const Schema = mongoose.Schema;

const flightInfoSchema = new Schema(
  {
    from: {
      type: String,
      default: "",
    },
    to: {
      type: String,
      default: "",
    },
    departureDate: {
      type: Date,
      default: null,
    },
    arrivalDate: {
      type: Date,
      default: null,
    },
  },
  { _id: false, timestamps: false }
);

const travelSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    flightInfo: {
      type: [flightInfoSchema],
      default: [],
    },
    flightExpense: {
      type: Number,
      default: 0,
    },
    hotelExpense: {
      type: Number,
      default: 0,
    },
    mealExpense: {
      type: Number,
      default: 0,
    },
    carRentalExpense: {
      type: Number,
      default: 0,
    },
    otherExpense: {
      type: Number,
      default: 0,
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

travelSchema.plugin(mongoosePaginate);
travelSchema.plugin(aggregatePaginate);
module.exports = mongoose.model("Travel", travelSchema);
