import Admin from "../models/Admin.js";
import { signAdminJwt } from "../utils/adminJwt.js";
import {
  sendAdminWelcomeMail,
  sendAdminResetOtpMail,
  sendAdminRemovalMail,
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
      .select("fullName email username role createdAt")
      .sort({ createdAt: -1 });

    return res.status(200).json({ admins });
  } catch (err) {
    console.error("listAdmins error:", err);
    return res.status(500).json({ message: "Failed to fetch admins" });
  }
};

// DELETE ADMIN (Super Admin only) - with reason and email notification
export const deleteAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;
    const { reason } = req.body;

    // Validate reason
    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Reason for removal is required",
      });
    }

    // Prevent self-deletion
    if (req.admin._id.toString() === adminId) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    // Find the admin to delete
    const adminToDelete = await Admin.findById(adminId);

    if (!adminToDelete) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    // Prevent deletion of the last Super Admin
    if (adminToDelete.role === "SUPER_ADMIN") {
      const superAdminCount = await Admin.countDocuments({
        role: "SUPER_ADMIN",
      });
      if (superAdminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: "Cannot delete the last Super Admin account",
        });
      }
    }

    // Send removal notification email before deleting
    try {
      await sendAdminRemovalMail({
        to: adminToDelete.email,
        fullName: adminToDelete.fullName,
        username: adminToDelete.username,
        reason: reason.trim(),
        removedBy: req.admin.fullName || req.admin.username,
      });
    } catch (emailError) {
      console.error("Email sending failed but continuing with deletion:", emailError);
      // Continue with deletion even if email fails
    }

    // Delete the admin permanently from database
    await Admin.findByIdAndDelete(adminId);

    res.status(200).json({
      success: true,
      message: "Admin removed successfully and notification email sent",
      deletedAdmin: {
        id: adminToDelete._id,
        fullName: adminToDelete.fullName,
        email: adminToDelete.email,
        username: adminToDelete.username,
        role: adminToDelete.role,
      },
    });
  } catch (error) {
    console.error("Delete admin error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting admin",
      error: error.message,
    });
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
      return res.status(400).json({ message: "Current password incorrect" });

    admin.password = newPassword;
    await admin.save();

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("changeAdminPassword error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
