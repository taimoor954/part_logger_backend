const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const Schema = mongoose.Schema;

const feedbackSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    subject: {
      type: String,
      default: "",
    },
    message: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

feedbackSchema.plugin(mongoosePaginate);
feedbackSchema.plugin(aggregatePaginate);
module.exports = mongoose.model("Feedback", feedbackSchema);
