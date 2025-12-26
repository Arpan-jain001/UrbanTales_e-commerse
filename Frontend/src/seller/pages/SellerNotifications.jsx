import React, { useEffect, useState, useMemo } from "react";
import { Bell, CheckCheck, Filter, Trash2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSellerAuth } from "../context/SellerAuthContext";
import SellerNavbar from "../components/SellerNavbar";
import SellerFooter from "../components/SellerFooter";

const BASE_API_URL =
  import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

const containerVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
      when: "beforeChildren",
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.2, ease: "easeOut" },
  },
};

const FILTERS = [
  { key: "all", label: "All", color: "bg-indigo-600" },
  { key: "unread", label: "Unread", color: "bg-amber-500" },
  { key: "read", label: "Read", color: "bg-slate-400" },
];

const getSourceMeta = (notif) => {
  if (notif.senderType === "ADMIN") {
    return {
      label: notif.senderName || "Admin",
      bg: "bg-gradient-to-br from-sky-50 to-blue-50",
      border: "border-sky-300",
      text: "text-sky-700",
      dot: "bg-sky-500",
      glow: "shadow-[0_0_18px_rgba(14,165,233,0.4)]",
    };
  }
  return {
    label: "System",
    bg: "bg-gradient-to-br from-emerald-50 to-teal-50",
    border: "border-emerald-300",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    glow: "shadow-[0_0_14px_rgba(52,211,153,0.35)]",
  };
};

const SellerNotifications = () => {
  const { token } = useSellerAuth();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      setError("Please login to view notifications.");
      setLoading(false);
      return;
    }

    const fetchNotifications = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${BASE_API_URL}/api/sellers/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          setError("Error loading notifications.");
          setLoading(false);
          return;
        }
        const data = await res.json();
        setNotifications(Array.isArray(data) ? data : []);
        setLoading(false);

        // Auto mark unread as read
        const unreadIds = (data || [])
          .filter((n) => !n.isRead)
          .map((n) => n._id);
        if (unreadIds.length) {
          await fetch(`${BASE_API_URL}/api/sellers/notifications/mark-read`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ ids: unreadIds }),
          });
        }
      } catch (err) {
        console.error(err);
        setError("Error loading notifications.");
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [token]);

  const markAsRead = async (id) => {
    if (!token) return;

    try {
      await fetch(`${BASE_API_URL}/api/sellers/notifications/mark-read`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids: [id] }),
      });

      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    if (!token) return;
    const ids = notifications.filter((n) => !n.isRead).map((n) => n._id);
    if (!ids.length) return;

    try {
      await fetch(`${BASE_API_URL}/api/sellers/notifications/mark-read`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids }),
      });

      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNotification = async (id) => {
    if (!token) return;

    setNotifications((prev) => prev.filter((n) => n._id !== id));

    try {
      await fetch(`${BASE_API_URL}/api/sellers/notifications/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications = useMemo(() => {
    let list = [...notifications].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    if (filter === "unread") return list.filter((n) => !n.isRead);
    if (filter === "read") return list.filter((n) => n.isRead);
    return list;
  }, [notifications, filter]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      <SellerNavbar />

      <main className="flex-1 px-4 py-8">
        <div className="max-w-5xl mx-auto w-full relative">
          {/* Soft animated background blobs */}
          <div className="pointer-events-none absolute -top-20 left-10 w-72 h-72 bg-gradient-to-br from-purple-300/20 to-pink-300/20 rounded-full blur-3xl" />
          <div className="pointer-events-none absolute top-40 -right-20 w-80 h-80 bg-gradient-to-br from-blue-300/15 to-cyan-300/15 rounded-full blur-3xl" />

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <div className="overflow-hidden rounded-3xl bg-white/90 shadow-2xl border border-indigo-100 backdrop-blur-md">
              {/* Gradient accent top */}
              <div className="absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_20%_10%,_rgba(124,58,237,0.15),_transparent_55%),radial-gradient(circle_at_80%_10%,_rgba(59,130,246,0.12),_transparent_55%)] pointer-events-none" />

              {/* Header */}
              <div className="relative p-5 md:p-7 border-b border-indigo-50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <motion.div
                      initial={{ rotate: -10, scale: 0.9 }}
                      animate={{ rotate: 0, scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                      className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-lg"
                    >
                      <Bell className="w-6 h-6" />
                    </motion.div>
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-purple-100 to-indigo-100 border border-purple-200 mb-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                        <span className="text-[10px] uppercase tracking-wider text-purple-700 font-bold">
                          Seller Notifications
                        </span>
                      </div>
                      <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent">
                        Your Alerts & Updates
                      </h2>
                      <p className="text-xs md:text-sm text-slate-500 mt-1">
                        Important messages from UrbanTales Admin & system alerts.
                      </p>
                    </div>
                  </div>

                  {!loading && notifications.length > 0 && (
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      whileHover={{ scale: 1.02 }}
                      onClick={markAllAsRead}
                      className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 md:px-5 py-2.5 md:py-3 text-sm font-semibold shadow-lg hover:shadow-xl transition"
                    >
                      <CheckCheck className="w-4 h-4" />
                      <span>Mark all as read</span>
                    </motion.button>
                  )}
                </div>

                {/* Filter pills */}
                {!loading && notifications.length > 0 && (
                  <div className="flex items-center gap-2 mt-5">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <div className="flex gap-2 flex-wrap">
                      {FILTERS.map((f) => (
                        <motion.button
                          key={f.key}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setFilter(f.key)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                            filter === f.key
                              ? `${f.color} text-white border-transparent shadow-md`
                              : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          {f.label}
                        </motion.button>
                      ))}
                    </div>
                    {unreadCount > 0 && (
                      <span className="ml-auto text-xs font-semibold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-full border border-purple-200">
                        {unreadCount} unread
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="relative p-5 md:p-7">
                {loading && (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                    <div className="relative mb-4">
                      <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
                      <div className="absolute inset-0 blur-lg bg-purple-400/20 rounded-full animate-pulse" />
                    </div>
                    <p className="text-sm font-medium">Loading notifications...</p>
                  </div>
                )}

                {!loading && error && (
                  <div className="text-center py-12 text-red-600 text-sm">
                    <p className="font-medium">{error}</p>
                  </div>
                )}

                {!loading && !error && filteredNotifications.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mb-4">
                      <Bell className="w-7 h-7 text-slate-400" />
                    </div>
                    <p className="text-base font-semibold text-slate-700">
                      {filter === "all"
                        ? "No notifications yet"
                        : `No ${filter} notifications`}
                    </p>
                    <p className="text-xs mt-1.5 text-slate-400">
                      {filter === "all"
                        ? "Admin messages and alerts will appear here."
                        : "Try changing the filter to see more."}
                    </p>
                  </div>
                )}

                {!loading && !error && filteredNotifications.length > 0 && (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-4"
                  >
                    <AnimatePresence>
                      {filteredNotifications.map((notif, idx) => {
                        const src = getSourceMeta(notif);
                        return (
                          <motion.div
                            key={notif._id}
                            variants={itemVariants}
                            layout
                            exit={{ opacity: 0, x: -30, scale: 0.95 }}
                            transition={{ duration: 0.25 }}
                                                        className={`
                              relative group overflow-hidden rounded-2xl border-2
                              transition-all duration-300
                              hover:-translate-y-1 hover:shadow-2xl
                              ${
                                notif.isRead
                                  ? "bg-slate-50/80 border-slate-200"
                                  : "bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-300 shadow-md"
                              }
                            `}
                          >
                            {/* Animated gradient background blob (unread only) */}
                            {!notif.isRead && (
                              <motion.div
                                className="absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-br from-purple-300/30 to-pink-300/30 rounded-full blur-2xl"
                                animate={{
                                  scale: [1, 1.1, 1],
                                  rotate: [0, 10, 0],
                                }}
                                transition={{
                                  duration: 4,
                                  repeat: Infinity,
                                  ease: "easeInOut",
                                }}
                              />
                            )}

                            {/* Source chip top-right */}
                            <div className="absolute right-3 top-3 z-10">
                              <div
                                className={`
                                  inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 text-[10px] font-bold uppercase tracking-wider
                                  backdrop-blur-md
                                  ${src.bg} ${src.border} ${src.text} ${src.glow}
                                `}
                              >
                                <span
                                  className={`w-2 h-2 rounded-full ${src.dot} animate-pulse`}
                                />
                                <span>{src.label}</span>
                              </div>
                            </div>

                            {/* Left accent bar (unread) */}
                            {!notif.isRead && (
                              <span className="absolute left-0 top-4 bottom-4 w-1 rounded-full bg-gradient-to-b from-purple-500 to-indigo-500" />
                            )}

                            <div className="relative p-4 md:p-5 flex items-start gap-4">
                              {/* Bell icon */}
                              <motion.div
                                whileHover={{ rotate: [0, -15, 15, 0] }}
                                transition={{ duration: 0.4 }}
                                className="flex-shrink-0 mt-1"
                              >
                                <div
                                  className={`
                                    w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center
                                    ${
                                      notif.isRead
                                        ? "bg-slate-100 text-slate-500"
                                        : "bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-lg"
                                    }
                                  `}
                                >
                                  <Bell className="w-5 h-5" />
                                </div>
                              </motion.div>

                              {/* Content */}
                              <div className="flex-1 min-w-0 pr-14 md:pr-24">
                                <p
                                  className={`
                                    text-sm md:text-base font-bold mb-1
                                    ${
                                      notif.isRead
                                        ? "text-slate-700"
                                        : "text-purple-900"
                                    }
                                  `}
                                >
                                  {notif.title || "Notification"}
                                </p>
                                <p className="text-xs md:text-sm text-slate-600 leading-relaxed break-words">
                                  {notif.message}
                                </p>
                                <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
                                  <span>🕒</span>
                                  {formatDate(notif.createdAt)}
                                </p>
                              </div>

                              {/* Action buttons */}
                              <div className="absolute right-3 bottom-3 flex items-center gap-2">
                                {!notif.isRead && (
                                  <motion.button
                                    whileTap={{ scale: 0.94 }}
                                    whileHover={{ scale: 1.05 }}
                                    onClick={() => markAsRead(notif._id)}
                                    className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-3 md:px-4 py-1.5 md:py-2 text-[10px] md:text-xs font-bold shadow-md hover:shadow-lg transition"
                                  >
                                    Mark read
                                  </motion.button>
                                )}

                                <motion.button
                                  whileTap={{ scale: 0.94 }}
                                  whileHover={{ scale: 1.08, rotate: 5 }}
                                  onClick={() => deleteNotification(notif._id)}
                                  className="rounded-xl bg-red-50 text-red-600 p-2 md:p-2.5 shadow-sm hover:bg-red-100 hover:shadow-md transition border border-red-200"
                                  aria-label="Delete notification"
                                >
                                  <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                </motion.button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <SellerFooter />
    </div>
  );
};

export default SellerNotifications;

