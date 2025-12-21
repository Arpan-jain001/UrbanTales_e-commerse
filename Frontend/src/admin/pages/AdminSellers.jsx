import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion"; 
import { useAdminAuth } from "../context/AdminAuthContext";

const BASE_API_URL =
  import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

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
      if (q) params.search = q;
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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-lg md:text-xl font-semibold text-slate-100">
            Sellers
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Onboarded sellers and their approval status.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
          <span className="px-2.5 py-1 rounded-full bg-slate-900/70 border border-slate-700">
            Total:{" "}
            <span className="font-semibold text-amber-300">{total}</span>
          </span>
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-emerald-300">
            Approved in page: {totalApproved}
          </span>
        </div>
      </div>

      {/* Filters */}
      <motion.form
        onSubmit={handleSearchSubmit}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row gap-3 md:items-center"
      >
        <input
          type="text"
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-72 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400/70"
        />
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
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <button
          type="submit"
          className="bg-amber-400 text-slate-950 text-sm font-semibold px-4 py-2 rounded-xl shadow hover:bg-amber-300 transition"
        >
          Apply
        </button>
      </motion.form>

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
                  Seller
                </th>
                <th className="px-3 py-2 text-left text-slate-400 font-medium">
                  Email
                </th>
                <th className="px-3 py-2 text-left text-slate-400 font-medium">
                  Shop
                </th>
                <th className="px-3 py-2 text-left text-slate-400 font-medium">
                  Status
                </th>
                <th className="px-3 py-2 text-left text-slate-400 font-medium">
                  Joined
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
                    Loading sellers...
                  </td>
                </tr>
              ) : sellers.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-6 text-center text-slate-500"
                  >
                    No sellers found.
                  </td>
                </tr>
              ) : (
                sellers.map((s, idx) => (
                  <motion.tr
                    key={s._id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.02 * idx }}
                    className="border-b border-slate-800/60 hover:bg-slate-900/70"
                  >
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[11px] text-slate-200">
                          {s.fullName?.[0]?.toUpperCase() ||
                            s.name?.[0]?.toUpperCase() ||
                            "S"}
                        </div>
                        <div>
                          <div className="font-medium text-slate-100 text-[13px]">
                            {s.fullName || s.name || "Unknown seller"}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            ID: {s._id?.slice(-6)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-slate-300">{s.email}</td>
                    <td className="px-3 py-2 text-slate-300">
                      {s.shopName || "-"}
                    </td>
                    <td className="px-3 py-2 text-[11px]">
                      <span
                        className={
                          s.status === "APPROVED"
                            ? "px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                            : s.status === "PENDING"
                            ? "px-2 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30"
                            : "px-2 py-1 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/30"
                        }
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-[11px] text-slate-300">
                      {s.createdAt
                        ? new Date(s.createdAt).toLocaleDateString("en-IN")
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
