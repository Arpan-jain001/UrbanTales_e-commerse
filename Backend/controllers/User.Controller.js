import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import { adminAuth } from "../firebaseAdmin.js";
import { sendWelcomeMail } from "../utils/sendWelcomeMail.js";
import {
  applyVerificationArtifacts,
  clearVerificationState,
  createVerificationArtifacts,
  findAccountByVerification,
  isVerificationWindowExpired,
  sendVerificationEmail,
} from "../utils/verificationService.js";

const JWT_SECRET = process.env.JWT_SECRET || "fallbackSecretKey";

const createAuthToken = (user) =>
  jwt.sign({ userId: user._id.toString() }, JWT_SECRET, { expiresIn: "7d" });

const serializeUser = (user) => ({
  id: user._id,
  _id: user._id,
  fullName: user.fullName,
  email: user.email,
  phone: user.phone,
  role: user.role,
  isVerified: Boolean(user.isVerified),
});

const sendVerificationForUser = async (user, { preserveDeadline = true, isReminder = false } = {}) => {
  const artifacts = createVerificationArtifacts(user, { preserveDeadline });
  applyVerificationArtifacts(user, artifacts, { isReminder });
  await user.save();
  await sendVerificationEmail({ actor: "user", account: user, isReminder });
};

const sendWelcomeMailOnce = async (user) => {
  if (user.welcomeEmailSentAt) {
    return;
  }

  await sendWelcomeMail(user.email, user.fullName);
  user.welcomeEmailSentAt = new Date();
  await user.save();
};

export const signup = async (req, res) => {
  const { fullName, email, phone, password } = req.body;

  try {
    const normalizedEmail = String(email || "").toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      fullName,
      email: normalizedEmail,
      phone,
      password: hashedPassword,
      authProvider: "local",
    });

    await sendVerificationForUser(user, { preserveDeadline: false });

    return res.status(201).json({
      message: "Signup successful. Please verify your account.",
      requiresVerification: true,
      email: user.email,
      user: serializeUser(user),
      verificationDeadline: user.verificationDeadline,
    });
  } catch (err) {
    console.error("Signup Error:", err);
    return res.status(500).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const normalizedEmail = String(email || "").toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    if (!user.isVerified) {
      if (!isVerificationWindowExpired(user)) {
        try {
          const hoursSinceLastEmail = user.lastVerificationEmailSentAt
            ? (Date.now() - new Date(user.lastVerificationEmailSentAt).getTime()) /
              (1000 * 60 * 60)
            : Infinity;

          if (hoursSinceLastEmail >= 24) {
            await sendVerificationForUser(user, { preserveDeadline: true, isReminder: true });
          }
        } catch (mailError) {
          console.error("Verification reminder send failed:", mailError.message);
        }
      }

      const windowExpired = isVerificationWindowExpired(user);
      return res.status(403).json({
        code: windowExpired ? "VERIFICATION_WINDOW_EXPIRED" : "UNVERIFIED_ACCOUNT",
        message: windowExpired
          ? "Your verification window has expired. Please contact admin."
          : "Please verify your account before logging in.",
        requiresVerification: true,
        email: user.email,
        verificationDeadline: user.verificationDeadline,
      });
    }

    const token = createAuthToken(user);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: serializeUser(user),
    });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ message: err.message });
  }
};

export const verifyAccount = async (req, res) => {
  const { email, otp, token } = req.body;

  try {
    const user = await findAccountByVerification(User, { email, token });

    if (!user) {
      return res.status(404).json({ message: "Account not found." });
    }

    if (user.isVerified) {
      const authToken = createAuthToken(user);
      return res.status(200).json({
        message: "Account already verified.",
        token: authToken,
        user: serializeUser(user),
      });
    }

    if (isVerificationWindowExpired(user)) {
      return res.status(403).json({
        code: "VERIFICATION_WINDOW_EXPIRED",
        message: "Verification window expired. Please contact admin.",
      });
    }

    const tokenMatches =
      token &&
      user.verificationToken === token &&
      user.verificationTokenExpires &&
      new Date(user.verificationTokenExpires).getTime() >= Date.now();

    const otpMatches =
      otp &&
      user.verificationOtp === String(otp).trim() &&
      user.verificationOtpExpires &&
      new Date(user.verificationOtpExpires).getTime() >= Date.now();

    if (!tokenMatches && !otpMatches) {
      return res.status(400).json({ message: "Invalid or expired verification code." });
    }

    clearVerificationState(user, tokenMatches ? "link" : "otp");
    await user.save();
    await sendWelcomeMailOnce(user);

    const authToken = createAuthToken(user);

    return res.status(200).json({
      message: "Account verified successfully.",
      token: authToken,
      user: serializeUser(user),
    });
  } catch (err) {
    console.error("Verify Account Error:", err);
    return res.status(500).json({ message: "Failed to verify account." });
  }
};

export const resendVerification = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email: String(email || "").toLowerCase().trim() });

    if (!user) {
      return res.status(404).json({ message: "Account not found." });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Account already verified." });
    }

    if (isVerificationWindowExpired(user)) {
      return res.status(403).json({
        code: "VERIFICATION_WINDOW_EXPIRED",
        message: "Verification window expired. Please contact admin.",
      });
    }

    await sendVerificationForUser(user, { preserveDeadline: true, isReminder: true });

    return res.status(200).json({
      message: "Verification email resent successfully.",
      verificationDeadline: user.verificationDeadline,
    });
  } catch (err) {
    console.error("Resend Verification Error:", err);
    return res.status(500).json({ message: "Failed to resend verification email." });
  }
};

export const googleFirebaseLogin = async (req, res) => {
  const { token } = req.body;

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    const { uid, email, name, phone_number, picture } = decodedToken;
    const normalizedEmail = String(email || "").toLowerCase().trim();

    let user = await User.findOne({ email: normalizedEmail });
    let shouldSendWelcome = false;

    if (!user) {
      const hashedPassword = await bcrypt.hash(`${uid}-${normalizedEmail}`, 10);
      user = await User.create({
        fullName: name || normalizedEmail.split("@")[0],
        email: normalizedEmail,
        phone: phone_number || "",
        password: hashedPassword,
        authProvider: "google",
        profileImage: picture || "",
        isVerified: true,
        verifiedAt: new Date(),
        verificationSource: "google",
      });
      shouldSendWelcome = true;
    } else if (!user.isVerified) {
      clearVerificationState(user, "google");
      if (!user.profileImage && picture) {
        user.profileImage = picture;
      }
      await user.save();
      shouldSendWelcome = true;
    }

    if (shouldSendWelcome) {
      await sendWelcomeMailOnce(user);
    }

    const jwtToken = createAuthToken(user);

    return res.status(200).json({
      message: "Login successful",
      token: jwtToken,
      user: serializeUser(user),
    });
  } catch (err) {
    console.error("Firebase Google Auth Error:", err);
    return res.status(500).json({ message: "Google authentication failed" });
  }
};

export const updateProfile = async (req, res) => {
  const userId = req.userId;
  const { fullName, phone, address, bio, dob, gender, profileImage } = req.body;

  try {
    const updateDoc = {};

    if (typeof fullName !== "undefined") updateDoc.fullName = fullName;
    if (typeof phone !== "undefined") updateDoc.phone = phone;
    if (typeof bio !== "undefined") updateDoc.bio = bio;
    if (typeof dob !== "undefined") updateDoc.dob = dob;
    if (typeof gender !== "undefined") updateDoc.gender = gender;
    if (typeof profileImage !== "undefined") updateDoc.profileImage = profileImage;

    if (typeof address !== "undefined") {
      if (typeof address === "string") {
        const str = address.trim();
        updateDoc.address = str
          ? [{ street: str, city: "", pincode: "", tag: "Home" }]
          : [];
      } else if (Array.isArray(address)) {
        updateDoc.address = address;
      }
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateDoc, {
      new: true,
      runValidators: true,
    }).select("-password");

    return res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Update Profile Error:", err);
    return res.status(500).json({ message: err.message });
  }
};
