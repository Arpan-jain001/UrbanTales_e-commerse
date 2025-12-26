import User from "../models/user.js";

export const listUsersForAdmin = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search || "";
    const status = req.query.status || "";

    // Build query
    const query = {};

    // Search filter (name or email)
    if (search && search.trim()) {
      query.$or = [
        { fullName: { $regex: search.trim(), $options: "i" } },
        { name: { $regex: search.trim(), $options: "i" } },
        { email: { $regex: search.trim(), $options: "i" } },
      ];
    }

    // Verification status filter
    if (status === "VERIFIED") {
      query.isVerified = true;
    } else if (status === "UNVERIFIED") {
      query.isVerified = false;
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select("fullName name email phone isVerified createdAt")
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
