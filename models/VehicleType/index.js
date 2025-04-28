const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const Schema = mongoose.Schema;

const vehicleTypeSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "VehicleType",
      required: false,
    },
    image: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

vehicleTypeSchema.plugin(mongoosePaginate);
vehicleTypeSchema.plugin(aggregatePaginate);
module.exports = mongoose.model("VehicleType", vehicleTypeSchema);
