const { body, validationResult, check } = require("express-validator");
const { ApiResponse } = require("../../helpers");

exports.codeValidator = [
  check("email", "Email is Required")
    .not()
    .isEmpty()
    .isEmail()
    .withMessage("Email is Invalid"),
  body("type")
    .not()
    .isEmpty()
    .withMessage("Type is Required")
    .isIn(["USER", "ADMIN"])
    .withMessage("Invalid Value for Type"),
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

exports.resetValidator = [
  check("email", "Email is Required")
    .not()
    .isEmpty()
    .isEmail()
    .withMessage("Email is Invalid"),
  body("password").not().isEmpty().withMessage("Password is Required"),
  body("code").not().isEmpty().withMessage("Code is Required"),
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
