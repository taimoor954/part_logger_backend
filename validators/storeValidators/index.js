const { body, validationResult, check } = require("express-validator");
const { ApiResponse } = require("../../helpers");

exports.addStoreValidator = [
  body("storeName").not().isEmpty().withMessage("Store Name is Required"),
  body("address").not().isEmpty().withMessage("Address is Required"),
  body("city").not().isEmpty().withMessage("City is Required"),
  body("state").not().isEmpty().withMessage("State is Required"),
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json(ApiResponse({}, errors.array()[0].msg, false));
    }
    next();
  },
];
