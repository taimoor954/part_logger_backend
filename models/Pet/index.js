const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const Schema = mongoose.Schema;

const petSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    specie: {
      type: String,
      required: true,
    },
    breed: {
      type: String,
      required: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    purchaseDate: {
      type: Date,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    attachments: {
      type: [String],
    },
  },
  { timestamps: true }
);

petSchema.plugin(mongoosePaginate);
petSchema.plugin(aggregatePaginate);
module.exports = mongoose.model("Pet", petSchema);
