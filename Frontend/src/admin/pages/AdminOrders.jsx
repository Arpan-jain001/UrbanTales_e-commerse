import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminAuth } from "../context/AdminAuthContext";
import {
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiCreditCard,
  FiDollarSign,
  FiEye,
  FiFilter,
  FiMail,
  FiMapPin,
  FiPackage,
  FiPhone,
  FiShoppingCart,
  FiUser,
  FiX,
} from "react-icons/fi";

const BASE_API_URL =
  import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

const normalizeStatusKey = (status) =>
  String(status || "").replace(/\s+/g, "_").toUpperCase();

const getStatusStyle = (status) => {
  const styles = {
    DELIVERED: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    PLACED: "bg-blue-500/10 text-blue-300 border-blue-500/30",
    SHIPPED: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30",
    OUT_FOR_DELIVERY: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
    PENDING: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    CANCELLED: "bg-rose-500/10 text-rose-300 border-rose-500/30",
    RETURNED: "bg-yellow-500/10 text-yellow-300 border-yellow-500/30",
    REQUESTED: "bg-yellow-500/10 text-yellow-300 border-yellow-500/30",
    PICKUP_SCHEDULED: "bg-orange-500/10 text-orange-300 border-orange-500/30",
    PICKED_UP: "bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/30",
    REFUND_INITIATED: "bg-violet-500/10 text-violet-300 border-violet-500/30",
    REFUNDED: "bg-sky-500/10 text-sky-300 border-sky-500/30",
  };
  return styles[normalizeStatusKey(status)] || "bg-slate-700/40 text-slate-300 border-slate-600/30";
};

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Orders" },
  { value: "PENDING", label: "Pending" },
  { value: "PLACED", label: "Placed" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "OUT FOR DELIVERY", label: "Out for Delivery" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "RETURNED", label: "Returned" },
];

export default function AdminOrders() {
  const { token } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async (pageNum = 1, status = "ALL") => {
    try {
      setLoading(true);
      const params = { page: pageNum, limit };
      if (status !== "ALL") {
        params.status = status;
      }

      const res = await axios.get(`${BASE_API_URL}/api/admin/orders`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrders(Array.isArray(res.data.orders) ? res.data.orders : []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error("Admin fetch orders error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchOrders(page, statusFilter);
  }, [token, page, statusFilter]);

  const pages = Math.max(1, Math.ceil(total / limit));
  const totalAmountPage = orders.reduce(
    (acc, order) => acc + Number(order.totalAmount || 0),
    0
  );

  return (
    <div className="space-y-4 w-full">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg flex-shrink-0">
            <FiShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-100">Orders Management</h2>
            <p className="text-xs text-slate-400 mt-0.5">Track customer orders, returns, gift usage and refunds</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-slate-900/70 border border-slate-700 text-slate-300">
            <span className="text-slate-500">Total:</span> <span className="font-semibold text-amber-300">{total}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/40 text-emerald-300">
            <span className="text-emerald-400/80">Revenue on page:</span> <span className="font-bold">₹{totalAmountPage.toLocaleString("en-IN")}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-900/70 border border-slate-700 text-slate-400">Page {page}/{pages}</div>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <FiFilter size={16} className="text-slate-400 flex-shrink-0" />
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="flex-1 bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition">
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </motion.div>

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
                orders.map((order, idx) => (
                  <motion.tr key={order._id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.02 * idx }} className="border-b border-slate-800/60 hover:bg-slate-900/70 transition-colors cursor-pointer" onClick={() => setSelectedOrder(order)}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {order.items?.[0]?.image ? (
                          <img src={order.items[0].image} alt={order.items[0].name} className="w-12 h-12 rounded-lg object-cover border border-slate-700" />
                        ) : null}
                        <div>
                          <p className="font-medium text-slate-100 text-xs line-clamp-1">{order.items?.[0]?.name || "Product"}</p>
                          <p className="text-[11px] text-slate-500">{order.items?.length > 1 ? `+${order.items.length - 1} more` : "Single item"}</p>
                          <p className="text-[10px] text-slate-500 font-mono">#{order.orderId || order._id?.slice(-8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-slate-200 font-medium">{order.name || order.user?.fullName || "-"}</span>
                        <span className="text-[11px] text-slate-500">{order.user?.email || ""}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-100 font-semibold">₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-2">
                        <span className={`w-fit px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getStatusStyle(order.orderStatus)}`}>
                          {order.orderStatus || "Pending"}
                        </span>
                        {order.returnStatus ? (
                          <span className={`w-fit px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getStatusStyle(order.returnStatus)}`}>
                            Return: {order.returnStatus}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[11px] text-slate-300">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" }) : "-"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={(event) => { event.stopPropagation(); setSelectedOrder(order); }} className="p-2 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30 transition">
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
            <button type="button" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-900 transition text-slate-300"><FiChevronLeft size={14} />Prev</button>
            <button type="button" disabled={page === pages} onClick={() => setPage((current) => Math.min(pages, current + 1))} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-900 transition text-slate-300">Next<FiChevronRight size={14} /></button>
          </div>
        </div>
      </motion.div>

      <div className="md:hidden">
        <AnimatePresence>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500"><div className="w-10 h-10 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mb-3" /><p className="text-xs">Loading...</p></div>
          ) : orders.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-8 text-center backdrop-blur-xl"><FiShoppingCart size={36} className="text-slate-600 mx-auto mb-3" /><p className="text-sm text-slate-400 font-medium">No orders found</p></div>
          ) : (
            <div className="space-y-3">
              {orders.map((order, idx) => (
                <motion.div key={order._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} exit={{ opacity: 0, scale: 0.95 }} onClick={() => setSelectedOrder(order)} className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 backdrop-blur-xl shadow-lg cursor-pointer active:scale-98">
                  <div className="flex items-start gap-3 mb-3">
                    {order.items?.[0]?.image ? <img src={order.items[0].image} alt={order.items[0].name} className="w-16 h-16 rounded-lg object-cover border border-slate-700 flex-shrink-0" /> : null}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-100 line-clamp-2">{order.items?.[0]?.name || "Product"}</p>
                      <p className="text-[10px] text-slate-500 mt-1">{order.items?.length > 1 ? `+${order.items.length - 1} more items` : "Single item"}</p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">#{order.orderId || order._id?.slice(-8)}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-[9px] font-bold border flex-shrink-0 ${getStatusStyle(order.orderStatus)}`}>
                      {order.orderStatus || "Pending"}
                    </span>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-xs">
                      <FiUser className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      <span className="text-slate-300 font-medium">{order.name || order.user?.fullName || "Unknown"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FiDollarSign className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        <span className="text-xs text-slate-100 font-bold">₹{Number(order.totalAmount || 0).toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiCalendar className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                        <span className="text-[11px] text-slate-400">{order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "-"}</span>
                      </div>
                    </div>
                    {order.returnStatus ? (
                      <div className="pt-1">
                        <span className={`inline-flex px-2 py-1 rounded-lg text-[10px] font-bold border ${getStatusStyle(order.returnStatus)}`}>
                          Return: {order.returnStatus}
                        </span>
                      </div>
                    ) : null}
                  </div>

                  <button className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-semibold border border-amber-500/30 transition-all">
                    <FiEye size={14} />View Full Details
                  </button>
                </motion.div>
              ))}

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 backdrop-blur-xl">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-3">
                  <span>Page <span className="font-semibold text-slate-200">{page}</span> / <span className="font-semibold text-slate-200">{pages}</span></span>
                  <span className="text-[10px]">{orders.length} of {total}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-900 active:scale-95 transition text-xs font-semibold text-slate-300"><FiChevronLeft size={14} />Previous</button>
                  <button type="button" disabled={page === pages} onClick={() => setPage((current) => Math.min(pages, current + 1))} className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-900 active:scale-95 transition text-xs font-semibold text-slate-300">Next<FiChevronRight size={14} /></button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selectedOrder ? (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedOrder(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} onClick={(event) => event.stopPropagation()} className="bg-slate-950 border border-slate-800 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-100">Order Details</h3>
                <button onClick={() => setSelectedOrder(null)} className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition"><FiX className="w-5 h-5 text-slate-400" /></button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2"><FiPackage size={16} />Products ({selectedOrder.items?.length || 0})</h4>
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                    {selectedOrder.items?.map((item, idx) => (
                      <div key={`${item.id}-${idx}`} className="flex items-start gap-3 bg-slate-900/60 border border-slate-800 rounded-lg p-3">
                        {item.image ? <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover border border-slate-700" /> : null}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-200 line-clamp-2">{item.name}</p>
                          <p className="text-[11px] text-slate-400 mt-1">Qty: {item.qty} × ₹{Number(item.price || 0).toLocaleString("en-IN")}</p>
                          <p className="text-[11px] text-slate-400 mt-1">Size: {item.selectedSize || "N/A"} | Color: {item.selectedColor || "N/A"}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-semibold border ${getStatusStyle(item.status || selectedOrder.orderStatus)}`}>
                              {item.status || selectedOrder.orderStatus}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2"><FiUser size={16} />Customer & Payment</h4>
                  <div className="space-y-3 bg-slate-900/60 border border-slate-800 rounded-lg p-4">
                    <InfoRow icon={<FiUser className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />} label="Name" value={selectedOrder.name || "N/A"} />
                    <InfoRow icon={<FiMail className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />} label="Email" value={selectedOrder.user?.email || "N/A"} />
                    <InfoRow icon={<FiPhone className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />} label="Mobile" value={selectedOrder.mobile || "N/A"} />
                    <InfoRow icon={<FiMapPin className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />} label="Address" value={selectedOrder.address || "N/A"} />
                    <InfoRow icon={<FiCreditCard className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />} label="Payment" value={`${selectedOrder.paymentMethod || "N/A"} - ${selectedOrder.paymentStatus || "Pending"}`} />
                    <InfoRow icon={<FiDollarSign className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />} label="Gift Balance Used" value={`₹${Number(selectedOrder.giftBalanceUsed || 0).toLocaleString("en-IN")}`} />
                    <InfoRow icon={<FiDollarSign className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />} label="Gift Refund Credited" value={`₹${Number(selectedOrder.giftBalanceRefunded || 0).toLocaleString("en-IN")}`} />
                    <InfoRow icon={<FiPackage className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />} label="Tracking" value={selectedOrder.trackingInfo || "Not available"} />
                    {selectedOrder.cancelReason ? <InfoRow icon={<FiX className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />} label="Cancel Reason" value={selectedOrder.cancelReason} /> : null}
                    {selectedOrder.returnReason ? <InfoRow icon={<FiPackage className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />} label="Return Reason" value={selectedOrder.returnReason} /> : null}
                    {selectedOrder.returnStatus ? <InfoRow icon={<FiPackage className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />} label="Return Status" value={selectedOrder.returnStatus} /> : null}

                    <div className="pt-3 border-t border-slate-800">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Total Amount</span>
                        <span className="text-emerald-400 font-bold text-lg">₹{Number(selectedOrder.totalAmount || 0).toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <TimelineCard title="Order Timeline" items={selectedOrder.statusTimeline || []} emptyLabel="No order timeline yet." />
                <TimelineCard title="Return Timeline" items={selectedOrder.returnTimeline || []} emptyLabel="No return timeline yet." />
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-400">
                  <span>Order ID: </span>
                  <span className="font-mono font-semibold text-slate-200">#{selectedOrder.orderId || selectedOrder._id}</span>
                </div>
                <div className="text-xs text-slate-400">
                  <span>Ordered: </span>
                  <span className="text-slate-200">{selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "-"}</span>
                </div>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-2 text-xs">
      {icon}
      <div>
        <p className="text-slate-500">{label}</p>
        <p className="text-slate-200 break-words">{value}</p>
      </div>
    </div>
  );
}

function TimelineCard({ title, items, emptyLabel }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <h4 className="text-sm font-semibold text-slate-200">{title}</h4>
      {items.length === 0 ? (
        <p className="mt-3 text-xs text-slate-500">{emptyLabel}</p>
      ) : (
        <div className="mt-3 space-y-3">
          {items.map((item, idx) => (
            <div key={`${item.status}-${item.createdAt}-${idx}`} className="rounded-lg border border-slate-800 bg-slate-950/70 p-3">
              <div className="flex items-center justify-between gap-3">
                <span className={`px-2 py-1 rounded-full text-[10px] font-semibold border ${getStatusStyle(item.status)}`}>
                  {item.status}
                </span>
                <span className="text-[10px] text-slate-500">
                  {item.createdAt ? new Date(item.createdAt).toLocaleString("en-IN") : ""}
                </span>
              </div>
              {item.note ? <p className="mt-2 text-xs text-slate-400">{item.note}</p> : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
