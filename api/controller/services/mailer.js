const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for TLS (587)
  auth: {
    user: "poojakitchenware68@gmail.com", // your email
    pass: "rzdc cdff nbym iarj", // your App Password
  },
});

module.exports = transporter;
