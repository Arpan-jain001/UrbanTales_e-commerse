import mongoose from "mongoose";
import User from "../models/user.js";
import Seller from "../models/Seller.js";
import Product from "../models/product.js";
import Order from "../models/Order.js";


// Helper: start of today
const getTodayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

// GET /api/admin/stats/overview
export const getAdminOverviewStats = async (req, res) => {
  try {
    const [{ totalUsers = 0 } = {}] = await User.aggregate([
      { $count: "totalUsers" },
    ]);

    const [{ totalSellers = 0 } = {}] = await Seller.aggregate([
      { $count: "totalSellers" },
    ]);

    const [{ totalProducts = 0 } = {}] = await Product.aggregate([
      { $count: "totalProducts" },
    ]);

    // total orders
    const [{ totalOrders = 0 } = {}] = await Order.aggregate([
      { $count: "totalOrders" },
    ]);

    // total revenue (delivered/completed only)
    const [{ totalRevenue = 0 } = {}] = await Order.aggregate([
      {
        $match: {
          status: { $in: ["DELIVERED", "COMPLETED"] },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalAmount" },
        },
      },
      { $project: { _id: 0, totalRevenue: 1 } },
    ]);

    // today sales
    const { start, end } = getTodayRange();
    const [{ todaySales = 0 } = {}] = await Order.aggregate([
      {
        $match: {
          status: { $in: ["DELIVERED", "COMPLETED"] },
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: null,
          todaySales: { $sum: "$totalAmount" },
        },
      },
      { $project: { _id: 0, todaySales: 1 } },
    ]);

    return res.json({
      totalUsers,
      totalSellers,
      totalProducts,
      totalOrders,
      totalRevenue,
      todaySales,
    });
  } catch (error) {
    console.error("getAdminOverviewStats error:", error);
    return res
      .status(500)
      .json({ message: "Failed to load overview stats." });
  }
};

// GET /api/admin/stats/sales/daily?days=7
export const getAdminDailySales = async (req, res) => {
  try {
    const days = parseInt(req.query.days, 10) || 7;

    const now = new Date();
    const fromDate = new Date();
    fromDate.setDate(now.getDate() - (days - 1));
    fromDate.setHours(0, 0, 0, 0);

    const raw = await Order.aggregate([
      {
        $match: {
          status: { $in: ["DELIVERED", "COMPLETED"] },
          createdAt: { $gte: fromDate, $lte: now },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          totalAmount: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
          "_id.day": 1,
        },
      },
    ]);

    // Normalize to always return last X days (including 0 sales days)
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      d.setHours(0, 0, 0, 0);

      const hit = raw.find(
        (r) =>
          r._id.year === d.getFullYear() &&
          r._id.month === d.getMonth() + 1 &&
          r._id.day === d.getDate()
      );

      result.push({
        date: d.toISOString().slice(0, 10),
        totalAmount: hit?.totalAmount || 0,
        orders: hit?.orders || 0,
      });
    }

    return res.json(result);
  } catch (error) {
    console.error("getAdminDailySales error:", error);
    return res
      .status(500)
      .json({ message: "Failed to load daily sales stats." });
  }
};
