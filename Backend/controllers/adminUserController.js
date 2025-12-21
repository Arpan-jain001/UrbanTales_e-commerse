import User from "../models/user.js";

export const listUsersForAdmin = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const [users, total] = await Promise.all([
      User.find({})
        .select("fullName email phone createdAt")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      User.countDocuments({}),
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
