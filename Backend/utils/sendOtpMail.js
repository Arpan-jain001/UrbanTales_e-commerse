import { sendEmail } from "./resendClient.js";

export const sendResetPasswordOTP = async (email, otp) => {
  const html = `
    <div style="background:#fff;border:2px solid #FFCC00;padding:1.5rem 2.5rem;border-radius:18px;max-width:400px;margin:2rem auto;">
      <img src="https://res.cloudinary.com/dhmw4b5wq/image/upload/v1762673652/UrbanTales_korjrm.png" alt="UrbanTales Logo" style="width:140px;margin-bottom:14px;"/>
      <h2 style="color:#070A52;">Password Reset Request</h2>
      <div style="font-size:16px;margin:1rem 0;">Your OTP is:</div>
      <div style="font-size:36px;font-weight:bold;letter-spacing:0.6rem;color:#FFCC00;margin:8px 0 18px;font-family:monospace;">${otp}</div>
      <div style="font-size:14px;">This OTP is valid for <b>2 minutes</b> only.</div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: "UrbanTales Reset Password OTP",
    html,
    fromName: "UrbanTales Security",
  });
};
