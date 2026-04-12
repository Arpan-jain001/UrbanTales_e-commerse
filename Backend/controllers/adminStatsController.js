import User from "../models/user.js";
import Seller from "../models/Seller.js";
import Product from "../models/product.js";
import Order from "../models/Order.js";
import GiftCard from "../models/GiftCard.js";

const DELIVERED_STATUSES = ["Delivered"];

const roundAmount = (value) => Number(Number(value || 0).toFixed(2));

const getTodayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

const normalizeWallets = async () => {
  const now = Date.now();
  const wallets = await GiftCard.find({ kind: "WALLET" });

  for (const wallet of wallets) {
    let changed = false;
    let expiredDelta = 0;

    wallet.walletEntries = (wallet.walletEntries || []).map((entry) => {
      const hasExpired =
        entry.status === "ACTIVE" &&
        entry.expiresAt &&
        new Date(entry.expiresAt).getTime() < now &&
        Number(entry.remainingAmount || 0) > 0;

      if (!hasExpired) {
        return entry;
      }

      const expiringAmount = Number(entry.remainingAmount || 0);
      expiredDelta += expiringAmount;
      entry.expiredAmount = roundAmount(
        Number(entry.expiredAmount || 0) + expiringAmount
      );
      entry.remainingAmount = 0;
      entry.status = "EXPIRED";
      changed = true;
      return entry;
    });

    if (changed) {
      wallet.balance = roundAmount(
        Math.max(0, Number(wallet.balance || 0) - expiredDelta)
      );
      await wallet.save();
    }
  }
};

export const getAdminOverviewStats = async (req, res) => {
  try {
    const [
      totalUsers,
      verifiedUsers,
      totalSellers,
      verifiedSellers,
      totalProducts,
      totalOrders,
      returnOrders,
      pendingReturns,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isVerified: true }),
      Seller.countDocuments(),
      Seller.countDocuments({ isVerified: true }),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.countDocuments({
        $or: [{ orderStatus: "Returned" }, { returnStatus: { $ne: "" } }],
      }),
      Order.countDocuments({
        returnStatus: {
          $in: ["Requested", "Pickup Scheduled", "Picked Up", "Refund Initiated"],
        },
      }),
    ]);

    const [{ totalRevenue = 0 } = {}] = await Order.aggregate([
      {
        $match: {
          orderStatus: { $in: DELIVERED_STATUSES },
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

    const { start, end } = getTodayRange();
    const [{ todaySales = 0 } = {}] = await Order.aggregate([
      {
        $match: {
          orderStatus: { $in: DELIVERED_STATUSES },
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
      verifiedUsers,
      unverifiedUsers: Math.max(0, totalUsers - verifiedUsers),
      totalSellers,
      verifiedSellers,
      unverifiedSellers: Math.max(0, totalSellers - verifiedSellers),
      totalProducts,
      totalOrders,
      totalRevenue,
      todaySales,
      returnOrders,
      pendingReturns,
    });
  } catch (error) {
    console.error("getAdminOverviewStats error:", error);
    return res.status(500).json({ message: "Failed to load overview stats." });
  }
};

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
          orderStatus: { $in: DELIVERED_STATUSES },
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

    const result = [];
    for (let i = days - 1; i >= 0; i -= 1) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      d.setHours(0, 0, 0, 0);

      const hit = raw.find(
        (row) =>
          row._id.year === d.getFullYear() &&
          row._id.month === d.getMonth() + 1 &&
          row._id.day === d.getDate()
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
    return res.status(500).json({ message: "Failed to load daily sales stats." });
  }
};

export const getAdminFinanceSummary = async (req, res) => {
  try {
    await normalizeWallets();

    const wallets = await GiftCard.find({ kind: "WALLET" }).lean();
    const refundOrders = await Order.countDocuments({ returnStatus: { $ne: "" } });
    const pendingRefundOrders = await Order.countDocuments({
      returnStatus: {
        $in: ["Requested", "Pickup Scheduled", "Picked Up", "Refund Initiated"],
      },
    });

    const summary = wallets.reduce(
      (acc, wallet) => {
        if (Number(wallet.balance || 0) > 0) {
          acc.activeWalletCount += 1;
        }

        for (const entry of wallet.walletEntries || []) {
          const amount = Number(entry.amount || 0);
          const remainingAmount = Number(entry.remainingAmount || 0);
          const expiredAmount = Number(entry.expiredAmount || 0);
          const usedAmount = Math.max(0, amount - remainingAmount - expiredAmount);

          acc.totalWalletIssued += amount;
          acc.walletLiability += remainingAmount;
          acc.totalWalletExpired += expiredAmount;
          acc.totalWalletUsed += usedAmount;

          if (entry.source === "RETURN_REFUND") {
            acc.totalReturnRefunded += amount;
          }

          if (
            entry.status === "ACTIVE" &&
            entry.expiresAt &&
            new Date(entry.expiresAt).getTime() <=
              Date.now() + 7 * 24 * 60 * 60 * 1000
          ) {
            acc.expiringSoonAmount += remainingAmount;
            acc.expiringSoonEntries += 1;
          }
        }

        return acc;
      },
      {
        walletLiability: 0,
        totalWalletIssued: 0,
        totalWalletUsed: 0,
        totalWalletExpired: 0,
        totalReturnRefunded: 0,
        activeWalletCount: 0,
        expiringSoonAmount: 0,
        expiringSoonEntries: 0,
      }
    );

    return res.json({
      walletLiability: roundAmount(summary.walletLiability),
      totalWalletIssued: roundAmount(summary.totalWalletIssued),
      totalWalletUsed: roundAmount(summary.totalWalletUsed),
      totalWalletExpired: roundAmount(summary.totalWalletExpired),
      totalReturnRefunded: roundAmount(summary.totalReturnRefunded),
      activeWalletCount: summary.activeWalletCount,
      expiringSoonAmount: roundAmount(summary.expiringSoonAmount),
      expiringSoonEntries: summary.expiringSoonEntries,
      refundOrders,
      pendingRefundOrders,
    });
  } catch (error) {
    console.error("getAdminFinanceSummary error:", error);
    return res.status(500).json({ message: "Failed to load finance summary." });
  }
};
