const { body, validationResult, check } = require("express-validator");
const { ApiResponse } = require("../../helpers");

// Register User Validator
exports.registerValidator = [
  check("email", "Email is Required")
    .not()
    .isEmpty()
    .isEmail()
    .withMessage("Email is Invalid"),
  body("firstName").not().isEmpty().withMessage("First Name is Required"),
  body("lastName").not().isEmpty().withMessage("Last Name is Required"),
  body("password").not().isEmpty().withMessage("Password is Required"),
  body("phone").not().isEmpty().withMessage("Phone is Required"),
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
// Login User Validator
exports.loginValidator = [
  check("email", "Email is Required")
    .not()
    .isEmpty()
    .isEmail()
    .withMessage("Email is Invalid"),
  body("password").not().isEmpty().withMessage("Password is Required"),
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
