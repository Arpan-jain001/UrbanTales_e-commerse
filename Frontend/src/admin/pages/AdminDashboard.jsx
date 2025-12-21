import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion"; 
import { useAdminAuth } from "../context/AdminAuthContext";

const BASE_API_URL =
  import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

export default function AdminDashboard() {
  const { token, admin } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [dailySales, setDailySales] = useState([]);

  useEffect(() => {
    if (!token) return;

    const headers = { Authorization: `Bearer ${token}` };

    async function fetchData() {
      try {
        const [ov, ds] = await Promise.all([
          axios.get(`${BASE_API_URL}/api/admin/stats/overview`, { headers }),
          axios.get(
            `${BASE_API_URL}/api/admin/stats/sales/daily?days=7`,
            { headers }
          ),
        ]);

        setOverview(ov.data);
        setDailySales(ds.data || []);
      } catch (err) {
        console.error("Admin dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [token]);

  const cards = [
    {
      label: "Total Users",
      key: "totalUsers",
      gradient: "from-sky-400 to-blue-500",
      chip: "Platform customers",
    },
    {
      label: "Total Sellers",
      key: "totalSellers",
      gradient: "from-emerald-400 to-teal-500",
      chip: "Active partners",
    },
    {
      label: "Total Products",
      key: "totalProducts",
      gradient: "from-amber-300 to-orange-500",
      chip: "Live listings",
    },
    {
      label: "Total Orders",
      key: "totalOrders",
      gradient: "from-pink-400 to-rose-500",
      chip: "All time",
    },
    {
      label: "Total Revenue",
      key: "totalRevenue",
      gradient: "from-purple-400 to-indigo-500",
      chip: "Completed orders",
      format: (v) => `₹${v?.toLocaleString("en-IN")}`,
    },
    {
      label: "Today’s Sales",
      key: "todaySales",
      gradient: "from-lime-400 to-emerald-500",
      chip: "Since midnight",
      format: (v) => `₹${v?.toLocaleString("en-IN")}`,
    },
  ];

  const total7d = dailySales.reduce(
    (acc, d) => acc + (d.totalAmount || 0),
    0
  );

  return (
    <div className="relative space-y-6">
      {/* soft animated background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0_0,#22c55e0f_0,transparent_55%),radial-gradient(circle_at_100%_100%,#6366f10f_0,transparent_55%)]" />
      </div>

      {/* Top heading */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-semibold text-slate-100">
            Welcome,{" "}
            <span className="bg-linear-to-r from-amber-300 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
              {admin?.fullName || admin?.username}
            </span>
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Real-time overview of UrbanTales users, sellers, products and orders.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <div className="px-3 py-1 rounded-full border border-slate-700/80 bg-slate-900/60">
            Role:{" "}
            <span className="font-semibold text-amber-300">{admin?.role}</span>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live environment
          </div>
        </div>
      </div>

      {/* Overview cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card, idx) => {
          const value = overview?.[card.key] ?? 0;
          const display = card.format ? card.format(value) : value;
          return (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.04 * idx, duration: 0.35 }}
              whileHover={{ y: -4, scale: 1.01 }}
              className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/80 backdrop-blur-xl group shadow-[0_18px_45px_rgba(15,23,42,0.85)]"
            >
              <div
                className={`absolute inset-0 bg-linear-to-br ${card.gradient} opacity-10 group-hover:opacity-20 transition`}
              />
              <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-slate-900/40 blur-2xl group-hover:bg-slate-800/40 transition" />
              <div className="relative p-4 md:p-5 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-slate-400">{card.label}</p>
                  {card.chip && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-900/80 border border-slate-700/80 text-slate-400">
                      {card.chip}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-2xl font-semibold text-slate-50">
                  {loading ? "…" : display}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Sales chart + summary */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.4 }}
        className="rounded-2xl border border-slate-800 bg-slate-950/85 backdrop-blur-xl p-4 md:p-5 shadow-[0_18px_45px_rgba(15,23,42,0.85)]"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">
              Last 7 days sales
            </h3>
            <p className="text-xs text-slate-400">
              Daily revenue trend from delivered/completed orders.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[11px]">
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              7d total: {`₹${total7d.toLocaleString("en-IN")}`}
            </span>
            <span className="px-2.5 py-1 rounded-full bg-slate-900/60 text-slate-300 border border-slate-700">
              Points: {dailySales.length || 0}
            </span>
          </div>
        </div>

        <div className="h-48 md:h-56 relative">
          {dailySales.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-500">
              {loading
                ? "Loading sales data..."
                : "No sales data available yet."}
            </div>
          ) : (
            <svg
              viewBox="0 0 100 40"
              className="w-full h-full text-emerald-400"
              preserveAspectRatio="none"
            >
              {/* area under curve */}
              <polygon
                fill="url(#grad)"
                opacity="0.22"
                points={buildAreaPoints(dailySales)}
              />
              {/* line */}
              <polyline
                fill="none"
                stroke="currentColor"
                strokeWidth="0.7"
                strokeLinecap="round"
                points={buildPolylinePoints(dailySales)}
              />
              {/* circles */}
              {buildCirclePoints(dailySales).map((p, idx) => (
                <circle
                  key={idx}
                  cx={p.x}
                  cy={p.y}
                  r="0.8"
                  fill="#22c55e"
                  opacity="0.9"
                />
              ))}
              <defs>
                <linearGradient id="grad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          )}
        </div>

        {dailySales.length > 0 && (
          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] text-slate-400">
            <div>
              <p className="text-slate-500">Best day</p>
              <p className="text-slate-100">
                ₹
                {Math.max(
                  ...dailySales.map((d) => d.totalAmount || 0)
                ).toLocaleString("en-IN")}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Average per day</p>
              <p className="text-slate-100">
                ₹
                {Math.round(
                  total7d / (dailySales.length || 1)
                ).toLocaleString("en-IN")}
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
                {(dailySales[dailySales.length - 1]?.totalAmount || 0).toLocaleString(
                  "en-IN"
                )}
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// Helpers for SVG chart
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
