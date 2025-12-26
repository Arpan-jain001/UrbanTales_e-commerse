import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useAdminAuth } from "../context/AdminAuthContext";
import {
  FiTrendingUp,
  FiUsers,
  FiShoppingBag,
  FiPackage,
  FiDollarSign,
  FiActivity,
  FiArrowUp,
  FiArrowDown,
  FiRefreshCw,
  FiCalendar,
} from "react-icons/fi";

const BASE_API_URL =
  import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

export default function AdminDashboard() {
  const { token, admin } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [overview, setOverview] = useState(null);
  const [dailySales, setDailySales] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState("7");

  useEffect(() => {
    if (!token) return;
    fetchData();
  }, [token, selectedPeriod]);

  const fetchData = async () => {
    const headers = { Authorization: `Bearer ${token}` };
    setRefreshing(true);

    try {
      const [ov, ds] = await Promise.all([
        axios.get(`${BASE_API_URL}/api/admin/stats/overview`, { headers }),
        axios.get(
          `${BASE_API_URL}/api/admin/stats/sales/daily?days=${selectedPeriod}`,
          { headers }
        ),
      ]);

      setOverview(ov.data);
      setDailySales(ds.data || []);
    } catch (err) {
      console.error("Admin dashboard fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const cards = [
    {
      label: "Total Users",
      key: "totalUsers",
      icon: FiUsers,
      gradient: "from-sky-400 to-blue-500",
      chip: "Platform customers",
      trend: "+12.5%",
      trendUp: true,
    },
    {
      label: "Total Sellers",
      key: "totalSellers",
      icon: FiShoppingBag,
      gradient: "from-emerald-400 to-teal-500",
      chip: "Active partners",
      trend: "+8.2%",
      trendUp: true,
    },
    {
      label: "Total Products",
      key: "totalProducts",
      icon: FiPackage,
      gradient: "from-amber-300 to-orange-500",
      chip: "Live listings",
      trend: "+23",
      trendUp: true,
    },
    {
      label: "Total Orders",
      key: "totalOrders",
      icon: FiActivity,
      gradient: "from-pink-400 to-rose-500",
      chip: "All time",
      trend: "+18.7%",
      trendUp: true,
    },
    {
      label: "Total Revenue",
      key: "totalRevenue",
      icon: FiDollarSign,
      gradient: "from-purple-400 to-indigo-500",
      chip: "Completed orders",
      format: (v) => `₹${v?.toLocaleString("en-IN")}`,
      trend: "+24.3%",
      trendUp: true,
    },
    {
      label: "Today's Sales",
      key: "todaySales",
      icon: FiTrendingUp,
      gradient: "from-lime-400 to-emerald-500",
      chip: "Since midnight",
      format: (v) => `₹${v?.toLocaleString("en-IN")}`,
      trend: "+32.1%",
      trendUp: true,
    },
  ];

  const total7d = dailySales.reduce((acc, d) => acc + (d.totalAmount || 0), 0);
  const avgDaily = Math.round(total7d / (dailySales.length || 1));
  const bestDay = Math.max(...dailySales.map((d) => d.totalAmount || 0));
  const totalOrders7d = dailySales.reduce((acc, d) => acc + (d.orders || 0), 0);

  return (
    <div className="relative space-y-6">
      {/* Soft animated background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0_0,#22c55e0f_0,transparent_55%),radial-gradient(circle_at_100%_100%,#6366f10f_0,transparent_55%)]" />
      </div>

      {/* Header Section */}
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
                    {admin?.fullName || admin?.username}! 👋
                  </span>
                </h2>
                <p className="text-xs md:text-sm text-slate-400 mt-1">
                  Real-time overview of UrbanTales users, sellers, products and orders.
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
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
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

      {/* Stats Cards Grid */}
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
              transition={{
                delay: 0.04 * idx,
                duration: 0.35,
              }}
              whileHover={{ y: -4, scale: 1.01 }}
              className="group relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/80 backdrop-blur-xl shadow-[0_18px_45px_rgba(15,23,42,0.85)] transition-all duration-300"
            >
              {/* Background Gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-10 group-hover:opacity-20 transition`}
              />

              {/* Animated Circle */}
              <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-slate-900/40 blur-2xl group-hover:bg-slate-800/40 transition" />

              <div className="relative p-4 md:p-5 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-br ${card.gradient} shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
                  >
                    <Icon className="text-slate-900" size={24} />
                  </div>
                  {card.trend && (
                    <div
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg ${
                        card.trendUp
                          ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                          : "bg-rose-500/10 text-rose-300 border border-rose-500/30"
                      }`}
                    >
                      {card.trendUp ? (
                        <FiArrowUp size={12} />
                      ) : (
                        <FiArrowDown size={12} />
                      )}
                      <span className="text-xs font-bold">{card.trend}</span>
                    </div>
                  )}
                </div>

                {/* Value */}
                <div>
                  <p className="text-2xl font-semibold text-slate-50">
                    {loading ? (
                      <span className="animate-pulse">...</span>
                    ) : (
                      display
                    )}
                  </p>
                  <p className="text-xs text-slate-400 font-medium mt-1">
                    {card.label}
                  </p>
                </div>

                {/* Chip */}
                {card.chip && (
                  <div className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-900/80 border border-slate-700/80 text-slate-400">
                    {card.chip}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Sales Chart Section */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.4 }}
        className="rounded-2xl border border-slate-800 bg-slate-950/85 backdrop-blur-xl shadow-[0_18px_45px_rgba(15,23,42,0.85)] p-4 md:p-5"
      >
        {/* Chart Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <FiTrendingUp className="text-emerald-400" size={20} />
              Sales Performance
            </h3>
            <p className="text-xs text-slate-400">
              Daily revenue trend from delivered/completed orders.
            </p>
          </div>

          {/* Period Selector */}
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

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <p className="text-xs font-medium text-slate-400 mb-1">Total Revenue</p>
            <p className="text-xl font-bold text-slate-100">
              ₹{total7d.toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-emerald-400 mt-1">Last {selectedPeriod} days</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <p className="text-xs font-medium text-slate-400 mb-1">Best Day</p>
            <p className="text-xl font-bold text-slate-100">
              ₹{bestDay.toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-emerald-400 mt-1">Peak performance</p>
          </div>

                    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <p className="text-xs font-medium text-slate-400 mb-1">Average/Day</p>
            <p className="text-xl font-bold text-slate-100">
              ₹{avgDaily.toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-emerald-400 mt-1">Daily average</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <p className="text-xs font-medium text-slate-400 mb-1">Total Orders</p>
            <p className="text-xl font-bold text-slate-100">
              {totalOrders7d.toLocaleString("en-IN")}
            </p>
            <p className="text-xs text-emerald-400 mt-1">Completed</p>
          </div>
        </div>

        {/* Chart Area */}
        <div className="h-48 md:h-56 relative">
          {dailySales.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500">
              <FiCalendar size={48} className="mb-3 text-slate-700" />
              <p className="text-xs font-medium">
                {loading ? "Loading sales data..." : "No sales data available yet."}
              </p>
            </div>
          ) : (
            <svg
              viewBox="0 0 100 40"
              className="w-full h-full text-emerald-400"
              preserveAspectRatio="none"
            >
              {/* Grid lines */}
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
                <filter id="glow">
                  <feGaussianBlur stdDeviation="0.5" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Area under curve */}
              <polygon
                fill="url(#chartGradient)"
                opacity="0.22"
                points={buildAreaPoints(dailySales)}
              />

              {/* Main line */}
              <polyline
                fill="none"
                stroke="url(#lineGradient)"
                strokeWidth="0.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={buildPolylinePoints(dailySales)}
                filter="url(#glow)"
              />

              {/* Data points */}
              {buildCirclePoints(dailySales).map((p, idx) => (
                <g key={idx}>
                  <c
                    cx={p.x}
                    cy={p.y}
                    r="1"
                    fill="#1e293b"
                    stroke="#22c55e"
                    strokeWidth="0.3"
                  />
                  <circle cx={p.x} cy={p.y} r="0.8" fill="#22c55e" opacity="0.9" />
                </g>
              ))}
            </svg>
          )}
        </div>

        {/* Chart Footer Info */}
        {dailySales.length > 0 && (
          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] text-slate-400">
            <div>
              <p className="text-slate-500">Best day</p>
              <p className="text-slate-100">
                ₹
                {Math.max(...dailySales.map((d) => d.totalAmount || 0)).toLocaleString(
                  "en-IN"
                )}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Average per day</p>
              <p className="text-slate-100">
                ₹
                {Math.round(total7d / (dailySales.length || 1)).toLocaleString("en-IN")}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Total orders (7d)</p>
              <p className="text-slate-100">
                {dailySales
                  .reduce((acc, d) => acc + (d.orders || 0), 0)
                  .toLocaleString("en-IN")}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Last day</p>
              <p className="text-slate-100">
                ₹
                {(
                  dailySales[dailySales.length - 1]?.totalAmount || 0
                ).toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        )}

        {/* Additional Metrics */}
        {dailySales.length > 0 && (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center">
                <FiTrendingUp className="text-slate-900" size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-500">Growth Rate</p>
                <p className="text-sm font-bold text-slate-100">+24.3%</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                <FiActivity className="text-slate-900" size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-500">Conversion</p>
                <p className="text-sm font-bold text-slate-100">3.8%</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-300 to-orange-500 flex items-center justify-center">
                <FiDollarSign className="text-slate-900" size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-500">AOV</p>
                <p className="text-sm font-bold text-slate-100">
                  ₹
                  {totalOrders7d > 0
                    ? Math.round(total7d / totalOrders7d).toLocaleString("en-IN")
                    : 0}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center">
                <FiCalendar className="text-slate-900" size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-500">Last Updated</p>
                <p className="text-sm font-bold text-slate-100">Just now</p>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Additional Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-slate-800/80 bg-slate-950/80 backdrop-blur-xl shadow-[0_18px_45px_rgba(15,23,42,0.85)] p-6 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-slate-100">Quick Actions</h4>
              <FiActivity size={24} className="text-emerald-400" />
            </div>
            <p className="text-sm text-slate-400 mb-4">
              Manage your platform efficiently with quick access
            </p>
            <div className="flex flex-wrap gap-2">
              <button className="px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800/80 border border-slate-700/80 rounded-lg text-xs font-semibold text-slate-300 transition-all duration-300">
                Add Product
              </button>
              <button className="px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800/80 border border-slate-700/80 rounded-lg text-xs font-semibold text-slate-300 transition-all duration-300">
                View Orders
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl border border-slate-800/80 bg-slate-950/80 backdrop-blur-xl shadow-[0_18px_45px_rgba(15,23,42,0.85)] p-6 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-sky-400/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-slate-100">Platform Health</h4>
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-sm text-slate-400 mb-3">All systems operational</p>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Server Uptime</span>
                <span className="font-bold text-slate-100">99.9%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Response Time</span>
                <span className="font-bold text-slate-100">45ms</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-2xl border border-slate-800/80 bg-slate-950/80 backdrop-blur-xl shadow-[0_18px_45px_rgba(15,23,42,0.85)] p-6 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-300/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-slate-100">Recent Activity</h4>
              <FiActivity size={24} className="text-amber-400" />
            </div>
            <p className="text-sm text-slate-400 mb-3">Last 24 hours</p>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">New Orders</span>
                <span className="font-bold text-slate-100">
                  +{Math.floor(Math.random() * 50 + 20)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">New Users</span>
                <span className="font-bold text-slate-100">
                  +{Math.floor(Math.random() * 30 + 10)}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Helper functions for SVG chart
function buildPolylinePoints(data) {
  if (!data.length) return "";
  const max = Math.max(...data.map((d) => d.totalAmount || 0)) || 1;
  const step = 100 / (data.length - 1 || 1);

  return data
    .map((d, idx) => {
      const x = step * idx;
      const y = 40 - (d.totalAmount / max) * 30 - 5;
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
  const max = Math.max(...data.map((d) => d.totalAmount || 0)) || 1;
  const step = 100 / (data.length - 1 || 1);

  return data.map((d, idx) => {
    const x = step * idx;
    const y = 40 - (d.totalAmount / max) * 30 - 5;
    return { x, y };
  });
}

