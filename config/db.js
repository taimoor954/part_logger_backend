const mongoose = require("mongoose");
require("dotenv").config();

const { NODE_ENV, DB_LOCAL, DB_CUSTOMDEV, DB_ATLAS } = process.env;
const DB = {
  development: DB_ATLAS,
  // development: DB_LOCAL,
  // development: DB_CUSTOMDEV,
  customdev: DB_ATLAS,
  live: DB_LOCAL,
};

mongoose
  .connect(DB[NODE_ENV])
  .then((res) => {
    console.log(`Connected to Database Successfully `);
  })
  .catch((err) => {
    console.log("Error in Database Connection", err);
  });

module.exports = mongoose;
