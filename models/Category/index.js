const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const Schema = mongoose.Schema;

const textFields = new Schema(
  {
    label: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["TEXT", "DATE"],
    },
  },
  { _id: true, timestamps: false }
);

const categorySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    fields: {
      type: [textFields],
      required: true,
    },
    hasAttachments: {
      type: Boolean,
      required: true,
    },
  },
  { timestamps: true }
);

categorySchema.plugin(mongoosePaginate);
categorySchema.plugin(aggregatePaginate);
module.exports = mongoose.model("Category", categorySchema);
