import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion"; 
import { useAdminAuth } from "../context/AdminAuthContext";

const BASE_API_URL =
  import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

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

  const fetchProducts = async (
    pageNum = 1,
    q = "",
    cat = "",
    status = "ALL"
  ) => {
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

  const totalActive = products.filter((p) => p.isActive !== false).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-lg md:text-xl font-semibold text-slate-100">
            Products
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Monitor and manage all products listed by sellers across UrbanTales.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
          <span className="px-2.5 py-1 rounded-full bg-slate-900/70 border border-slate-700">
            Total:{" "}
            <span className="font-semibold text-amber-300">{total}</span>
          </span>
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-emerald-300">
            Active in page: {totalActive}
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
          placeholder="Search by product name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-64 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400/70"
        />
        <input
          type="text"
          placeholder="Filter by category"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full md:w-48 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400/70"
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="w-full md:w-40 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400/70"
        >
          <option value="ALL">All status</option>
          <option value="ACTIVE">Active only</option>
          <option value="OUT_OF_STOCK">Out of stock</option>
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
                  Product
                </th>
                <th className="px-3 py-2 text-left text-slate-400 font-medium">
                  Category
                </th>
                <th className="px-3 py-2 text-left text-slate-400 font-medium">
                  Price
                </th>
                <th className="px-3 py-2 text-left text-slate-400 font-medium">
                  Stock
                </th>
                <th className="px-3 py-2 text-left text-slate-400 font-medium">
                  Status
                </th>
                <th className="px-3 py-2 text-left text-slate-400 font-medium">
                  Seller
                </th>
                <th className="px-3 py-2 text-right text-slate-400 font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-3 py-6 text-center text-slate-500"
                  >
                    Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-3 py-6 text-center text-slate-500"
                  >
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((p, idx) => (
                  <motion.tr
                    key={p._id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.02 * idx }}
                    className="border-b border-slate-800/60 hover:bg-slate-900/70"
                  >
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        {p.image && (
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-9 h-9 rounded-md object-cover border border-slate-800/80"
                          />
                        )}
                        <div>
                          <div className="font-medium text-slate-100 text-[13px]">
                            {p.name}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {new Date(p.createdAt).toLocaleDateString("en-IN")}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-slate-300">
                      {p.category || "-"}
                    </td>
                    <td className="px-3 py-2 text-slate-300">
                      ₹{p.price?.toLocaleString("en-IN")}
                    </td>
                    <td className="px-3 py-2 text-slate-300">
                      {p.stock ?? 0}
                    </td>
                    <td className="px-3 py-2 text-[11px]">
                      <span
                        className={
                          p.stock === 0
                            ? "px-2 py-1 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/40"
                            : "px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                        }
                      >
                        {p.stock === 0 ? "Out of stock" : "Active"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-slate-300 text-[11px]">
                      {p.sellerId || "-"}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        className="text-[11px] text-amber-300 hover:text-amber-200 mr-3"
                        // TODO: open edit modal
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="text-[11px] text-red-400 hover:text-red-300"
                        // TODO: confirm + delete
                      >
                        Delete
                      </button>
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
