import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion"; 
import { useAdminAuth } from "../context/AdminAuthContext";

const BASE_API_URL =
  import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

export default function AdminOrders() {
  const { token } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    if (!token) return;
    fetchOrders(page, statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, page, statusFilter]);

  const fetchOrders = async (pageNum = 1, status = "ALL") => {
    try {
      setLoading(true);
      const params = { page: pageNum, limit };
      if (status !== "ALL") params.status = status;

      const res = await axios.get(`${BASE_API_URL}/api/admin/orders`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrders(res.data.orders || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error("Admin fetch orders error:", err);
    } finally {
      setLoading(false);
    }
  };

  const pages = Math.max(1, Math.ceil(total / limit));
  const totalAmountPage = orders.reduce(
    (acc, o) => acc + (o.totalAmount || 0),
    0
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-lg md:text-xl font-semibold text-slate-100">
            Orders
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track all customer orders across UrbanTales.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
          <span className="px-2.5 py-1 rounded-full bg-slate-900/70 border border-slate-700">
            Total:{" "}
            <span className="font-semibold text-amber-300">{total}</span>
          </span>
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-emerald-300">
            Page revenue: ₹{totalAmountPage.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row gap-3 md:items-center"
      >
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="w-full md:w-44 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400/70"
        >
          <option value="ALL">All status</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-slate-800 bg-slate-950/80 backdrop-blur-xl shadow-[0_18px_45px_rgba(15,23,42,0.85)]"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs md:text-sm">
            <thead className="bg-slate-900/90 border-b border-slate-800">
              <tr>
                <th className="px-3 py-2 text-left text-slate-400 font-medium">
                  Order
                </th>
                <th className="px-3 py-2 text-left text-slate-400 font-medium">
                  User
                </th>
                <th className="px-3 py-2 text-left text-slate-400 font-medium">
                  Total
                </th>
                <th className="px-3 py-2 text-left text-slate-400 font-medium">
                  Status
                </th>
                <th className="px-3 py-2 text-left text-slate-400 font-medium">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-6 text-center text-slate-500"
                  >
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-6 text-center text-slate-500"
                  >
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((o, idx) => (
                  <motion.tr
                    key={o._id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.02 * idx }}
                    className="border-b border-slate-800/60 hover:bg-slate-900/70"
                  >
                    <td className="px-3 py-2">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-100 text-[13px]">
                          #{o._id?.slice(-8)}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Items: {o.items?.length || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-slate-300 text-[11px]">
                      {o.user?.fullName || o.user?.name || "-"}
                      <br />
                      <span className="text-slate-500">
                        {o.user?.email || ""}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-slate-300">
                      ₹{(o.totalAmount || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="px-3 py-2 text-[11px]">
                      <span
                        className={
                          o.status === "DELIVERED"
                            ? "px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                            : o.status === "CANCELLED"
                            ? "px-2 py-1 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/30"
                            : "px-2 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30"
                        }
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-[11px] text-slate-300">
                      {o.createdAt
                        ? new Date(o.createdAt).toLocaleString("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })
                        : "-"}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800 text-[11px] text-slate-400">
          <span>
            Page {page} of {pages}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-2 py-1 rounded-xl border border-slate-700 disabled:opacity-40 hover:bg-slate-900"
            >
              Prev
            </button>
            <button
              type="button"
              disabled={page === pages}
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              className="px-2 py-1 rounded-xl border border-slate-700 disabled:opacity-40 hover:bg-slate-900"
            >
              Next
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
