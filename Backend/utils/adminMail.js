import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.SENDGRID_API_KEY) {
  console.error("SENDGRID_API_KEY missing in env");
} else {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

/**
 * New admin welcome mail
 */
export async function sendAdminWelcomeMail({
  to,
  fullName,
  username,
  password,
}) {
  const html = `
    <div style="font-family: 'Segoe UI', sans-serif; background:#f5f5f5; padding:24px;">
      <div style="max-width:600px;margin:auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.08);">
        <div style="background:#000;padding:20px;text-align:center;color:#fff;">
          <img src="https://res.cloudinary.com/dhmw4b5wq/image/upload/v1762673652/UrbanTales_korjrm.png"
               alt="UrbanTales" style="width:120px;margin-bottom:8px;" />
          <h2 style="margin:0;font-size:20px;">UrbanTales Admin Access</h2>
        </div>
        <div style="padding:24px 30px;">
          <p style="font-size:15px;color:#333;">Hello <strong>${fullName}</strong>,</p>
          <p style="font-size:14px;color:#444;">
            You have been added as an <strong>Admin</strong> on the <b>UrbanTales</b> platform.
          </p>
          <div style="background:#f9f9f9;border-radius:12px;padding:16px 20px;border-left:4px solid #FFCC00;margin:16px 0;">
            <p style="margin:0;font-size:14px;color:#333;">
              <b>Login Email / Username:</b> ${to} / ${username}<br/>
              <b>Temporary Password:</b> ${password}
            </p>
          </div>
          <p style="font-size:13px;color:#666;">
            Please login and change your password from the profile section as soon as possible.
          </p>
        </div>
        <div style="background:#000;color:#fff;text-align:center;padding:12px;font-size:12px;">
          © ${new Date().getFullYear()} UrbanTales. Admin Panel Access.
        </div>
      </div>
    </div>
  `;

  try {
    await sgMail.send({
      to,
      from: { email: "urbantales4@gmail.com", name: "UrbanTales Admin" },
      subject: "Your UrbanTales Admin Account",
      html,
    });
  } catch (err) {
    console.error(
      "sendAdminWelcomeMail error:",
      err.response?.body || err.message || err
    );
    throw err;
  }
}

/**
 * Reset OTP mail
 */
export async function sendAdminResetOtpMail({ to, otp }) {
  const html = `
    <div style="font-family:sans-serif; padding:18px;">
      <h2>Password Reset OTP</h2>
      <p>Your admin panel OTP is:</p>
      <div style="font-size:32px;font-weight:bold;letter-spacing:0.4rem;color:#FF6600;">${otp}</div>
      <p>This OTP is valid for <b>15 minutes</b>. Do not share it with anyone.</p>
    </div>
  `;

  try {
    await sgMail.send({
      to,
      from: { email: "urbantales4@gmail.com", name: "UrbanTales Admin Security" },
      subject: "UrbanTales Admin Password Reset OTP",
      html,
    });
  } catch (err) {
    console.error(
      "sendAdminResetOtpMail error:",
      err.response?.body || err.message || err
    );
    throw err;
  }
}
