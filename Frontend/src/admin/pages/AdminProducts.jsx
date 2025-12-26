import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminAuth } from "../context/AdminAuthContext";
import {
  FiPackage,
  FiSearch,
  FiTag,
  FiDollarSign,
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
  FiEdit2,
  FiTrash2,
  FiUser,
  FiCalendar,
  FiBox,
} from "react-icons/fi";

const BASE_API_URL =
  import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

const getStatusStyle = (stock) => {
  if (stock === 0) return "bg-rose-500/15 text-rose-300 border-rose-500/40";
  if (stock < 10) return "bg-amber-500/15 text-amber-300 border-amber-500/40";
  return "bg-emerald-500/10 text-emerald-300 border-emerald-500/30";
};

const getStatusLabel = (stock) => {
  if (stock === 0) return "Out of Stock";
  if (stock < 10) return "Low Stock";
  return "In Stock";
};

export default function AdminProducts() {
  const { token } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    if (!token) return;
    fetchProducts(page, search, categoryFilter, statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, page, statusFilter]);

  const fetchProducts = async (pageNum = 1, q = "", cat = "", status = "ALL") => {
    try {
      setLoading(true);
      const params = { page: pageNum, limit };
      if (q) params.search = q;
      if (cat) params.category = cat;
      if (status !== "ALL") params.status = status;

      const res = await axios.get(`${BASE_API_URL}/api/admin/products`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('Products data:', res.data.products); // Debug log
      setProducts(res.data.products || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error("Admin fetch products error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts(1, search, categoryFilter, statusFilter);
  };

  const pages = Math.max(1, Math.ceil(total / limit));
  const totalActive = products.filter((p) => p.stock > 0).length;

  return (
    <div className="space-y-4 w-full">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg flex-shrink-0">
            <FiPackage className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-100">
              Products Management
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Monitor and manage all products
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-slate-900/70 border border-slate-700 text-slate-300">
            <span className="text-slate-500">Total:</span>{" "}
            <span className="font-semibold text-purple-300">{total}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/40 text-emerald-300">
            <span className="text-emerald-400/80">In Stock:</span>{" "}
            <span className="font-bold">{totalActive}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-900/70 border border-slate-700 text-slate-400">
            Page {page}/{pages}
          </div>
        </div>
      </div>

      {/* Search & Filters */}
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
              placeholder="Search by product name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800/60 border border-slate-700 rounded-lg pl-10 pr-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="relative">
              <FiTag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Category..."
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg pl-10 pr-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition"
              />
            </div>

            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg pl-10 pr-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition appearance-none"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">In Stock</option>
                <option value="OUT_OF_STOCK">Out of Stock</option>
              </select>
            </div>

            <button
              type="submit"
              className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-bold px-4 py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all active:scale-95"
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
                <th className="px-4 py-3 text-left text-slate-400 font-medium">Product</th>
                <th className="px-4 py-3 text-left text-slate-400 font-medium">Category</th>
                <th className="px-4 py-3 text-left text-slate-400 font-medium">Price</th>
                <th className="px-4 py-3 text-left text-slate-400 font-medium">Stock</th>
                <th className="px-4 py-3 text-left text-slate-400 font-medium">Status</th>
                <th className="px-4 py-3 text-left text-slate-400 font-medium">Seller</th>
                <th className="px-4 py-3 text-right text-slate-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                      <span>Loading products...</span>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    <FiPackage size={32} className="text-slate-600 mx-auto mb-2" />
                    <p>No products found</p>
                  </td>
                </tr>
              ) : (
                products.map((p, idx) => (
                  <motion.tr
                    key={p._id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.02 * idx }}
                    className="border-b border-slate-800/60 hover:bg-slate-900/70 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.image && (
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-700"
                          />
                        )}
                        <div className="max-w-[200px]">
                          <p className="font-medium text-slate-100 truncate">{p.name}</p>
                          <p className="text-[11px] text-slate-500">
                            {new Date(p.createdAt).toLocaleDateString("en-IN")}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{p.category || "-"}</td>
                    <td className="px-4 py-3 text-slate-100 font-semibold">
                      ₹{p.price?.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3 text-slate-300">{p.stock ?? 0}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getStatusStyle(
                          p.stock
                        )}`}
                      >
                        {getStatusLabel(p.stock)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300 text-xs">
                      {/* ← YE FIX */}
                      {p.sellerId?.shopName || p.sellerId?.fullName || 
                       (typeof p.sellerId === 'string' ? p.sellerId.slice(-6) : '-')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                                                <button
                          type="button"
                          className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/30 transition"
                          title="Edit"
                        >
                          <FiEdit2 size={14} />
                        </button>
                        <button
                          type="button"
                          className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 transition"
                          title="Delete"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Desktop Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800 text-xs text-slate-400">
          <span>
            Page <span className="font-semibold text-slate-200">{page}</span> of{" "}
            <span className="font-semibold text-slate-200">{pages}</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-900 transition text-slate-300"
            >
              <FiChevronLeft size={14} />
              Prev
            </button>
            <button
              type="button"
              disabled={page === pages}
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-900 transition text-slate-300"
            >
              Next
              <FiChevronRight size={14} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Mobile Card View (< 768px) */}
      <div className="md:hidden">
        <AnimatePresence>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <div className="w-10 h-10 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-3" />
              <p className="text-xs">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-8 text-center backdrop-blur-xl">
              <FiPackage size={36} className="text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-400 font-medium">No products found</p>
              <p className="text-xs text-slate-500 mt-1">Try different filters</p>
            </div>
          ) : (
            <div className="space-y-3">
              {products.map((p, idx) => (
                <motion.div
                  key={p._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 backdrop-blur-xl shadow-lg"
                >
                  {/* Product Header */}
                  <div className="flex items-start gap-3 mb-3">
                    {p.image && (
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-16 h-16 rounded-lg object-cover border border-slate-700 flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-slate-100 mb-1 line-clamp-2">
                        {p.name}
                      </h3>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-lg text-[9px] font-bold border ${getStatusStyle(
                          p.stock
                        )}`}
                      >
                        {getStatusLabel(p.stock)}
                      </span>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-xs">
                      <FiTag className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      <span className="text-slate-400">
                        {p.category || "Uncategorized"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <FiDollarSign className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      <span className="text-slate-100 font-bold">
                        ₹{p.price?.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <FiBox className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      <span className="text-slate-400">
                        Stock: {p.stock ?? 0}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <FiUser className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      <span className="text-slate-400 truncate">
                        {/* ← SELLER INFO FIX */}
                        {p.sellerId?.shopName || p.sellerId?.fullName || 
                         (typeof p.sellerId === 'string' ? `ID: ${p.sellerId.slice(-6)}` : 'N/A')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <FiCalendar className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      <span className="text-slate-500 text-[11px]">
                        {new Date(p.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/30 transition text-xs font-semibold"
                    >
                      <FiEdit2 size={14} />
                      Edit
                    </button>
                    <button
                      type="button"
                      className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 transition text-xs font-semibold"
                    >
                      <FiTrash2 size={14} />
                      Delete
                    </button>
                  </div>
                </motion.div>
              ))}

              {/* Mobile Pagination */}
              {products.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 backdrop-blur-xl"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-3">
                    <span>
                      Page <span className="font-semibold text-slate-200">{page}</span> /{" "}
                      <span className="font-semibold text-slate-200">{pages}</span>
                    </span>
                    <span className="text-[10px]">
                      {products.length} of {total}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={page === 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-900 active:scale-95 transition text-xs font-semibold text-slate-300"
                    >
                      <FiChevronLeft size={14} />
                      Previous
                    </button>
                    <button
                      type="button"
                      disabled={page === pages}
                      onClick={() => setPage((p) => Math.min(pages, p + 1))}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-900 active:scale-95 transition text-xs font-semibold text-slate-300"
                    >
                      Next
                      <FiChevronRight size={14} />
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
