import nodemailer from "nodemailer";

export async function sendSellerOtpMail({ to, otp }) {
  let transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASS,
    },
  });

  const html = `
    <div style="font-family:sans-serif; padding:18px;">
      <h2>Your Password Reset OTP: <span style="color:#440077">${otp}</span></h2>
      <p>This OTP is valid for <b>2 minutes</b>. Please do not share it with anyone.</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"UrbanTales Seller" <${process.env.SMTP_EMAIL}>`,
    to,
    subject: "UrbanTales Seller Password Reset OTP",
    html,
  });
}
