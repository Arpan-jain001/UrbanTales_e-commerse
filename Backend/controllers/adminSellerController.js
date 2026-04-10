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
    const { isVerified } = req.body;
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
    } else {
      const artifacts = createVerificationArtifacts(seller, { preserveDeadline: false });
      applyVerificationArtifacts(seller, artifacts, { isReminder: false });
      await sendVerificationEmail({ actor: "seller", account: seller, isReminder: false });
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
    const deleted = await Seller.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Seller not found" });
    res.status(200).json({ message: "Seller deleted successfully" });
  } catch (err) {
    console.error("deleteSellerForAdmin error:", err);
    res.status(500).json({ message: "Failed to delete seller" });
  }
};
