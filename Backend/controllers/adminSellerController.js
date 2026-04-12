import Seller from "../models/Seller.js";
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
      { shopName: { $regex: search.trim(), $options: "i" } },
    ];
  }

  if (status === "VERIFIED") query.isVerified = true;
  if (status === "UNVERIFIED") query.isVerified = false;

  return query;
};

const refreshVerificationForSeller = async (seller, { isReminder = true } = {}) => {
  const artifacts = createVerificationArtifacts(seller, { preserveDeadline: false });
  applyVerificationArtifacts(seller, artifacts, { isReminder });
  await seller.save();
  await sendVerificationEmail({ actor: "seller", account: seller, isReminder });
  return seller;
};

export const listSellersForAdmin = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const query = buildQuery(req.query);

    const [sellers, total] = await Promise.all([
      Seller.find(query)
        .select(
          "fullName shopName email phone isVerified createdAt verifiedAt verificationDeadline verificationReminderCount lastVerificationEmailSentAt"
        )
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Seller.countDocuments(query),
    ]);

    return res.status(200).json({
      sellers,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("listSellersForAdmin error:", err);
    return res.status(500).json({ message: "Failed to fetch sellers" });
  }
};

export const updateSellerVerificationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isVerified, reason, sendVerificationEmail: sendEmail } = req.body;
    if (typeof isVerified !== "boolean") {
      return res.status(400).json({ message: "isVerified must be a boolean" });
    }
    const seller = await Seller.findById(id);
    if (!seller) return res.status(404).json({ message: "Seller not found" });

    if (isVerified) {
      seller.isVerified = true;
      seller.verifiedAt = new Date();
      seller.verificationSource = "admin";
      seller.verificationOtp = null;
      seller.verificationOtpExpires = null;
      seller.verificationToken = null;
      seller.verificationTokenExpires = null;
      seller.verificationDeadline = null;
      seller.lastVerificationEmailSentAt = null;
      seller.verificationReminderCount = 0;
      seller.adminUnverifyReason = "";
    } else {
      if (!reason || !reason.trim()) {
        return res.status(400).json({ message: "A reason is required when marking an account unverified." });
      }
      seller.adminUnverifyReason = reason.trim();
      const artifacts = createVerificationArtifacts(seller, { preserveDeadline: false });
      applyVerificationArtifacts(seller, artifacts, { isReminder: false });
      if (sendEmail) {
        await sendVerificationEmail({ actor: "seller", account: seller, isReminder: false });
      }
    }

    await seller.save();
    res.status(200).json({ message: "Seller verification updated", seller });
  } catch (err) {
    console.error("updateSellerVerificationStatus error:", err);
    res.status(500).json({ message: "Failed to update seller verification" });
  }
};

export const deleteSellerForAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const reason = req.body?.reason || req.query?.reason;
    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: "Deletion reason is required." });
    }
    const deleted = await Seller.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Seller not found" });
    console.log(`Admin deleted seller ${id} - reason: ${reason.trim()}`);
    res.status(200).json({ message: "Seller deleted successfully" });
  } catch (err) {
    console.error("deleteSellerForAdmin error:", err);
    res.status(500).json({ message: "Failed to delete seller" });
  }
};

export const resendSellerVerificationEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const seller = await Seller.findById(id);

    if (!seller) {
      return res.status(404).json({ message: "Seller not found" });
    }

    if (seller.isVerified) {
      return res.status(400).json({ message: "Seller is already verified." });
    }

    await refreshVerificationForSeller(seller, { isReminder: true });

    return res.status(200).json({
      message: "Verification email resent successfully.",
      seller,
    });
  } catch (err) {
    console.error("resendSellerVerificationEmail error:", err);
    return res.status(500).json({ message: "Failed to resend verification email." });
  }
};

export const resendVerificationToUnverifiedSellers = async (req, res) => {
  try {
    const query = buildQuery(req.body || req.query || {});
    query.isVerified = false;

    const sellers = await Seller.find(query).select("fullName email shopName isVerified");

    let sent = 0;

    for (const seller of sellers) {
      if (!seller.email) {
        continue;
      }

      await refreshVerificationForSeller(seller, { isReminder: true });
      sent += 1;
    }

    return res.status(200).json({
      message: sent
        ? `Verification reminders sent to ${sent} unverified sellers.`
        : "No unverified sellers matched the current filters.",
      sent,
    });
  } catch (err) {
    console.error("resendVerificationToUnverifiedSellers error:", err);
    return res.status(500).json({ message: "Failed to send verification reminders." });
  }
};
