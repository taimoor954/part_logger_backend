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
      default: "",
    },
    breed: {
      type: String,
      default: "",
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    purchaseDate: {
      type: Date,
      default: null,
    },
    description: {
      type: String,
      default: "",
    },
    name: {
      type: String,
      default: "",
    },
    veterinarianName: {
      type: String,
      default: "",
    },
    veterinarianPhone: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      default: 0,
    },
    attachments: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

petSchema.plugin(mongoosePaginate);
petSchema.plugin(aggregatePaginate);
module.exports = mongoose.model("Pet", petSchema);
