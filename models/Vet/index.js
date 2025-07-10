const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const Schema = mongoose.Schema;

const vetSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    petId: {
      type: Schema.Types.ObjectId,
      ref: "Pet",
      default: null,
    },
    checkupDate: {
      type: Date,
      default: null,
    },
    payment: {
      type: Number,
      default: 0,
    },
    otherExpense: {
      type: Number,
      default: 0,
    },
    details: {
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

vetSchema.plugin(mongoosePaginate);
vetSchema.plugin(aggregatePaginate);
module.exports = mongoose.model("Vet", vetSchema);
