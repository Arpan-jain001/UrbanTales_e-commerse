import { sendEmail } from "./resendClient.js";

export const sendWelcomeMail = async (email, fullName) => {
  const html = `
    <div style="background:#f7f7f7;padding:30px;font-family:'Segoe UI',sans-serif;">
      <div style="max-width:600px;background:white;margin:0 auto;border-radius:16px;overflow:hidden;box-shadow:0 4px 14px rgba(0,0,0,0.1);">
        <div style="background-color:#070A52;padding:25px;text-align:center;">
          <img src="https://res.cloudinary.com/dhmw4b5wq/image/upload/v1762673652/UrbanTales_korjrm.png" alt="UrbanTales Logo" style="width:120px;margin-bottom:10px;" />
          <h1 style="color:#FFCC00;font-size:22px;margin:0;">Welcome to UrbanTales</h1>
        </div>
        <div style="padding:30px 40px;">
          <h2 style="color:#070A52;margin-bottom:10px;">Hey ${fullName || "there"},</h2>
          <p style="color:#333;font-size:15px;line-height:1.7;">
            Your account has been verified successfully. Welcome to <strong>UrbanTales</strong>.
          </p>
          <div style="background:#f9f9f9;border-left:4px solid #FFCC00;padding:15px 20px;margin:20px 0;border-radius:10px;">
            <p style="margin:0;color:#555;font-size:15px;">
              Explore exclusive collections, track your orders, and enjoy a seamless shopping experience.
            </p>
          </div>
          <div style="text-align:center;margin-top:25px;">
            <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}" style="background-color:#070A52;color:white;padding:12px 25px;border-radius:8px;text-decoration:none;font-weight:bold;">
              Start Shopping
            </a>
          </div>
        </div>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: "Welcome to UrbanTales",
    html,
    fromName: "UrbanTales",
  });
};
