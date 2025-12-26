import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminAuth } from "../context/AdminAuthContext";
import {
  FiUsers,
  FiSearch,
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
  FiMail,
  FiCalendar,
  FiShoppingBag,
  FiUser,
  FiPhone,
} from "react-icons/fi";

const BASE_API_URL =
  import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

const getStatusStyle = (status) => {
  const styles = {
    APPROVED: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    PENDING: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    REJECTED: "bg-rose-500/10 text-rose-300 border-rose-500/30",
  };
  return styles[status] || "bg-slate-700/40 text-slate-300 border-slate-600/30";
};

export default function AdminSellers() {
  const { token } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [sellers, setSellers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    if (!token) return;
    fetchSellers(page, search, statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, page, statusFilter]);

  const fetchSellers = async (pageNum = 1, q = "", status = "ALL") => {
    try {
      setLoading(true);
      const params = { page: pageNum, limit };
      if (q && q.trim()) params.search = q.trim();
      if (status !== "ALL") params.status = status;

      const res = await axios.get(`${BASE_API_URL}/api/admin/sellers`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });

      setSellers(res.data.sellers || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error("Admin fetch sellers error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchSellers(1, search, statusFilter);
  };

  const pages = Math.max(1, Math.ceil(total / limit));
  const totalApproved = sellers.filter((s) => s.status === "APPROVED").length;

  return (
    <div className="space-y-4 w-full">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg flex-shrink-0">
            <FiUsers className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-100">
              Sellers Management
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Onboarded sellers and approval status
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-slate-900/70 border border-slate-700 text-slate-300">
            <span className="text-slate-500">Total:</span>{" "}
            <span className="font-semibold text-teal-300">{total}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/40 text-emerald-300">
            <span className="text-emerald-400/80">Approved:</span>{" "}
            <span className="font-bold">{totalApproved}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-900/70 border border-slate-700 text-slate-400">
            Page {page}/{pages}
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <motion.form
        onSubmit={handleSearchSubmit}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 backdrop-blur-xl"
      >
        <div className="space-y-3">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name, email or shop..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800/60 border border-slate-700 rounded-lg pl-10 pr-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg pl-10 pr-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition appearance-none"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <button
              type="submit"
              className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-sm font-bold px-4 py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all active:scale-95"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </motion.form>

      {/* Desktop Table (>= 768px) */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="hidden md:block rounded-2xl border border-slate-800 bg-slate-950/80 backdrop-blur-xl shadow-[0_18px_45px_rgba(15,23,42,0.85)] overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-900/90 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3 text-left text-slate-400 font-medium">Seller</th>
                <th className="px-4 py-3 text-left text-slate-400 font-medium">Email</th>
                <th className="px-4 py-3 text-left text-slate-400 font-medium">Shop Name</th>
                <th className="px-4 py-3 text-left text-slate-400 font-medium">Phone</th>
                <th className="px-4 py-3 text-left text-slate-400 font-medium">Status</th>
                <th className="px-4 py-3 text-left text-slate-400 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
                      <span>Loading sellers...</span>
                    </div>
                  </td>
                </tr>
              ) : sellers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    <FiUsers size={32} className="text-slate-600 mx-auto mb-2" />
                    <p>No sellers found</p>
                  </td>
                </tr>
              ) : (
                sellers.map((s, idx) => (
                  <motion.tr
                    key={s._id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.02 * idx }}
                    className="border-b border-slate-800/60 hover:bg-slate-900/70 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {s.fullName?.[0]?.toUpperCase() || "S"}
                        </div>
                        <div>
                          <p className="font-medium text-slate-100">{s.fullName || "Unknown"}</p>
                          <p className="text-[11px] text-slate-500 font-mono">ID: {s._id?.slice(-6)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-300 text-xs max-w-[200px] truncate">{s.email}</td>
                    <td className="px-4 py-3 text-slate-300">{s.shopName || "-"}</td>
                    <td className="px-4 py-3 text-slate-300 text-xs">{s.phone || "-"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getStatusStyle(s.status)}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[11px] text-slate-300">
                      {s.createdAt ? new Date(s.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" }) : "-"}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800 text-xs text-slate-400">
          <span>Page <span className="font-semibold text-slate-200">{page}</span> of <span className="font-semibold text-slate-200">{pages}</span></span>
          <div className="flex items-center gap-2">
            <button type="button" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-900 transition text-slate-300">
              <FiChevronLeft size={14} />Prev
            </button>
            <button type="button" disabled={page === pages} onClick={() => setPage((p) => Math.min(pages, p + 1))} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-900 transition text-slate-300">
              Next<FiChevronRight size={14} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Mobile Card View */}
      <div className="md:hidden">
        <AnimatePresence>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <div className="w-10 h-10 border-2 border-teal-500/30 border-t-teal-500 rounded-full animate-spin mb-3" />
              <p className="text-xs">Loading sellers...</p>
            </div>
          ) : sellers.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-8 text-center backdrop-blur-xl">
              <FiUsers size={36} className="text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-400 font-medium">No sellers found</p>
              <p className="text-xs text-slate-500 mt-1">Try different filters</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sellers.map((s, idx) => (
                <motion.div key={s._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 backdrop-blur-xl shadow-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                                           <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0">
                        {s.fullName?.[0]?.toUpperCase() || "S"}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-100">{s.fullName || "Unknown"}</p>
                        <p className="text-[10px] text-slate-500 font-mono">ID: {s._id?.slice(-8)}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-[9px] font-bold border ${getStatusStyle(s.status)}`}>{s.status}</span>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-xs">
                      <FiMail className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      <span className="text-slate-300 truncate">{s.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <FiShoppingBag className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      <span className="text-slate-400">{s.shopName || "No shop"}</span>
                    </div>
                    {s.phone && (
                      <div className="flex items-center gap-2 text-xs">
                        <FiPhone className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                        <span className="text-slate-400">{s.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs">
                      <FiCalendar className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      <span className="text-slate-500 text-[11px]">
                        Joined {s.createdAt ? new Date(s.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                      </span>
                    </div>
                  </div>

                  <button className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all">
                    <FiUser size={14} />View Profile
                  </button>
                </motion.div>
              ))}

              {sellers.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 backdrop-blur-xl">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-3">
                    <span>Page <span className="font-semibold text-slate-200">{page}</span> / <span className="font-semibold text-slate-200">{pages}</span></span>
                    <span className="text-[10px]">{sellers.length} of {total}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-900 active:scale-95 transition text-xs font-semibold text-slate-300">
                      <FiChevronLeft size={14} />Previous
                    </button>
                    <button type="button" disabled={page === pages} onClick={() => setPage((p) => Math.min(pages, p + 1))} className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-900 active:scale-95 transition text-xs font-semibold text-slate-300">
                      Next<FiChevronRight size={14} />
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
