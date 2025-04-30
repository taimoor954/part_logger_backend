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
    equipmentName: {
      type: String,
      required: true,
      trim: true,
    },
    equipmentType: {
      type: String,
      required: true,
      enum: ["HOME", "HEAVY", "SMALL", "TOOL"],
    },
    purchaseDate: {
      type: Date,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    warranty: {
      type: String,
      enum: ["YES", "NO", "NOT_APPLICABLE"],
    },
    warrantyTime: {
      type: String,
    },
    warrantyExpiration: {
      type: Date,
    },
    attachments: {
      type: [String],
    },
  },
  { timestamps: true }
);

equipmentSchema.plugin(mongoosePaginate);
equipmentSchema.plugin(aggregatePaginate);
module.exports = mongoose.model("Equipment", equipmentSchema);
