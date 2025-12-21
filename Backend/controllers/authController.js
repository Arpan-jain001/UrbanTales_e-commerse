// Backend/controllers/authController.js
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/user.js";
import { sendResetPasswordOTP } from "../utils/sendOtpMail.js";

const JWT_SECRET = process.env.JWT_SECRET || "fallbackSecretKey";

// =========================
// USER REGISTER (OPTIONAL)
// =========================
export const registerUser = async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ msg: "Email already registered." });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      phone,
      password: hashed,
    });

    // Token generate (same format as login)
    const token = jwt.sign(
      { userId: user._id.toString() },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      msg: "Registration successful.",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Error in registerUser:", err);
    res.status(500).json({ msg: "Server error while registering." });
  }
};

// =========================
// USER LOGIN (MAIN FOR JWT)
// =========================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid email or password." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ msg: "Invalid email or password." });

    // ✅ VERY IMPORTANT: payload me userId
    const token = jwt.sign(
      { userId: user._id.toString() },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      msg: "Login successful.",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Error in loginUser:", err);
    res.status(500).json({ msg: "Server error while logging in." });
  }
};

// =========================
// FORGOT / RESET PASSWORD
// =========================

// REQUEST OTP (2 MINUTE EXPIRY)
export const requestResetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Email not registered." });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOTP = otp;
    user.resetOTPExpires = Date.now() + 2 * 60 * 1000; // 2 minutes
    await user.save();

    await sendResetPasswordOTP(email, otp);
    res.status(200).json({ msg: "OTP sent to your email address." });
  } catch (err) {
    console.error("Error in requestResetPassword:", err);
    res.status(500).json({ msg: "Server error while sending OTP." });
  }
};

// VERIFY OTP
export const verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ msg: "Email not found." });

    if (user.resetOTP !== otp) {
      return res.status(400).json({ msg: "Invalid OTP." });
    }

    if (user.resetOTPExpires < Date.now()) {
      return res.status(400).json({ msg: "OTP expired. Please resend." });
    }

    res.status(200).json({ msg: "OTP verified successfully." });
  } catch (err) {
    console.error("Error in verifyResetOTP:", err);
    res.status(500).json({ msg: "Server error verifying OTP." });
  }
};

// RESET PASSWORD
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ msg: "User not found." });
    if (user.resetOTP !== otp)
      return res.status(400).json({ msg: "Invalid OTP." });
    if (user.resetOTPExpires < Date.now())
      return res.status(400).json({ msg: "OTP expired. Please try again." });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOTP = null;
    user.resetOTPExpires = null;
    await user.save();

    res.status(200).json({ msg: "Password reset successful." });
  } catch (err) {
    console.error("Error in resetPassword:", err);
    res.status(500).json({ msg: "Server error resetting password." });
  }
};
