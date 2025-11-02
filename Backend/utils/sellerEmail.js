const nodemailer = require('nodemailer');

exports.sendSellerEmail = async ({ to, subject, html }) => {
  let transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASS,
    }
  });

  await transporter.sendMail({
    from: `"UrbanTales Seller" <${process.env.SMTP_EMAIL}>`,
    to,
    subject,
    html,
  });
};
