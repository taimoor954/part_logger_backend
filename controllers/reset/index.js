const { generateString, ApiResponse } = require("../../helpers");
const {
  createResetToken,
  validateResetToken,
} = require("../../helpers/verification");
const { generateEmail } = require("../../helpers/email");
const User = require("../../models/User");
const Reset = require("../../models/Reset");
const bcrypt = require("bcrypt");

// Send Verification Code Controller
exports.emailVerificationCode = async (req, res) => {
  try {
    const { email, type } = req.body;
    let user;
    switch (type) {
      case "USER":
      case "ADMIN": {
        user = await User.findOne({ email });
        break;
      }
      default: {
        return res
          .status(400)
          .json(ApiResponse({}, "Invalid user type", false));
      }
    }
    if (!user) {
      return res
        .status(404)
        .json(ApiResponse({}, "No User Found with this email", false));
    }
    let verificationCode = generateString(4, false, true);
    createResetToken(email, verificationCode, type);
    const encoded = Buffer.from(
      JSON.stringify({ email, code: verificationCode }),
      "ascii"
    ).toString("base64");
    const html = `
                  <div>
                    <p>
                      You are receiving this because you (or someone else) have requested the reset of the
                      password for your account.
                    </p>
                    <p>Your verification code is ${verificationCode}</p>            
                    <p>
                      <strong>
                        If you did not request this, please ignore this email and your password will remain
                        unchanged.
                      </strong>
                    </p>
                  </div>
      `;
    await generateEmail(email, "Parts Logger - Password Reset", html);
    res
      .status(201)
      .json(
        ApiResponse(
          encoded,
          "A verification code has been sent to your registered email to reset your password.",
          true
        )
      );
  } catch (error) {
    console.log(error);
    res.status(500).json(ApiResponse({}, error.message, false));
  }
};

// Verify code Controller
exports.verifyRecoverCode = async (req, res) => {
  const { email, code } = req.body;
  try {
    if (!email) {
      return res.status(400).json(ApiResponse({}, "Email is Required", false));
    }
    if (!code) {
      return res
        .status(400)
        .json(ApiResponse({}, "Verification Code is Required", false));
    }
    let isValid = await validateResetToken(email, code);
    if (!isValid) {
      return res
        .status(400)
        .json(ApiResponse({}, "Invalid Verification Code", false));
    }
    res.status(200).json(ApiResponse({}, "Verification Code Verified", true));
  } catch (error) {
    console.log(error);
    res.status(500).json(ApiResponse({}, error.message, false));
  }
};

// Reset Password Controller
exports.resetPassword = async (req, res) => {
  const { email, code, password } = req.body;
  try {
    let isValid = await validateResetToken(email, code);
    if (!isValid) {
      return res
        .status(400)
        .json(ApiResponse({}, "Invalid Verification Code", false));
    }
    let user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json(ApiResponse({}, "No User Found with this email", false));
    }
    await Reset.deleteOne({ email, code });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user.password = hashedPassword;
    await user.save();
    res
      .status(200)
      .json(ApiResponse({}, "Password Updated Successfully", true));
  } catch (error) {
    console.log(error);
    res.status(500).json(ApiResponse({}, error.message, false));
  }
};

// Change Password Controller
exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword, type } = req.body;
  const userId = req.user._id;
  try {
    let user;
    switch (type) {
      case "USER":
      case "ADMIN": {
        user = await User.findById(userId);
        break;
      }
      default: {
        return res
          .status(400)
          .json(ApiResponse({}, "Invalid user type", false));
      }
    }
    if (!user) {
      return res
        .status(404)
        .json(ApiResponse({}, "No User Found with this email", false));
    }
    const compare = await bcrypt.compare(oldPassword, user.password);
    if (!compare) {
      return res
        .status(401)
        .json(ApiResponse({}, "Wrong Old Password Entered", false));
    }
    const isChanged = await bcrypt.compare(newPassword, user.password);
    if (isChanged) {
      return res
        .status(500)
        .json(
          ApiResponse(
            {},
            "New Password cannot be the same as the old password",
            false
          )
        );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    await user.save();
    res
      .status(200)
      .json(ApiResponse({}, "Password Updated Successfully", true));
  } catch (error) {
    console.log(error);
    res.status(500).json(ApiResponse({}, error.message, false));
  }
};
