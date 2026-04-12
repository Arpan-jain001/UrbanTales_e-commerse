import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";
import {
  FiActivity,
  FiCalendar,
  FiDollarSign,
  FiPackage,
  FiRefreshCw,
  FiShoppingBag,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";

const BASE_API_URL =
  import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

const normalizeCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

export default function AdminDashboard() {
  const { token, admin } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [overview, setOverview] = useState(null);
  const [finance, setFinance] = useState(null);
  const [dailySales, setDailySales] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState("7");

  const fetchData = async () => {
    const headers = { Authorization: `Bearer ${token}` };
    setRefreshing(true);

    try {
      const [overviewRes, dailySalesRes, financeRes] = await Promise.all([
        axios.get(`${BASE_API_URL}/api/admin/stats/overview`, { headers }),
        axios.get(
          `${BASE_API_URL}/api/admin/stats/sales/daily?days=${selectedPeriod}`,
          { headers }
        ),
        axios.get(`${BASE_API_URL}/api/admin/stats/finance-summary`, {
          headers,
        }),
      ]);

      setOverview(overviewRes.data || {});
      setDailySales(Array.isArray(dailySalesRes.data) ? dailySalesRes.data : []);
      setFinance(financeRes.data || {});
    } catch (error) {
      console.error("Admin dashboard fetch error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchData();
  }, [token, selectedPeriod]);

  const cards = useMemo(
    () => [
      {
        label: "Total Users",
        key: "totalUsers",
        icon: FiUsers,
        gradient: "from-sky-400 to-blue-500",
        chip: `${overview?.verifiedUsers || 0} verified`,
      },
      {
        label: "Total Sellers",
        key: "totalSellers",
        icon: FiShoppingBag,
        gradient: "from-emerald-400 to-teal-500",
        chip: `${overview?.verifiedSellers || 0} verified`,
      },
      {
        label: "Total Products",
        key: "totalProducts",
        icon: FiPackage,
        gradient: "from-amber-300 to-orange-500",
        chip: "Live listings",
      },
      {
        label: "Total Orders",
        key: "totalOrders",
        icon: FiActivity,
        gradient: "from-pink-400 to-rose-500",
        chip: `${overview?.returnOrders || 0} with returns`,
      },
      {
        label: "Total Revenue",
        key: "totalRevenue",
        icon: FiDollarSign,
        gradient: "from-purple-400 to-indigo-500",
        chip: "Delivered orders",
        format: normalizeCurrency,
      },
      {
        label: "Today's Sales",
        key: "todaySales",
        icon: FiTrendingUp,
        gradient: "from-lime-400 to-emerald-500",
        chip: "Since midnight",
        format: normalizeCurrency,
      },
    ],
    [overview]
  );

  const totalPeriodSales = dailySales.reduce(
    (acc, item) => acc + Number(item.totalAmount || 0),
    0
  );
  const totalPeriodOrders = dailySales.reduce(
    (acc, item) => acc + Number(item.orders || 0),
    0
  );
  const avgDaily = Math.round(totalPeriodSales / Math.max(1, dailySales.length));
  const bestDay = Math.max(0, ...dailySales.map((item) => Number(item.totalAmount || 0)));

  const points = useMemo(() => buildPolylinePoints(dailySales), [dailySales]);
  const circles = useMemo(() => buildCirclePoints(dailySales), [dailySales]);
  const area = useMemo(() => buildAreaPoints(dailySales), [dailySales]);

  return (
    <div className="relative space-y-6">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0_0,#22c55e0f_0,transparent_55%),radial-gradient(circle_at_100%_100%,#6366f10f_0,transparent_55%)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-slate-800/80 bg-slate-950/80 backdrop-blur-xl shadow-[0_18px_45px_rgba(15,23,42,0.85)] p-6 md:p-8"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
                <FiActivity className="text-slate-900" size={24} />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-semibold text-slate-100">
                  Welcome,{" "}
                  <span className="bg-gradient-to-r from-amber-300 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
                    {admin?.fullName || admin?.username}
                  </span>
                </h2>
                <p className="text-xs md:text-sm text-slate-400 mt-1">
                  Live admin overview for verification queues, orders, returns, and gift card liability.
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-slate-900/60 border border-slate-700/80">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Role:</span>
                <span className="text-sm font-bold text-amber-300">{admin?.role}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/60 border border-slate-700/80">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-xs font-semibold text-emerald-400">Live</span>
            </div>
            <button
              onClick={fetchData}
              disabled={refreshing}
              className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/60 border border-slate-700/80 transition-all duration-300 hover:shadow-md disabled:opacity-50"
            >
              <FiRefreshCw
                size={18}
                className={`text-slate-300 ${refreshing ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          const value = overview?.[card.key] ?? 0;
          const display = card.format ? card.format(value) : value;

          return (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.04 * idx, duration: 0.35 }}
              whileHover={{ y: -4, scale: 1.01 }}
              className="group relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/80 backdrop-blur-xl shadow-[0_18px_45px_rgba(15,23,42,0.85)] transition-all duration-300"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-10 group-hover:opacity-20 transition`} />
              <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-slate-900/40 blur-2xl group-hover:bg-slate-800/40 transition" />

              <div className="relative p-4 md:p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${card.gradient} shadow-lg`}>
                    <Icon className="text-slate-900" size={24} />
                  </div>
                </div>

                <div>
                  <p className="text-2xl font-semibold text-slate-50">
                    {loading ? <span className="animate-pulse">...</span> : display}
                  </p>
                  <p className="text-xs text-slate-400 font-medium mt-1">{card.label}</p>
                </div>

                <div className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-900/80 border border-slate-700/80 text-slate-400">
                  {card.chip}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.4 }}
        className="rounded-2xl border border-slate-800 bg-slate-950/85 backdrop-blur-xl shadow-[0_18px_45px_rgba(15,23,42,0.85)] p-4 md:p-5"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <FiTrendingUp className="text-emerald-400" size={20} />
              Sales Performance
            </h3>
            <p className="text-xs text-slate-400">
              Daily revenue trend from delivered orders.
            </p>
          </div>

          <div className="flex items-center gap-2 p-1 bg-slate-900/60 rounded-xl border border-slate-700/80">
            {["7", "15", "30"].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  selectedPeriod === period
                    ? "bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-900 shadow-lg"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-300"
                }`}
              >
                {period}d
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <p className="text-xs font-medium text-slate-400 mb-1">Revenue</p>
            <p className="text-xl font-bold text-slate-100">{normalizeCurrency(totalPeriodSales)}</p>
            <p className="text-xs text-emerald-400 mt-1">Last {selectedPeriod} days</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <p className="text-xs font-medium text-slate-400 mb-1">Best Day</p>
            <p className="text-xl font-bold text-slate-100">{normalizeCurrency(bestDay)}</p>
            <p className="text-xs text-emerald-400 mt-1">Peak day</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <p className="text-xs font-medium text-slate-400 mb-1">Average / Day</p>
            <p className="text-xl font-bold text-slate-100">{normalizeCurrency(avgDaily)}</p>
            <p className="text-xs text-emerald-400 mt-1">Daily average</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <p className="text-xs font-medium text-slate-400 mb-1">Orders</p>
            <p className="text-xl font-bold text-slate-100">{totalPeriodOrders.toLocaleString("en-IN")}</p>
            <p className="text-xs text-emerald-400 mt-1">Delivered orders</p>
          </div>
        </div>

        <div className="h-48 md:h-56 relative">
          {dailySales.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500">
              <FiCalendar size={48} className="mb-3 text-slate-700" />
              <p className="text-xs font-medium">
                {loading ? "Loading sales data..." : "No sales data available yet."}
              </p>
            </div>
          ) : (
            <svg viewBox="0 0 100 40" className="w-full h-full text-emerald-400" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="lineGradient" x1="0%" x2="100%">
                  <stop offset="0%" stopColor="#22c55e" />
                  <stop offset="50%" stopColor="#14b8a6" />
                  <stop offset="100%" stopColor="#22c55e" />
                </linearGradient>
              </defs>
              <polygon fill="url(#chartGradient)" opacity="0.22" points={area} />
              <polyline
                fill="none"
                stroke="url(#lineGradient)"
                strokeWidth="0.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
              />
              {circles.map((point, idx) => (
                <circle key={`${point.x}-${point.y}-${idx}`} cx={point.x} cy={point.y} r="0.9" fill="#22c55e" />
              ))}
            </svg>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-slate-800/80 bg-slate-950/80 backdrop-blur-xl shadow-[0_18px_45px_rgba(15,23,42,0.85)] p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-bold text-slate-100">Verification Queue</h4>
            <FiUsers size={24} className="text-emerald-400" />
          </div>
          <div className="space-y-3 text-sm">
            <p className="flex justify-between"><span className="text-slate-500">Unverified users</span><span className="font-bold text-slate-100">{overview?.unverifiedUsers || 0}</span></p>
            <p className="flex justify-between"><span className="text-slate-500">Unverified sellers</span><span className="font-bold text-slate-100">{overview?.unverifiedSellers || 0}</span></p>
          </div>
          <div className="mt-4 flex gap-2">
            <Link to="/admin/users" className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-900">Users</Link>
            <Link to="/admin/sellers" className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-900">Sellers</Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl border border-slate-800/80 bg-slate-950/80 backdrop-blur-xl shadow-[0_18px_45px_rgba(15,23,42,0.85)] p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-bold text-slate-100">Returns & Refunds</h4>
            <FiActivity size={24} className="text-amber-400" />
          </div>
          <div className="space-y-3 text-sm">
            <p className="flex justify-between"><span className="text-slate-500">Pending returns</span><span className="font-bold text-slate-100">{overview?.pendingReturns || 0}</span></p>
            <p className="flex justify-between"><span className="text-slate-500">Refund orders</span><span className="font-bold text-slate-100">{finance?.refundOrders || 0}</span></p>
            <p className="flex justify-between"><span className="text-slate-500">Pending refund actions</span><span className="font-bold text-slate-100">{finance?.pendingRefundOrders || 0}</span></p>
          </div>
          <div className="mt-4">
            <Link to="/admin/orders" className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-900 inline-block">Review orders</Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-2xl border border-slate-800/80 bg-slate-950/80 backdrop-blur-xl shadow-[0_18px_45px_rgba(15,23,42,0.85)] p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-bold text-slate-100">Gift Card Ledger</h4>
            <FiDollarSign size={24} className="text-sky-400" />
          </div>
          <div className="space-y-3 text-sm">
            <p className="flex justify-between"><span className="text-slate-500">Wallet liability</span><span className="font-bold text-slate-100">{normalizeCurrency(finance?.walletLiability)}</span></p>
            <p className="flex justify-between"><span className="text-slate-500">Refunded to wallets</span><span className="font-bold text-slate-100">{normalizeCurrency(finance?.totalReturnRefunded)}</span></p>
            <p className="flex justify-between"><span className="text-slate-500">Expired to company</span><span className="font-bold text-slate-100">{normalizeCurrency(finance?.totalWalletExpired)}</span></p>
            <p className="flex justify-between"><span className="text-slate-500">Expiring in 7 days</span><span className="font-bold text-slate-100">{normalizeCurrency(finance?.expiringSoonAmount)}</span></p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function buildPolylinePoints(data) {
  if (!data.length) return "";
  const max = Math.max(1, ...data.map((item) => Number(item.totalAmount || 0)));
  const step = 100 / (data.length - 1 || 1);
  return data
    .map((item, idx) => {
      const x = step * idx;
      const y = 40 - (Number(item.totalAmount || 0) / max) * 30 - 5;
      return `${x},${y}`;
    })
    .join(" ");
}

function buildAreaPoints(data) {
  if (!data.length) return "";
  const line = buildPolylinePoints(data);
  const step = 100 / (data.length - 1 || 1);
  const endX = step * (data.length - 1 || 0);
  return `0,40 ${line} ${endX},40`;
}

function buildCirclePoints(data) {
  if (!data.length) return [];
  const max = Math.max(1, ...data.map((item) => Number(item.totalAmount || 0)));
  const step = 100 / (data.length - 1 || 1);
  return data.map((item, idx) => ({
    x: step * idx,
    y: 40 - (Number(item.totalAmount || 0) / max) * 30 - 5,
  }));
}
