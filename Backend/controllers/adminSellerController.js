// controllers/adminSellerController.js
import Seller from "../models/Seller.js";

export const listSellersForAdmin = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search || "";
    const status = req.query.status || "";

    // Build query
    const query = {};

    // Search filter (name, email, or shop name)
    if (search && search.trim()) {
      query.$or = [
        { fullName: { $regex: search.trim(), $options: "i" } },
        { email: { $regex: search.trim(), $options: "i" } },
        { shopName: { $regex: search.trim(), $options: "i" } },
      ];
    }

    // Status filter
    if (status && status !== "ALL") {
      query.status = status;
    }

    const [sellers, total] = await Promise.all([
      Seller.find(query)
        .select("fullName shopName email phone status createdAt")
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
