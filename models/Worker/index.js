const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const Schema = mongoose.Schema;

const workerSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["SELLER", "MECHANIC"],
    },
  },
  { timestamps: true }
);

workerSchema.plugin(mongoosePaginate);
workerSchema.plugin(aggregatePaginate);
module.exports = mongoose.model("Worker", workerSchema);
