import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import Seller from "../models/Seller.js";
import { sendSellerOtpMail } from "../utils/SellersendOtpMail.js";
import { sendSellerWelcomeMail } from "../utils/sendSellerWelcomeMail.js";
import {
  applyVerificationArtifacts,
  clearVerificationState,
  createVerificationArtifacts,
  findAccountByVerification,
  isVerificationWindowExpired,
  sendVerificationEmail,
} from "../utils/verificationService.js";

import { sellerAuth } from "../firebaseAdmin.js"; // ✅ IMPORTANT

function normalizeEmail(email) {
  return String(email || "").toLowerCase().trim();
}

function normalizeAddress(address) {
  return Array.isArray(address) ? address : [];
}

function generateUsername(fullName = "seller") {
  const base = fullName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "") || "seller";
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${base}-${rand}`;
}

async function createUniqueUsername(fullName) {
  let username = generateUsername(fullName);
  while (await Seller.findOne({ username })) {
    username = generateUsername(fullName);
  }
  return username;
}

function createSellerJwt(seller) {
  return jwt.sign({ id: seller._id.toString() }, process.env.SELLER_JWT_SECRET, {
    expiresIn: "7d",
  });
}

function serializeSeller(seller) {
  return {
    _id: seller._id,
    fullName: seller.fullName,
    username: seller.username,
    email: seller.email,
    phone: seller.phone,
    shopName: seller.shopName,
    address: seller.address,
    bio: seller.bio,
    avatar: seller.avatar,
    isVerified: Boolean(seller.isVerified),
  };
}

async function sendVerificationForSeller(seller, { preserveDeadline = true, isReminder = false } = {}) {
  const artifacts = createVerificationArtifacts(seller, { preserveDeadline });
  applyVerificationArtifacts(seller, artifacts, { isReminder });
  await seller.save();
  await sendVerificationEmail({ actor: "seller", account: seller, isReminder });
}

async function sendSellerWelcomeMailOnce(seller) {
  if (seller.welcomeEmailSentAt) {
    return;
  }

  await sendSellerWelcomeMail(seller.email, seller.fullName || seller.shopName || "Seller");
  seller.welcomeEmailSentAt = new Date();
  await seller.save();
}

async function createOrUpdateGoogleSeller({ email, name, picture }) {
  const normalizedEmail = normalizeEmail(email);
  let seller = await Seller.findOne({ email: normalizedEmail });
  let shouldSendWelcome = false;

  if (!seller) {
    seller = await Seller.create({
      fullName: name || normalizedEmail.split("@")[0],
      username: await createUniqueUsername(name || "seller"),
      email: normalizedEmail,
      phone: "",
      shopName: "",
      address: [],
      bio: "",
      avatar: picture || "",
      authProvider: "google",
      isVerified: true,
      verifiedAt: new Date(),
      verificationSource: "google",
    });
    shouldSendWelcome = true;
  } else if (!seller.isVerified) {
    clearVerificationState(seller, "google");
    if (!seller.avatar && picture) {
      seller.avatar = picture;
    }
    await seller.save();
    shouldSendWelcome = true;
  }

  if (shouldSendWelcome) {
    await sendSellerWelcomeMailOnce(seller);
  }

  return seller;
}

export async function googleSellerAuth(req, res) {
  try {
    const tokenId = req.body.tokenId;

    if (!tokenId) {
      return res.status(400).json({ error: "Token missing" });
    }

    const decodedToken = await sellerAuth.verifyIdToken(tokenId);
    const { email, name, picture } = decodedToken;

    if (!email) {
      return res.status(400).json({ error: "Google account missing email" });
    }

    const seller = await createOrUpdateGoogleSeller({ email, name, picture });
    const token = createSellerJwt(seller);

    res.json({
      token,
      seller: serializeSeller(seller),
    });
  } catch (err) {
    console.error("Google Seller Auth Error:", err);
    res.status(400).json({ error: "Google login failed" });
  }
}

export async function signup(req, res) {
  try {
    const { fullName, username, email, phone, shopName, address, bio, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    const exists = await Seller.findOne({ email: normalizedEmail });
    if (exists) {
      return res.status(400).json({ error: "Seller with this email already exists!" });
    }

    const uniqueUsername = username ? username.trim() : await createUniqueUsername(fullName);
    const hash = await bcrypt.hash(password, 10);

    const seller = new Seller({
      fullName,
      username: uniqueUsername,
      email: normalizedEmail,
      phone,
      shopName,
      address: normalizeAddress(address),
      bio,
      password: hash,
      authProvider: "local",
    });

    await sendVerificationForSeller(seller, { preserveDeadline: false });

    res.status(201).json({
      message: "Seller signup successful. Please verify your account.",
      requiresVerification: true,
      email: seller.email,
      seller: serializeSeller(seller),
      verificationDeadline: seller.verificationDeadline,
    });
  } catch (err) {
    console.error("Seller Signup Error:", err);
    res.status(400).json({ error: err.message || "Signup failed" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);
    const seller = await Seller.findOne({ email: normalizedEmail });

    if (!seller) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, seller.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    if (!seller.isVerified) {
      if (!isVerificationWindowExpired(seller)) {
        try {
          const hoursSinceLastEmail = seller.lastVerificationEmailSentAt
            ? (Date.now() - new Date(seller.lastVerificationEmailSentAt).getTime()) /
              (1000 * 60 * 60)
            : Infinity;
          if (hoursSinceLastEmail >= 24) {
            await sendVerificationForSeller(seller, { preserveDeadline: true, isReminder: true });
          }
        } catch (mailError) {
          console.error("Seller verification reminder send failed:", mailError.message);
        }
      }

      const windowExpired = isVerificationWindowExpired(seller);
      return res.status(403).json({
        code: windowExpired ? "VERIFICATION_WINDOW_EXPIRED" : "UNVERIFIED_ACCOUNT",
        error: windowExpired
          ? "Your verification window has expired. Please contact admin."
          : "Please verify your seller account before logging in.",
        requiresVerification: true,
        email: seller.email,
        verificationDeadline: seller.verificationDeadline,
      });
    }

    const token = createSellerJwt(seller);

    res.json({
      token,
      seller: serializeSeller(seller),
    });
  } catch (err) {
    console.error("Seller Login Error:", err);
    res.status(500).json({ error: "Login failed" });
  }
}

export async function verifyAccount(req, res) {
  const { email, otp, token } = req.body;

  try {
    const seller = await findAccountByVerification(Seller, { email, token });

    if (!seller) {
      return res.status(404).json({ error: "Seller not found" });
    }

    if (seller.isVerified) {
      return res.json({
        message: "Seller already verified",
        token: createSellerJwt(seller),
        seller: serializeSeller(seller),
      });
    }

    if (isVerificationWindowExpired(seller)) {
      return res.status(403).json({
        code: "VERIFICATION_WINDOW_EXPIRED",
        error: "Verification window expired. Please contact admin.",
      });
    }

    const tokenMatches =
      token &&
      seller.verificationToken === token &&
      seller.verificationTokenExpires &&
      new Date(seller.verificationTokenExpires).getTime() >= Date.now();

    const otpMatches =
      otp &&
      seller.verificationOtp === String(otp).trim() &&
      seller.verificationOtpExpires &&
      new Date(seller.verificationOtpExpires).getTime() >= Date.now();

    if (!tokenMatches && !otpMatches) {
      return res.status(400).json({ error: "Invalid or expired verification code" });
    }

    clearVerificationState(seller, tokenMatches ? "link" : "otp");
    await seller.save();
    await sendSellerWelcomeMailOnce(seller);

    res.json({
      message: "Seller verified successfully",
      token: createSellerJwt(seller),
      seller: serializeSeller(seller),
    });
  } catch (err) {
    console.error("Seller Verify Account Error:", err);
    res.status(500).json({ error: "Verification failed" });
  }
}

export async function resendVerification(req, res) {
  try {
    const { email } = req.body;
    const seller = await Seller.findOne({ email: normalizeEmail(email) });

    if (!seller) {
      return res.status(404).json({ error: "Seller not found" });
    }

    if (seller.isVerified) {
      return res.status(400).json({ error: "Seller already verified" });
    }

    if (isVerificationWindowExpired(seller)) {
      return res.status(403).json({
        code: "VERIFICATION_WINDOW_EXPIRED",
        error: "Verification window expired. Please contact admin.",
      });
    }

    await sendVerificationForSeller(seller, { preserveDeadline: true, isReminder: true });

    res.json({
      message: "Verification email resent successfully",
      verificationDeadline: seller.verificationDeadline,
    });
  } catch (err) {
    console.error("Seller Resend Verification Error:", err);
    res.status(500).json({ error: "Failed to resend verification email" });
  }
}

export async function requestPasswordReset(req, res) {
  try {
    const { email } = req.body;
    const seller = await Seller.findOne({ email: normalizeEmail(email) });
    if (!seller) return res.status(404).json({ error: "Seller not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 15 * 60 * 1000;

    seller.otp = otp;
    seller.otpExpiry = otpExpiry;
    await seller.save();

    await sendSellerOtpMail({ to: seller.email, otp });
    res.json({ message: "OTP sent to email" });
  } catch (err) {
    console.error("OTP Send Error:", err);
    res.status(500).json({ error: "Failed to send OTP email" });
  }
}

export async function resetPasswordWithOtp(req, res) {
  try {
    const { email, otp, newPassword } = req.body;
    const seller = await Seller.findOne({ email: normalizeEmail(email) });
    if (!seller) return res.status(404).json({ error: "Seller not found" });
    if (!seller.otp || seller.otp !== otp) return res.status(400).json({ error: "Invalid OTP" });
    if (seller.otpExpiry < Date.now()) return res.status(400).json({ error: "OTP expired" });

    seller.password = await bcrypt.hash(newPassword, 10);
    seller.otp = null;
    seller.otpExpiry = null;
    await seller.save();
    res.json({ message: "Password reset successful" });
  } catch (err) {
    console.error("Password Reset Error:", err);
    res.status(500).json({ error: "Password reset failed" });
  }
}

export async function verifyOtp(req, res) {
  try {
    const { email, otp } = req.body;
    const seller = await Seller.findOne({ email: normalizeEmail(email) });
    if (!seller) return res.status(404).json({ error: "Seller not found" });
    if (!seller.otp || seller.otp !== otp) return res.status(400).json({ error: "Invalid OTP" });
    if (seller.otpExpiry < Date.now()) return res.status(400).json({ error: "OTP expired" });

    res.json({ message: "OTP verified" });
  } catch (err) {
    console.error("OTP Verification Error:", err);
    res.status(500).json({ error: "OTP verification failed" });
  }
}
