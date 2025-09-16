const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const Schema = mongoose.Schema;

const equipmentSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    storeId: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      default: null,
    },
    equipmentName: {
      type: String,
      default: "",
      trim: true,
    },
    equipmentType: {
      type: String,
      enum: ["HOME", "HEAVY", "SMALL", "TOOL"],
      default: "HOME",
    },
    purchaseDate: {
      type: Date,
      default: null,
    },
    price: {
      type: Number,
      default: 0,
    },
    warranty: {
      type: String,
      enum: ["YES", "NO"],
      default: "NO",
    },
    warrantyTime: {
      type: String,
      default: "",
    },
    warrantyExpiration: {
      type: Date,
      default: null,
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

equipmentSchema.plugin(mongoosePaginate);
equipmentSchema.plugin(aggregatePaginate);
module.exports = mongoose.model("Equipment", equipmentSchema);
