const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const Schema = mongoose.Schema;

const resetSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    code: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["USER", "ADMIN"],
    },
  },
  { timestamps: true }
);
resetSchema.plugin(mongoosePaginate);
resetSchema.plugin(aggregatePaginate);
module.exports = mongoose.model("Reset", resetSchema);
