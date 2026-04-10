import dotenv from "dotenv";
import { sendEmail } from "./resendClient.js";

dotenv.config();

// Email sender configuration
const FROM_EMAIL = process.env.EMAIL_FROM || "no-reply@urbantales-ecommerce.in";
const FROM_NAME = "Urbantales-admin";

/**
 * Helper function to send email with retry logic
 */
async function sendEmailWithRetry(mailOptions, retries = 2) {
  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      await sendEmail({
        to: mailOptions.to,
        subject: mailOptions.subject,
        html: mailOptions.html,
        text: mailOptions.text,
        fromName: FROM_NAME,
      });
      return { success: true };
    } catch (error) {
      console.error(
        `❌ Email send attempt ${attempt} failed:`,
        error.response?.body?.errors || error.message
      );

      // If this was the last attempt, throw the error
      if (attempt === retries + 1) {
        throw error;
      }

      // Wait before retrying (exponential backoff)
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }
}

/**
 * New admin welcome mail
 * Sends credentials to newly created admin
 */
export async function sendAdminWelcomeMail({
  to,
  fullName,
  username,
  password,
}) {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>UrbanTales Admin Access</title>
    </head>
    <body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
      <div style="background:#f5f5f5;padding:40px 20px;">
        <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background:linear-gradient(135deg, #000000 0%, #1a1a1a 100%);padding:30px 20px;text-align:center;">
            <img src="https://res.cloudinary.com/dhmw4b5wq/image/upload/v1762673652/UrbanTales_korjrm.png"
                 alt="UrbanTales Logo" 
                 style="width:120px;height:auto;margin-bottom:15px;display:inline-block;" />
            <h1 style="margin:0;font-size:24px;color:#ffffff;font-weight:700;letter-spacing:0.5px;">
              Admin Access Granted
            </h1>
            <p style="margin:8px 0 0 0;font-size:14px;color:#cccccc;">
              Welcome to UrbanTales Admin Portal
            </p>
          </div>

          <!-- Content -->
          <div style="padding:40px 30px;">
            <p style="font-size:16px;color:#333333;margin:0 0 10px 0;">
              Hello <strong style="color:#000000;">${fullName}</strong>,
            </p>
            
            <p style="font-size:14px;color:#666666;line-height:1.6;margin:0 0 25px 0;">
              You have been successfully added as an <strong>Admin</strong> on the <strong>UrbanTales</strong> platform. 
              You now have access to the admin panel to manage the platform.
            </p>

            <!-- Credentials Box -->
            <div style="background:linear-gradient(135deg, #fff9e6 0%, #fff3cc 100%);border-radius:12px;padding:20px;margin:25px 0;border-left:5px solid #FFCC00;">
              <p style="margin:0 0 15px 0;font-size:15px;color:#333333;font-weight:600;">
                🔐 Your Login Credentials
              </p>
              <table style="width:100%;border-collapse:collapse;">
                <tr>
                  <td style="padding:8px 0;color:#666666;font-size:14px;width:140px;">
                    <strong>Email:</strong>
                  </td>
                  <td style="padding:8px 0;color:#000000;font-size:14px;font-weight:600;">
                    ${to}
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#666666;font-size:14px;">
                    <strong>Username:</strong>
                  </td>
                  <td style="padding:8px 0;color:#000000;font-size:14px;font-weight:600;">
                    ${username}
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;color:#666666;font-size:14px;">
                    <strong>Temporary Password:</strong>
                  </td>
                  <td style="padding:8px 0;color:#d32f2f;font-size:16px;font-weight:700;letter-spacing:1px;">
                    ${password}
                  </td>
                </tr>
              </table>
            </div>

            <!-- Important Notice -->
            <div style="background:#fff3cd;border-left:4px solid #ffc107;border-radius:8px;padding:15px;margin:20px 0;">
              <p style="margin:0;font-size:13px;color:#856404;line-height:1.6;">
                <strong>⚠️ Important:</strong> This is a temporary password. Please login and change your password 
                immediately from the profile section for security purposes.
              </p>
            </div>

            <!-- Action Button -->
            <div style="text-align:center;margin:30px 0 25px 0;">
              <a href="https://urbantales.netlify.app/admin/login" 
                 style="display:inline-block;background:linear-gradient(135deg, #FFCC00 0%, #FFA500 100%);color:#000000;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:700;font-size:15px;box-shadow:0 4px 12px rgba(255,204,0,0.3);">
                Login to Admin Panel
              </a>
            </div>

            <!-- Security Tips -->
            <div style="background:#f8f9fa;border-radius:8px;padding:18px;margin:25px 0 0 0;">
              <p style="margin:0 0 12px 0;font-size:14px;color:#333333;font-weight:600;">
                🛡️ Security Tips:
              </p>
              <ul style="margin:0;padding-left:20px;color:#666666;font-size:13px;line-height:1.8;">
                <li>Change your password immediately after first login</li>
                <li>Use a strong password with letters, numbers, and symbols</li>
                <li>Never share your credentials with anyone</li>
                <li>Enable two-factor authentication if available</li>
              </ul>
            </div>

            <p style="font-size:12px;color:#999999;margin:25px 0 0 0;line-height:1.6;">
              If you did not expect this email or believe it was sent to you by mistake, please contact 
              our support team immediately at <a href="mailto:${FROM_EMAIL}" style="color:#FFCC00;text-decoration:none;">${FROM_EMAIL}</a>.
            </p>
          </div>

          <!-- Footer -->
          <div style="background:#000000;color:#ffffff;text-align:center;padding:20px;">
            <p style="margin:0 0 8px 0;font-size:14px;font-weight:600;">
              UrbanTales Admin Portal
            </p>
            <p style="margin:0;font-size:12px;color:#cccccc;">
              © ${new Date().getFullYear()} UrbanTales. All rights reserved.
            </p>
            <p style="margin:8px 0 0 0;font-size:11px;color:#999999;">
              This is an automated email. Please do not reply.
            </p>
          </div>

        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    to,
    from: { email: FROM_EMAIL, name: `${FROM_NAME} Admin` },
    subject: "🎉 Your UrbanTales Admin Account - Credentials Inside",
    html,
    text: `Hello ${fullName},\n\nYou have been added as an Admin on UrbanTales.\n\nLogin Credentials:\nEmail/Username: ${to} / ${username}\nTemporary Password: ${password}\n\nLogin at: https://urbantales.netlify.app/admin/login\n\nPlease login and change your password immediately.\n\n© ${new Date().getFullYear()} UrbanTales`,
  };

  try {
    console.log(`🚀 Attempting to send welcome email to: ${to}`);
    await sendEmailWithRetry(mailOptions);
    console.log(`✅ Welcome email sent successfully to ${to}`);
  } catch (err) {
    console.error(
      `❌ sendAdminWelcomeMail final error for ${to}:`,
      err.response?.body || err.message
    );

    // Log credentials for manual sharing
    console.log(`\n📧 ========== EMAIL FAILED - MANUAL CREDENTIALS ==========`);
    console.log(`Recipient: ${to}`);
    console.log(`Full Name: ${fullName}`);
    console.log(`Username: ${username}`);
    console.log(`Password: ${password}`);
    console.log(`========== SHARE THESE CREDENTIALS MANUALLY ==========\n`);

    throw err;
  }
}


/**
 * Admin password reset OTP email
 * Sends 6-digit OTP for password reset
 */
export async function sendAdminResetOtpMail({ to, otp }) {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset OTP</title>
    </head>
    <body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background:#f5f5f5;">
      <div style="background:#f5f5f5;padding:40px 20px;">
        <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <div style="background:linear-gradient(135deg, #0f172a 0%, #1e293b 100%);padding:40px 30px;text-align:center;">
            <img src="https://res.cloudinary.com/dhmw4b5wq/image/upload/v1762673652/UrbanTales_korjrm.png"
                 alt="UrbanTales Logo" 
                 style="width:120px;height:auto;display:block;margin:0 auto 20px auto;" />
            <h1 style="margin:0;font-size:26px;color:#ffffff;font-weight:700;">
              Password Reset OTP
            </h1>
            <p style="margin:10px 0 0 0;font-size:14px;color:rgba(255,255,255,0.85);">
              UrbanTales Admin Security
            </p>
          </div>

          <!-- Content -->
          <div style="padding:40px 35px;text-align:center;">
            
            <p style="font-size:16px;color:#334155;margin:0 0 30px 0;line-height:1.6;">
              We received a request to reset your admin panel password.<br>
              Use the OTP below to proceed:
            </p>

            <!-- OTP Display (Mobile Optimized) -->
            <div style="background:linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);border-radius:12px;padding:30px 20px;margin:0 0 30px 0;border:2px solid #cbd5e1;">
              <p style="margin:0 0 12px 0;font-size:12px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:1px;">
                Your OTP Code
              </p>
              <div style="font-size:28px;font-weight:bold;letter-spacing:8px;color:#0f172a;font-family:'Courier New',monospace;">
                ${otp}
              </div>
              <p style="margin:12px 0 0 0;font-size:12px;color:#64748b;">
                ⏱️ Valid for <strong>15 minutes</strong>
              </p>
            </div>

            <!-- Warning -->
            <div style="background:#fef3c7;border-left:4px solid #f59e0b;border-radius:8px;padding:16px;margin-bottom:25px;text-align:left;">
              <p style="margin:0;font-size:13px;color:#92400e;line-height:1.7;">
                <strong>⚠️ Important:</strong> Do not share this code with anyone. UrbanTales staff will never ask for your OTP.
              </p>
            </div>

            <p style="font-size:13px;color:#9ca3af;margin:0;line-height:1.6;">
              If you didn't request this, please ignore this email or contact 
              <a href="mailto:${FROM_EMAIL}" style="color:#0f172a;text-decoration:none;font-weight:600;">support</a>.
            </p>

          </div>

          <!-- Footer -->
          <div style="background:#f8fafc;color:#64748b;text-align:center;padding:25px;border-top:1px solid #e2e8f0;">
            <p style="margin:0 0 5px 0;font-size:13px;font-weight:600;color:#334155;">
              UrbanTales Admin Security
            </p>
            <p style="margin:0;font-size:12px;">
              © ${new Date().getFullYear()} UrbanTales. All rights reserved.
            </p>
          </div>

        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    to,
    from: { email: FROM_EMAIL, name: `${FROM_NAME} Security` },
    subject: "🔐 UrbanTales Admin Password Reset OTP",
    html,
    text: `Password Reset OTP\n\nYour OTP: ${otp}\n\nThis OTP is valid for 15 minutes. Do not share it with anyone.\n\n© ${new Date().getFullYear()} UrbanTales`,
  };

  try {
    console.log(`🚀 Attempting to send OTP email to: ${to}`);
    await sendEmailWithRetry(mailOptions);
    console.log(`✅ OTP email sent successfully to ${to}`);
  } catch (err) {
    console.error(
      `❌ sendAdminResetOtpMail error for ${to}:`,
      err.response?.body || err.message
    );

    console.log(`\n📧 ========== OTP EMAIL FAILED ==========`);
    console.log(`Recipient: ${to}`);
    console.log(`OTP Code: ${otp}`);
    console.log(`Valid for: 15 minutes`);
    console.log(`========== SHARE THIS OTP MANUALLY ==========\n`);

    throw err;
  }
}


/**
 * Admin removal notification email
 * Notifies admin when their account is permanently removed
 */
export async function sendAdminRemovalMail({
  to,
  fullName,
  username,
  reason,
  removedBy,
}) {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Admin Access Revoked</title>
    </head>
    <body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
      <div style="background:linear-gradient(135deg, #1e293b 0%, #0f172a 100%);padding:40px 20px;">
        <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.3);">
          
          <!-- Header -->
          <div style="background:linear-gradient(135deg, #dc2626 0%, #991b1b 100%);padding:50px 30px 40px 30px;text-align:center;">
            <img src="https://res.cloudinary.com/dhmw4b5wq/image/upload/v1762673652/UrbanTales_korjrm.png"
                 alt="UrbanTales Logo" 
                 style="width:140px;height:auto;display:block;margin:0 auto 25px auto;" />
            <h1 style="margin:0 0 12px 0;font-size:32px;color:#ffffff;font-weight:700;letter-spacing:0.5px;">
              Admin Access Revoked
            </h1>
            <p style="margin:0;font-size:16px;color:rgba(255,255,255,0.9);font-weight:500;">
              Your UrbanTales admin account has been removed
            </p>
            <div style="width:80px;height:3px;background:rgba(255,255,255,0.3);margin:25px auto 0 auto;border-radius:2px;"></div>
          </div>

          <!-- Content -->
          <div style="padding:45px 35px;">
            
            <!-- Alert Box -->
            <div style="background:#fff5f5;border:2px solid #feb2b2;border-radius:12px;padding:20px;margin-bottom:30px;">
              <div style="display:flex;align-items:flex-start;gap:12px;">
                <div style="flex-shrink:0;width:24px;height:24px;background:#dc2626;border-radius:50%;display:flex;align-items:center;justify-content:center;margin-top:2px;">
                  <span style="color:#ffffff;font-size:16px;font-weight:bold;line-height:1;">!</span>
                </div>
                <div style="flex:1;">
                  <p style="margin:0 0 8px 0;font-size:16px;color:#b71c1c;font-weight:700;">
                    Important Notice
                  </p>
                  <p style="margin:0;font-size:14px;color:#dc2626;line-height:1.7;">
                    Your admin access to the UrbanTales platform has been <strong>permanently revoked</strong>. 
                    You can no longer log in to the admin panel or access any administrative features.
                  </p>
                </div>
              </div>
            </div>

            <!-- Greeting -->
            <p style="font-size:17px;color:#1f2937;margin:0 0 12px 0;font-weight:600;">
              Hello <span style="color:#dc2626;">${fullName}</span>,
            </p>
            
            <p style="font-size:15px;color:#4b5563;line-height:1.8;margin:0 0 30px 0;">
              We are writing to inform you that your admin account on <strong>UrbanTales</strong> 
              has been removed from the system effective immediately.
            </p>

            <!-- Account Details Card -->
            <div style="background:linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);border-radius:14px;padding:28px;margin-bottom:28px;border:1px solid #e2e8f0;">
              <p style="margin:0 0 18px 0;font-size:13px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:1px;">
                📋 Account Details
              </p>
              <table style="width:100%;border-collapse:collapse;">
                <tr>
                  <td style="padding:12px 0;color:#64748b;font-size:14px;width:130px;vertical-align:top;">
                    Email
                  </td>
                  <td style="padding:12px 0;color:#0f172a;font-size:14px;font-weight:600;">
                    ${to}
                  </td>
                </tr>
                <tr style="border-top:1px solid #e2e8f0;">
                  <td style="padding:12px 0;color:#64748b;font-size:14px;vertical-align:top;">
                    Username
                  </td>
                  <td style="padding:12px 0;color:#0f172a;font-size:14px;font-weight:600;">
                    ${username}
                  </td>
                </tr>
                <tr style="border-top:1px solid #e2e8f0;">
                  <td style="padding:12px 0;color:#64748b;font-size:14px;vertical-align:top;">
                    Removed By
                  </td>
                  <td style="padding:12px 0;color:#0f172a;font-size:14px;font-weight:600;">
                    ${removedBy}
                  </td>
                </tr>
                <tr style="border-top:1px solid #e2e8f0;">
                  <td style="padding:12px 0;color:#64748b;font-size:14px;vertical-align:top;">
                    Date & Time
                  </td>
                  <td style="padding:12px 0;color:#0f172a;font-size:14px;font-weight:600;">
                    ${new Date().toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })} at ${new Date().toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>
              </table>
            </div>

            <!-- Reason Box -->
            <div style="background:#fff5f5;border-left:5px solid #dc2626;border-radius:12px;padding:25px;margin-bottom:28px;">
              <p style="margin:0 0 15px 0;font-size:16px;color:#b71c1c;font-weight:700;display:flex;align-items:center;gap:8px;">
                <span style="font-size:20px;">⚠️</span>
                Reason for Removal
              </p>
              <div style="background:#ffffff;border-radius:10px;padding:20px;box-shadow:0 2px 8px rgba(220,38,38,0.08);">
                <p style="margin:0;font-size:14px;color:#334155;line-height:1.8;white-space:pre-wrap;">
                  ${reason}
                </p>
              </div>
            </div>

            <!-- What This Means Section -->
            <div style="background:linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);border-radius:12px;padding:25px;margin-bottom:28px;border:1px solid #fde68a;">
              <p style="margin:0 0 18px 0;font-size:15px;color:#78350f;font-weight:700;display:flex;align-items:center;gap:8px;">
                <span style="font-size:18px;">📌</span>
                What this means
              </p>
              <div style="background:#ffffff;border-radius:10px;padding:20px;">
                <ul style="margin:0;padding:0 0 0 20px;color:#92400e;font-size:14px;line-height:2;">
                  <li style="margin-bottom:8px;">You can no longer access the UrbanTales admin panel</li>
                  <li style="margin-bottom:8px;">Your admin credentials have been permanently disabled</li>
                  <li style="margin-bottom:8px;">All your admin permissions have been revoked immediately</li>
                  <li style="margin-bottom:8px;">You will not receive any further admin-related communications</li>
                  <li>Any active sessions have been terminated</li>
                </ul>
              </div>
            </div>

            <!-- Contact Support Section -->
            <div style="text-align:center;padding:30px 25px;background:linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);border-radius:14px;margin-bottom:25px;border:2px dashed #cbd5e1;">
              <p style="margin:0 0 8px 0;font-size:14px;color:#475569;font-weight:600;">
                Need Help?
              </p>
              <p style="margin:0 0 20px 0;font-size:13px;color:#64748b;line-height:1.6;">
                If you believe this is a mistake or have questions
              </p>
              <a href="mailto:${FROM_EMAIL}" 
                 style="display:inline-block;background:#0f172a;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:14px;font-weight:600;box-shadow:0 4px 12px rgba(15,23,42,0.25);">
                📧 Contact Support Team
              </a>
            </div>

            <!-- Footer Note -->
            <div style="background:#f8fafc;border-radius:10px;padding:18px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#64748b;line-height:1.7;">
                This is an automated notification from the <strong>UrbanTales Admin Management System</strong>.<br>
                Please do not reply to this email. For assistance, use the contact button above.
              </p>
            </div>

          </div>

          <!-- Footer -->
          <div style="background:linear-gradient(135deg, #1e293b 0%, #0f172a 100%);color:#cbd5e1;text-align:center;padding:30px;">
            <p style="margin:0 0 10px 0;font-size:15px;font-weight:700;">
              UrbanTales Admin Portal
            </p>
            <p style="margin:0 0 12px 0;font-size:13px;opacity:0.8;">
              © ${new Date().getFullYear()} UrbanTales. All rights reserved.
            </p>
            <div style="width:50px;height:2px;background:rgba(226,232,240,0.3);margin:12px auto;border-radius:2px;"></div>
            <p style="margin:0;font-size:11px;opacity:0.6;">
              This email was sent to ${to}
            </p>
          </div>

        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    to,
    from: { email: FROM_EMAIL, name: `${FROM_NAME} Security` },
    subject: "⚠️ Your UrbanTales Admin Access Has Been Revoked",
    html,
    text: `Admin Access Revoked\n\nHello ${fullName},\n\nYour admin account on UrbanTales has been removed.\n\nAccount Details:\nEmail: ${to}\nUsername: ${username}\nRemoved By: ${removedBy}\n\nReason: ${reason}\n\nYou can no longer access the admin panel. If this is a mistake, contact ${FROM_EMAIL}.\n\n© ${new Date().getFullYear()} UrbanTales`,
  };

  try {
    console.log(`🚀 Attempting to send removal email to: ${to}`);
    await sendEmailWithRetry(mailOptions);
    console.log(`✅ Removal email sent successfully to ${to}`);
  } catch (err) {
    console.error(
      `❌ sendAdminRemovalMail error for ${to}:`,
      err.response?.body || err.message
    );

    // Log details for manual notification
    console.log(`\n📧 ========== REMOVAL EMAIL FAILED ==========`);
    console.log(`Recipient: ${to}`);
    console.log(`Full Name: ${fullName}`);
    console.log(`Username: ${username}`);
    console.log(`Reason: ${reason}`);
    console.log(`Removed By: ${removedBy}`);
    console.log(`========== NOTIFY MANUALLY ==========\n`);

    // Don't throw error - admin removal should still succeed
    // even if email fails
  }
}

// Export helper for testing
export { sendEmailWithRetry };
