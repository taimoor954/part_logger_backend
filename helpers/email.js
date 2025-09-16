const nodemailer = require("nodemailer");
require("dotenv").config();

var smtpConfig = {
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
  tls: { rejectUnauthorized: false },
};

module.exports = {
  generateEmail: async (email, subject, html) => {
    try {
      const transporter = nodemailer.createTransport(smtpConfig);
      const mailOptions = {
        to: email,
        subject,
        text: "",
        html,
      };
      transporter.sendMail(mailOptions);
      return true;
    } catch (err) {
      console.log("error in generating email: ", err);
      return false;
    }
  },
};
