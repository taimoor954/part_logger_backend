const Reset = require("../models/Reset");

exports.createResetToken = async (email, code, type) => {
  const token = await Reset.findOne({ email });
  if (token) {
    await Reset.deleteOne({ email });
  }
  const newToken = await Reset({
    email,
    code,
    type,
  });
  await newToken.save();
};

exports.validateResetToken = async (email, code) => {
  const token = await Reset.findOne({ email, code });
  if (!token) {
    return false;
  }
  return true;
};
