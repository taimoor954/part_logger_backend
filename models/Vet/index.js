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
      required: true,
    },
    checkupDate: {
      type: Date,
      required: true,
    },
    payment: {
      type: Number,
      required: true,
    },
    otherExpense: {
      type: Number,
    },
    details: {
      type: String,
    },
    attachments: {
      type: [String],
    },
  },
  { timestamps: true }
);

vetSchema.plugin(mongoosePaginate);
vetSchema.plugin(aggregatePaginate);
module.exports = mongoose.model("Vet", vetSchema);
