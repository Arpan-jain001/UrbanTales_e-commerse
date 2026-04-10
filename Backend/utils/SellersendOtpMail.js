import { sendEmail } from "./resendClient.js";

export async function sendSellerOtpMail({ to, otp }) {
  const html = `
    <div style="font-family:sans-serif;padding:18px;">
      <h2>Your Password Reset OTP: <span style="color:#440077">${otp}</span></h2>
      <p>This OTP is valid for <b>15 minutes</b>. Please do not share it with anyone.</p>
    </div>
  `;

  return sendEmail({
    to,
    subject: "UrbanTales Seller Password Reset OTP",
    html,
    fromName: "UrbanTales Seller Security",
  });
}
