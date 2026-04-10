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
    const { isVerified } = req.body;
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
    } else {
      const artifacts = createVerificationArtifacts(user, { preserveDeadline: false });
      applyVerificationArtifacts(user, artifacts, { isReminder: false });
      await sendVerificationEmail({ actor: "user", account: user, isReminder: false });
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
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("deleteUserForAdmin error:", err);
    res.status(500).json({ message: "Failed to delete user" });
  }
};
