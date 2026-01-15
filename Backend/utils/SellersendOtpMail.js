// Backend/utils/sendSellerOtpMail.js

import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";
dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendSellerOtpMail({ to, otp }) {
  const html = `
    <div style="font-family:sans-serif; padding:18px;">
      <h2>Your Password Reset OTP: <span style="color:#440077">${otp}</span></h2>
      <p>This OTP is valid for <b>2 minutes</b>. Please do not share it with anyone.</p>
    </div>
  `;

  await sgMail.send({
    to,
    from: {
      email: "urbantales.team@gmail.com", // SendGrid par verified sender email (custom/no-reply bhi ho sakta hai)
      name: "UrbanTales Seller"
    },
    subject: "UrbanTales Seller Password Reset OTP",
    html,
  });
}
