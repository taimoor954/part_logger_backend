const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const Schema = mongoose.Schema;

const recordSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    data: [
      {
        fieldId: { type: mongoose.Schema.Types.ObjectId, required: true },
        value: { type: mongoose.Schema.Types.Mixed, required: true },
      },
    ],
    attachments: {
      type: [String],
    },
  },
  { timestamps: true }
);

recordSchema.plugin(mongoosePaginate);
recordSchema.plugin(aggregatePaginate);
module.exports = mongoose.model("Record", recordSchema);
