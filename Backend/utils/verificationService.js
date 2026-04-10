import crypto from "crypto";
import { sendEmail } from "./resendClient.js";

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
const OTP_WINDOW_MS = 15 * 60 * 1000;

const actorConfig = {
  user: {
    label: "Account",
    fromName: "UrbanTales",
    verifyPath: "/verify-account",
    dashboardPath: "/",
  },
  seller: {
    label: "Seller Account",
    fromName: "UrbanTales Seller Team",
    verifyPath: "/seller/verify-account",
    dashboardPath: "/seller/dashboard",
  },
};

const escapeHtml = (value) =>
  String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

export const getVerificationDeadline = (account) =>
  account?.verificationDeadline ? new Date(account.verificationDeadline) : null;

export const isVerificationWindowExpired = (account) => {
  const deadline = getVerificationDeadline(account);
  return Boolean(deadline && deadline.getTime() < Date.now());
};

export const createVerificationArtifacts = (account, options = {}) => {
  const now = Date.now();
  const preserveDeadline = options.preserveDeadline !== false;
  const currentDeadline = preserveDeadline ? getVerificationDeadline(account) : null;
  const verificationDeadline =
    currentDeadline && currentDeadline.getTime() > now
      ? currentDeadline
      : new Date(now + THREE_DAYS_MS);

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const otpExpiry = new Date(Math.min(verificationDeadline.getTime(), now + OTP_WINDOW_MS));
  const token = crypto.randomBytes(24).toString("hex");

  return {
    otp,
    otpExpiry,
    token,
    tokenExpiry: verificationDeadline,
    verificationDeadline,
  };
};

export const applyVerificationArtifacts = (account, artifacts, options = {}) => {
  const isReminder = Boolean(options.isReminder);

  account.isVerified = false;
  account.verifiedAt = null;
  account.verificationSource = "";
  account.verificationOtp = artifacts.otp;
  account.verificationOtpExpires = artifacts.otpExpiry;
  account.verificationToken = artifacts.token;
  account.verificationTokenExpires = artifacts.tokenExpiry;
  account.verificationDeadline = artifacts.verificationDeadline;
  account.lastVerificationEmailSentAt = new Date();
  account.verificationReminderCount = isReminder
    ? Number(account.verificationReminderCount || 0) + 1
    : Number(account.verificationReminderCount || 0);
};

export const clearVerificationState = (account, source = "manual") => {
  account.isVerified = true;
  account.verifiedAt = new Date();
  account.verificationSource = source;
  account.verificationOtp = null;
  account.verificationOtpExpires = null;
  account.verificationToken = null;
  account.verificationTokenExpires = null;
  account.verificationDeadline = null;
  account.lastVerificationEmailSentAt = null;
  account.verificationReminderCount = 0;
};

export const getFrontendBaseUrl = () =>
  (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/+$/, "");

export const buildVerificationUrl = (actor, token, email) => {
  const config = actorConfig[actor] || actorConfig.user;
  const url = new URL(`${getFrontendBaseUrl()}${config.verifyPath}`);
  url.searchParams.set("token", token);
  if (email) {
    url.searchParams.set("email", email);
  }
  return url.toString();
};

export const sendVerificationEmail = async ({ actor, account, isReminder = false }) => {
  const config = actorConfig[actor] || actorConfig.user;
  const recipientName =
    account.fullName || account.shopName || account.username || account.email || "there";
  const verificationUrl = buildVerificationUrl(actor, account.verificationToken, account.email);
  const deadline = getVerificationDeadline(account);
  const deadlineLabel = deadline
    ? deadline.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "3 days";

  const subject = isReminder
    ? `Reminder: verify your UrbanTales ${config.label.toLowerCase()}`
    : `Verify your UrbanTales ${config.label.toLowerCase()}`;

  const html = `
    <div style="background:#f6f7fb;padding:28px;font-family:Segoe UI,Arial,sans-serif;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 8px 30px rgba(15,23,42,0.08);">
        <div style="background:#070A52;padding:28px 24px;text-align:center;">
          <img src="https://res.cloudinary.com/dhmw4b5wq/image/upload/v1762673652/UrbanTales_korjrm.png" alt="UrbanTales" style="width:130px;height:auto;display:block;margin:0 auto 14px auto;" />
          <h1 style="margin:0;color:#FFCC00;font-size:24px;">Verify Your ${escapeHtml(config.label)}</h1>
        </div>
        <div style="padding:32px 28px;">
          <p style="margin:0 0 14px 0;font-size:16px;color:#1f2937;">
            Hello <strong>${escapeHtml(recipientName)}</strong>,
          </p>
          <p style="margin:0 0 16px 0;font-size:15px;line-height:1.7;color:#475569;">
            ${
              isReminder
                ? "This is a reminder that your UrbanTales account is still waiting for verification."
                : "Your signup is almost complete. Please verify your account before you can continue."
            }
          </p>
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:18px 20px;margin:18px 0;">
            <p style="margin:0 0 8px 0;font-size:13px;color:#64748b;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">Verification OTP</p>
            <p style="margin:0;font-size:34px;letter-spacing:10px;font-weight:800;color:#070A52;font-family:Courier New,monospace;">
              ${escapeHtml(account.verificationOtp)}
            </p>
            <p style="margin:10px 0 0 0;font-size:12px;color:#64748b;">
              This OTP is valid until ${escapeHtml(
                new Date(account.verificationOtpExpires).toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              )}.
            </p>
          </div>
          <div style="text-align:center;margin:28px 0;">
            <a href="${verificationUrl}" style="display:inline-block;background:#070A52;color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:700;">
              Verify with Link
            </a>
          </div>
          <p style="margin:0 0 10px 0;font-size:14px;color:#475569;line-height:1.7;">
            Verification is mandatory. This verification window stays open until <strong>${escapeHtml(
              deadlineLabel
            )}</strong>. After that, the admin team may review the account manually.
          </p>
          <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.7;">
            If the button does not work, open this link in your browser:<br />
            <a href="${verificationUrl}" style="color:#2563eb;word-break:break-all;">${verificationUrl}</a>
          </p>
        </div>
      </div>
    </div>
  `;

  const text = [
    `Hello ${recipientName},`,
    "",
    isReminder
      ? "This is a reminder to verify your UrbanTales account."
      : "Please verify your UrbanTales account before logging in.",
    "",
    `OTP: ${account.verificationOtp}`,
    `Verification link: ${verificationUrl}`,
    `Verification deadline: ${deadlineLabel}`,
  ].join("\n");

  return sendEmail({
    to: account.email,
    subject,
    html,
    text,
    fromName: config.fromName,
  });
};

export const shouldSendVerificationReminder = (account) => {
  if (!account || account.isVerified || isVerificationWindowExpired(account)) {
    return false;
  }

  if (!account.lastVerificationEmailSentAt) {
    return true;
  }

  const hoursSinceLastEmail =
    (Date.now() - new Date(account.lastVerificationEmailSentAt).getTime()) /
    (1000 * 60 * 60);

  return hoursSinceLastEmail >= 24;
};

export const findAccountByVerification = async (Model, { email, token }) => {
  if (token) {
    const byToken = await Model.findOne({ verificationToken: token });
    if (byToken) {
      return byToken;
    }
  }

  if (email) {
    return Model.findOne({ email: String(email).toLowerCase().trim() });
  }

  return null;
};

export const actorDashboardPath = (actor) =>
  (actorConfig[actor] || actorConfig.user).dashboardPath;
