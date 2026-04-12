import User from "../models/user.js";
import {
  applyVerificationArtifacts,
  createVerificationArtifacts,
  sendVerificationEmail,
} from "../utils/verificationService.js";

const buildQuery = ({ search = "", status = "" }) => {
  const query = {};

  if (search && search.trim()) {
    query.$or = [
      { fullName: { $regex: search.trim(), $options: "i" } },
      { email: { $regex: search.trim(), $options: "i" } },
      { phone: { $regex: search.trim(), $options: "i" } },
    ];
  }

  if (status === "VERIFIED") query.isVerified = true;
  if (status === "UNVERIFIED") query.isVerified = false;

  return query;
};

const refreshVerificationForUser = async (user, { isReminder = true } = {}) => {
  const artifacts = createVerificationArtifacts(user, { preserveDeadline: false });
  applyVerificationArtifacts(user, artifacts, { isReminder });
  await user.save();
  await sendVerificationEmail({ actor: "user", account: user, isReminder });
  return user;
};

export const listUsersForAdmin = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const query = buildQuery(req.query);

    const [users, total] = await Promise.all([
      User.find(query)
        .select(
          "fullName email phone isVerified createdAt verifiedAt verificationDeadline verificationReminderCount lastVerificationEmailSentAt"
        )
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      User.countDocuments(query),
    ]);

    return res.status(200).json({
      users,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("listUsersForAdmin error:", err);
    return res.status(500).json({ message: "Failed to fetch users" });
  }
};

export const updateUserVerificationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isVerified, reason, sendVerificationEmail: sendEmail } = req.body;
    if (typeof isVerified !== "boolean") {
      return res.status(400).json({ message: "isVerified must be a boolean" });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (isVerified) {
      user.isVerified = true;
      user.verifiedAt = new Date();
      user.verificationSource = "admin";
      user.verificationOtp = null;
      user.verificationOtpExpires = null;
      user.verificationToken = null;
      user.verificationTokenExpires = null;
      user.verificationDeadline = null;
      user.lastVerificationEmailSentAt = null;
      user.verificationReminderCount = 0;
      user.adminUnverifyReason = "";
    } else {
      if (!reason || !reason.trim()) {
        return res.status(400).json({ message: "A reason is required when marking an account unverified." });
      }
      user.adminUnverifyReason = reason.trim();
      const artifacts = createVerificationArtifacts(user, { preserveDeadline: false });
      applyVerificationArtifacts(user, artifacts, { isReminder: false });
      if (sendEmail) {
        await sendVerificationEmail({ actor: "user", account: user, isReminder: false });
      }
    }

    await user.save();
    res.status(200).json({ message: "User verification updated", user });
  } catch (err) {
    console.error("updateUserVerificationStatus error:", err);
    res.status(500).json({ message: "Failed to update user verification" });
  }
};

export const deleteUserForAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const reason = req.body?.reason || req.query?.reason;
    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: "Deletion reason is required." });
    }
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "User not found" });
    console.log(`Admin deleted user ${id} - reason: ${reason.trim()}`);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("deleteUserForAdmin error:", err);
    res.status(500).json({ message: "Failed to delete user" });
  }
};

export const resendUserVerificationEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User is already verified." });
    }

    await refreshVerificationForUser(user, { isReminder: true });

    return res.status(200).json({
      message: "Verification email resent successfully.",
      user,
    });
  } catch (err) {
    console.error("resendUserVerificationEmail error:", err);
    return res.status(500).json({ message: "Failed to resend verification email." });
  }
};

export const resendVerificationToUnverifiedUsers = async (req, res) => {
  try {
    const query = buildQuery(req.body || req.query || {});
    query.isVerified = false;

    const users = await User.find(query).select("fullName email isVerified");

    let sent = 0;

    for (const user of users) {
      if (!user.email) {
        continue;
      }

      await refreshVerificationForUser(user, { isReminder: true });
      sent += 1;
    }

    return res.status(200).json({
      message: sent
        ? `Verification reminders sent to ${sent} unverified users.`
        : "No unverified users matched the current filters.",
      sent,
    });
  } catch (err) {
    console.error("resendVerificationToUnverifiedUsers error:", err);
    return res.status(500).json({ message: "Failed to send verification reminders." });
  }
};
