import Admin from "../models/Admin.js";
import { signAdminJwt } from "../utils/adminJwt.js";
import {
  sendAdminWelcomeMail,
  sendAdminResetOtpMail,
} from "../utils/adminMail.js";
import crypto from "crypto";

// LOGIN (username/email + password)
export const adminLogin = async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier = email or username

    const admin = await Admin.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });
    if (!admin)
      return res.status(400).json({ message: "Invalid credentials" });

    const ok = await admin.comparePassword(password);
    if (!ok)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = signAdminJwt(admin);

    return res.status(200).json({
      message: "Login successful",
      token,
      admin: {
        id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        username: admin.username,
        role: admin.role,
      },
    });
  } catch (err) {
    console.error("adminLogin error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// SUPER ADMIN – create other admins
export const createAdmin = async (req, res) => {
  try {
    const { fullName, email, username, role } = req.body;

    const existing = await Admin.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return res
        .status(400)
        .json({ message: "Email or username already used" });
    }

    // Temporary random password; sent via email
    const password = crypto.randomBytes(5).toString("hex"); // 10 chars

    const admin = await Admin.create({
      fullName,
      email,
      username,
      password,
      // SUPER_ADMIN option allowed only for super admins
      role: role === "SUPER_ADMIN" ? "SUPER_ADMIN" : "ADMIN",
    });

    await sendAdminWelcomeMail({
      to: email,
      fullName,
      username,
      password,
    });

    return res.status(201).json({
      message: "Admin created and email sent",
      admin: {
        id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        username: admin.username,
        role: admin.role,
      },
    });
  } catch (err) {
    console.error(
      "createAdmin error:",
      err.response?.body || err.message || err
    );
    return res.status(500).json({
      message:
        err.response?.body?.errors?.[0]?.message ||
        "Server error creating admin",
    });
  }
};

// LIST ADMINS (for AdminManage page)
export const listAdmins = async (req, res) => {
  try {
    const admins = await Admin.find()
      // agar SUPER_ADMIN ko hide karna ho to: { role: "ADMIN" } use kar sakta hai
      // .find({ role: "ADMIN" })
      .select("fullName email username role createdAt")
      .sort({ createdAt: -1 });

    return res.status(200).json({ admins });
  } catch (err) {
    console.error("listAdmins error:", err);
    return res.status(500).json({ message: "Failed to fetch admins" });
  }
};

// FORGOT PASSWORD – send OTP
export const requestAdminPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    admin.resetOTP = otp;
    admin.resetOTPExpires = Date.now() + 15 * 60 * 1000; // 15 min
    await admin.save();

    await sendAdminResetOtpMail({ to: email, otp });

    return res
      .status(200)
      .json({ message: "OTP sent to your email (check spam)" });
  } catch (err) {
    console.error("requestAdminPasswordReset error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// VERIFY OTP
export const verifyAdminOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    if (!admin.resetOTP || admin.resetOTP !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    if (admin.resetOTPExpires < Date.now())
      return res.status(400).json({ message: "OTP expired" });

    return res.status(200).json({ message: "OTP verified" });
  } catch (err) {
    console.error("verifyAdminOtp error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// RESET PASSWORD
export const resetAdminPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    if (!admin.resetOTP || admin.resetOTP !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    if (admin.resetOTPExpires < Date.now())
      return res.status(400).json({ message: "OTP expired" });

    admin.password = newPassword;
    admin.resetOTP = null;
    admin.resetOTPExpires = null;
    await admin.save();

    return res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    console.error("resetAdminPassword error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// CHANGE PASSWORD (profile page)
export const changeAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const admin = await Admin.findById(req.admin._id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const ok = await admin.comparePassword(currentPassword);
    if (!ok)
      return res
        .status(400)
        .json({ message: "Current password incorrect" });

    admin.password = newPassword;
    await admin.save();

    return res
      .status(200)
      .json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("changeAdminPassword error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
