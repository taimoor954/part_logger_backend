var jwt = require("jsonwebtoken");
// const Session = require("../Models/otherModels/Session");s
require("dotenv").config();
const fs = require("fs");
const moment = require("moment");
// Api Response Fixed Pattern
exports.ApiResponse = (data = {}, message = "", status = false) => {
  return {
    status: status,
    message: message,
    data: data,
  };
};
// Generate token for login
exports.generateToken = (user) => {
  const token = jwt.sign(
    {
      _id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isAdmin: user.isAdmin,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
  return token;
};

// Generate Random String
exports.generateString = (length, onlyCaps = false, onlyNumbers = false) => {
  length = length ? length : 8;
  let charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let retVal = "";
  if (onlyCaps) {
    charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  }
  if (onlyNumbers) {
    charset = "1234567890";
  }
  for (let i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
};

// Update Field
exports.updateField = (target, source, fieldName) => {
  if (source[fieldName]) target[fieldName] = source[fieldName];
};

exports.handleFileOperations = (attachments, galleryFiles, deletedImages) => {
  if (galleryFiles?.length) {
    const gallery = galleryFiles.map((image) => image.filename);
    attachments.push(...gallery);
  }

  if (deletedImages) {
    try {
      const imagesToDelete = JSON.parse(deletedImages);
      attachments = attachments.filter(
        (image) => !imagesToDelete.includes(image)
      );

      imagesToDelete.forEach((image) => {
        const filePath = `./Uploads/${image}`;
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`Deleted image: ${filePath}`);
        }
      });
    } catch (err) {
      throw new Error("Invalid deletedImages format");
    }
  }

  return attachments;
};

exports.convertToUTCDate = (date) => moment(date).utc().toDate();
