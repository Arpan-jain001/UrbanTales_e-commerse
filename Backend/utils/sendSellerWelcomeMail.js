import { sendEmail } from "./resendClient.js";

export const sendSellerWelcomeMail = async (email, sellerName) => {
  const dashboardUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/seller/dashboard`;
  const html = `
    <div style="font-family:'Segoe UI',Arial,sans-serif;background:#f7f7f7;padding:30px;">
      <div style="max-width:650px;background:white;margin:auto;border-radius:10px;overflow:hidden;box-shadow:0 3px 10px rgba(0,0,0,0.1);">
        <div style="text-align:center;padding:25px 0;background:#000;color:#fff;">
          <img src="https://res.cloudinary.com/dhmw4b5wq/image/upload/v1762673652/UrbanTales_korjrm.png" alt="UrbanTales" style="width:130px;height:auto;margin-bottom:10px;" />
          <h2 style="margin:0;font-weight:600;">Welcome to UrbanTales Sellers</h2>
        </div>
        <div style="padding:30px;">
          <p style="font-size:16px;">Hey <strong>${sellerName}</strong>,</p>
          <p style="font-size:15px;color:#444;">
            Your seller account has been verified successfully. You can now manage your store, products, and orders.
          </p>
          <div style="text-align:center;margin:30px 0;">
            <a href="${dashboardUrl}" style="background:#000;color:white;text-decoration:none;padding:12px 30px;border-radius:8px;font-size:15px;">
              Go to Seller Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `Welcome to UrbanTales Seller Platform, ${sellerName}!`,
    html,
    fromName: "UrbanTales Seller Team",
  });
};
