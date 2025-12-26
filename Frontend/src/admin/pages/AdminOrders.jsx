import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminAuth } from "../context/AdminAuthContext";
import {
  FiPackage,
  FiShoppingCart,
  FiUser,
  FiCalendar,
  FiDollarSign,
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiMail,
  FiBox,
  FiPhone,
  FiMapPin,
  FiCreditCard,
  FiX,
} from "react-icons/fi";

const BASE_API_URL =
  import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

const getStatusStyle = (status) => {
  const styles = {
    DELIVERED: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    CONFIRMED: "bg-blue-500/10 text-blue-300 border-blue-500/30",
    SHIPPED: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30",
    PENDING: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    CANCELLED: "bg-rose-500/10 text-rose-300 border-rose-500/30",
  };
  return styles[status] || "bg-slate-700/40 text-slate-300 border-slate-600/30";
};

export default function AdminOrders() {
  const { token } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState(null);

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
  const totalAmountPage = orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);

  return (
    <div className="space-y-4 w-full">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg flex-shrink-0">
            <FiShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-100">Orders Management</h2>
            <p className="text-xs text-slate-400 mt-0.5">Track all customer orders</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-slate-900/70 border border-slate-700 text-slate-300">
            <span className="text-slate-500">Total:</span> <span className="font-semibold text-amber-300">{total}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/40 text-emerald-300">
            <span className="text-emerald-400/80">Revenue:</span> <span className="font-bold">₹{totalAmountPage.toLocaleString("en-IN")}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-900/70 border border-slate-700 text-slate-400">Page {page}/{pages}</div>
        </div>
      </div>

      {/* Filter */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <FiFilter size={16} className="text-slate-400 flex-shrink-0" />
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="flex-1 bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition">
            <option value="ALL">All Orders</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </motion.div>

      {/* Desktop Table */}
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="hidden md:block rounded-2xl border border-slate-800 bg-slate-950/80 backdrop-blur-xl shadow-[0_18px_45px_rgba(15,23,42,0.85)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-900/90 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3 text-left text-slate-400 font-medium">Product</th>
                <th className="px-4 py-3 text-left text-slate-400 font-medium">Customer</th>
                <th className="px-4 py-3 text-left text-slate-400 font-medium">Amount</th>
                <th className="px-4 py-3 text-left text-slate-400 font-medium">Status</th>
                <th className="px-4 py-3 text-left text-slate-400 font-medium">Date</th>
                <th className="px-4 py-3 text-center text-slate-400 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500"><div className="flex items-center justify-center gap-2"><div className="w-5 h-5 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" /><span>Loading...</span></div></td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500"><FiShoppingCart size={32} className="text-slate-600 mx-auto mb-2" /><p>No orders found</p></td></tr>
              ) : (
                orders.map((o, idx) => (
                  <motion.tr key={o._id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.02 * idx }} className="border-b border-slate-800/60 hover:bg-slate-900/70 transition-colors cursor-pointer" onClick={() => setSelectedOrder(o)}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {o.items?.[0]?.image && (
                          <img src={o.items[0].image} alt={o.items[0].name} className="w-12 h-12 rounded-lg object-cover border border-slate-700" />
                        )}
                        <div>
                          <p className="font-medium text-slate-100 text-xs line-clamp-1">{o.items?.[0]?.name || "Product"}</p>
                          <p className="text-[11px] text-slate-500">{o.items?.length > 1 && `+${o.items.length - 1} more`}</p>
                          <p className="text-[10px] text-slate-500 font-mono">#{o._id?.slice(-8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-slate-200 font-medium">{o.name || o.user?.fullName || "-"}</span>
                        <span className="text-[11px] text-slate-500">{o.user?.email || o.email || ""}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-100 font-semibold">₹{(o.totalAmount || 0).toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getStatusStyle(o.status || o.orderStatus)}`}>
                        {o.status || o.orderStatus || "PENDING"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[11px] text-slate-300">
                      {o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" }) : "-"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={(e) => { e.stopPropagation(); setSelectedOrder(o); }} className="p-2 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 transition">
                        <FiEye size={16} />
                      </button>
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
            <button type="button" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-900 transition text-slate-300"><FiChevronLeft size={14} />Prev</button>
            <button type="button" disabled={page === pages} onClick={() => setPage((p) => Math.min(pages, p + 1))} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-900 transition text-slate-300">Next<FiChevronRight size={14} /></button>
          </div>
        </div>
      </motion.div>

      {/* Mobile Card View */}
      <div className="md:hidden">
        <AnimatePresence>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500"><div className="w-10 h-10 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mb-3" /><p className="text-xs">Loading...</p></div>
          ) : orders.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-8 text-center backdrop-blur-xl"><FiShoppingCart size={36} className="text-slate-600 mx-auto mb-3" /><p className="text-sm text-slate-400 font-medium">No orders found</p></div>
          ) : (
            <div className="space-y-3">
              {orders.map((o, idx) => (
                <motion.div key={o._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} exit={{ opacity: 0, scale: 0.95 }} onClick={() => setSelectedOrder(o)} className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 backdrop-blur-xl shadow-lg cursor-pointer active:scale-98">
                  <div className="flex items-start gap-3 mb-3">
                    {o.items?.[0]?.image && <img src={o.items[0].image} alt={o.items[0].name} className="w-16 h-16 rounded-lg object-cover border border-slate-700 flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-100 line-clamp-2">{o.items?.[0]?.name || "Product"}</p>
                      <p className="text-[10px] text-slate-500 mt-1">{o.items?.length > 1 && `+${o.items.length - 1} more items`}</p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">#{o._id?.slice(-8)}</p>
                    </div>
                                        <span className={`px-2 py-1 rounded-lg text-[9px] font-bold border flex-shrink-0 ${getStatusStyle(o.status || o.orderStatus)}`}>
                      {o.status || o.orderStatus || "PENDING"}
                    </span>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-xs">
                      <FiUser className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      <span className="text-slate-300 font-medium">{o.name || o.user?.fullName || "Unknown"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FiDollarSign className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        <span className="text-xs text-slate-100 font-bold">₹{(o.totalAmount || 0).toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiCalendar className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                        <span className="text-[11px] text-slate-400">{o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "-"}</span>
                      </div>
                    </div>
                  </div>

                  <button className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-semibold border border-amber-500/30 transition-all">
                    <FiEye size={14} />View Full Details
                  </button>
                </motion.div>
              ))}

              {orders.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 backdrop-blur-xl">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-3">
                    <span>Page <span className="font-semibold text-slate-200">{page}</span> / <span className="font-semibold text-slate-200">{pages}</span></span>
                    <span className="text-[10px]">{orders.length} of {total}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-900 active:scale-95 transition text-xs font-semibold text-slate-300"><FiChevronLeft size={14} />Previous</button>
                    <button type="button" disabled={page === pages} onClick={() => setPage((p) => Math.min(pages, p + 1))} className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-900 active:scale-95 transition text-xs font-semibold text-slate-300">Next<FiChevronRight size={14} /></button>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedOrder(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-slate-950 border border-slate-800 rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-100">Order Details</h3>
                <button onClick={() => setSelectedOrder(null)} className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition"><FiX className="w-5 h-5 text-slate-400" /></button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Products List */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2"><FiBox size={16} />Products ({selectedOrder.items?.length || 0})</h4>
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                    {selectedOrder.items?.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3 bg-slate-900/60 border border-slate-800 rounded-lg p-3">
                        {item.image && <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover border border-slate-700" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-200 line-clamp-2">{item.name}</p>
                          <p className="text-[11px] text-slate-400 mt-1">Qty: {item.qty} × ₹{item.price?.toLocaleString("en-IN")}</p>
                          <p className="text-[11px] text-emerald-400 font-semibold mt-1">₹{((item.qty || 1) * (item.price || 0)).toLocaleString("en-IN")}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Info */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2"><FiUser size={16} />Customer & Delivery</h4>
                  <div className="space-y-3 bg-slate-900/60 border border-slate-800 rounded-lg p-4">
                    <div className="flex items-start gap-2 text-xs">
                      <FiUser className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-slate-500">Name</p>
                        <p className="text-slate-200 font-medium">{selectedOrder.name || "N/A"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-xs">
                      <FiMail className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-slate-500">Email</p>
                        <p className="text-slate-200">{selectedOrder.user?.email || selectedOrder.email || "N/A"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-xs">
                      <FiPhone className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-slate-500">Mobile</p>
                        <p className="text-slate-200">{selectedOrder.mobile || selectedOrder.phone || "N/A"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-xs">
                      <FiMapPin className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-slate-500">Address</p>
                        <p className="text-slate-200">{selectedOrder.address || "N/A"}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 text-xs">
                      <FiCreditCard className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-slate-500">Payment</p>
                        <p className="text-slate-200">{selectedOrder.paymentMethod || "N/A"} - {selectedOrder.paymentStatus || "Pending"}</p>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-slate-800">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Total Amount</span>
                        <span className="text-emerald-400 font-bold text-lg">₹{(selectedOrder.totalAmount || 0).toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order ID & Status */}
              <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-400">
                  <span>Order ID: </span>
                  <span className="font-mono font-semibold text-slate-200">#{selectedOrder._id}</span>
                </div>
                <div className="text-xs text-slate-400">
                  <span>Ordered: </span>
                  <span className="text-slate-200">{selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "-"}</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

