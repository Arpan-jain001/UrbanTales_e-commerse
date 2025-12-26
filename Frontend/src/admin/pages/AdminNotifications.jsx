import React, { useEffect, useState, useMemo } from "react";
import {
  Bell,
  CheckCheck,
  Filter,
  Trash2,
  TrendingUp,
  AlertCircle,
  Mail,
  Users,
  Store,
  Plus,
  Send,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminAuth } from "../context/AdminAuthContext";

const BASE_API_URL =
  import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.2,
      when: "beforeChildren",
      staggerChildren: 0.04,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.2, ease: [0.22, 0.61, 0.36, 1] },
  },
};

const FILTERS = [
  { key: "all", label: "All", icon: Mail },
  { key: "unread", label: "Unread", icon: AlertCircle },
  { key: "SYSTEM", label: "System", icon: TrendingUp },
  { key: "GENERAL", label: "General", icon: Bell },
];

const getAudienceMeta = (notif) => {
  if (notif.targetAudience === "SELLERS") {
    return {
      label: "Sellers",
      icon: Store,
      bg: "bg-amber-500/10",
      border: "border-amber-400/40",
      text: "text-amber-700",
      dot: "bg-amber-500",
    };
  }
  if (notif.targetAudience === "BOTH") {
    return {
      label: "All",
      icon: Users,
      bg: "bg-emerald-500/10",
      border: "border-emerald-400/40",
      text: "text-emerald-700",
      dot: "bg-emerald-500",
    };
  }
  return {
    label: "Users",
    icon: Users,
    bg: "bg-sky-500/10",
    border: "border-sky-400/40",
    text: "text-sky-700",
    dot: "bg-sky-500",
  };
};

const AdminNotifications = () => {
  const { token } = useAdminAuth();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Create notification modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newNotif, setNewNotif] = useState({
    title: "",
    message: "",
    targetAudience: "USERS",
    category: "GENERAL",
    link: "",
  });
  const [createStatus, setCreateStatus] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Please login to view notifications.");
      setLoading(false);
      return;
    }

    fetchNotifications();
  }, [token]);

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_API_URL}/api/admin/notifications`, {
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
    } catch (err) {
      console.error(err);
      setError("Error loading notifications.");
      setLoading(false);
    }
  };

  const createNotification = async () => {
    if (!newNotif.title.trim() || !newNotif.message.trim()) {
      setCreateStatus("❌ Title and message are required!");
      return;
    }

    try {
      const res = await fetch(`${BASE_API_URL}/api/admin/notifications/broadcast`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newNotif),
      });

      if (res.ok) {
        setCreateStatus("✅ Notification sent successfully!");
        setNewNotif({
          title: "",
          message: "",
          targetAudience: "USERS",
          category: "GENERAL",
          link: "",
        });
        setTimeout(() => {
          setShowCreateModal(false);
          setCreateStatus("");
          fetchNotifications();
        }, 1500);
      } else {
        setCreateStatus("❌ Failed to send notification.");
      }
    } catch (err) {
      console.error(err);
      setCreateStatus("❌ Server error.");
    }
  };

  const markAsRead = async (id) => {
    if (!token) return;

    try {
      await fetch(`${BASE_API_URL}/api/admin/notifications/mark-read`, {
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
      await fetch(`${BASE_API_URL}/api/admin/notifications/mark-read`, {
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
      await fetch(`${BASE_API_URL}/api/admin/notifications/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error(err);
    }
  };

  const deleteAllRead = async () => {
    if (!token) return;
    const readIds = notifications.filter((n) => n.isRead).map((n) => n._id);
    if (!readIds.length) return;

    setNotifications((prev) => prev.filter((n) => !n.isRead));

    try {
      await fetch(`${BASE_API_URL}/api/admin/notifications/bulk-delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids: readIds }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const stats = useMemo(() => {
    const total = notifications.length;
    const unread = notifications.filter((n) => !n.isRead).length;
    const today = notifications.filter(
      (n) =>
        new Date(n.createdAt).toDateString() === new Date().toDateString()
    ).length;
    return { total, unread, today };
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    let list = [...notifications].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    if (filter === "unread") return list.filter((n) => !n.isRead);
    if (filter === "SYSTEM" || filter === "GENERAL")
      return list.filter((n) => n.category === filter);
    return list;
  }, [notifications, filter]);

  return (
    <div className="relative min-h-screen bg-slate-950">
      {/* Animated background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-72 sm:w-96 h-72 sm:h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-60 -right-40 w-96 sm:w-[500px] h-96 sm:h-[500px] bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-1/2 w-60 sm:w-80 h-60 sm:h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative px-3 sm:px-4 py-4 sm:py-6 md:py-8 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 sm:mb-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-2">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-100">
                  Notifications
                </h1>
                <p className="text-[11px] sm:text-xs md:text-sm text-slate-400">
                  Manage platform notifications
                </p>
              </div>
            </div>

            {/* Create notification button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs sm:text-sm font-bold shadow-lg hover:shadow-xl transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create Notification</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6"
        >
          {[
            {
              label: "Total",
              value: stats.total,
              icon: Mail,
              gradient: "from-blue-500 to-cyan-500",
            },
            {
              label: "Unread",
              value: stats.unread,
              icon: AlertCircle,
              gradient: "from-amber-500 to-orange-500",
            },
            {
              label: "Today",
              value: stats.today,
              icon: TrendingUp,
              gradient: "from-emerald-500 to-teal-500",
            },
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + idx * 0.05 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="bg-slate-900/80 border border-slate-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 backdrop-blur-xl shadow-xl"
            >
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3">
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-lg sm:rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg flex-shrink-0`}
                >
                  <stat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-[10px] sm:text-xs text-slate-400 font-medium">
                    {stat.label}
                  </p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-100">
                    {stat.value}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

                {/* Filters & Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-900/80 border border-slate-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 backdrop-blur-xl shadow-xl mb-4 sm:mb-6"
        >
          <div className="flex flex-col gap-3">
            {/* Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
              <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 flex-shrink-0" />
              <div className="flex gap-2">
                {FILTERS.map((f) => (
                  <motion.button
                    key={f.key}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFilter(f.key)}
                    className={`inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold border transition-all whitespace-nowrap ${
                      filter === f.key
                        ? "bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-500/30"
                        : "bg-slate-800/60 text-slate-300 border-slate-700 hover:bg-slate-800 hover:border-slate-600"
                    }`}
                  >
                    <f.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    <span className="hidden sm:inline">{f.label}</span>
                    <span className="sm:hidden">{f.label.slice(0, 3)}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={markAllAsRead}
                disabled={!notifications.some((n) => !n.isRead)}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 md:px-4 py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold bg-slate-800 text-slate-100 border border-slate-700 hover:bg-slate-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mark all read</span>
                <span className="sm:hidden">Mark all</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={deleteAllRead}
                disabled={!notifications.some((n) => n.isRead)}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 md:px-4 py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Delete read</span>
                <span className="sm:hidden">Delete</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Notifications List */}
        <div className="relative">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-slate-400">
              <div className="relative mb-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 border-4 border-purple-800/40 border-t-purple-500 rounded-full animate-spin" />
                <div className="absolute inset-0 blur-xl bg-purple-500/20 rounded-full animate-pulse" />
              </div>
              <p className="text-xs sm:text-sm font-medium">Loading notifications...</p>
            </div>
          )}

          {!loading && error && (
            <div className="bg-slate-900/80 border border-red-500/30 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center">
              <p className="text-sm sm:text-base text-red-400 font-medium">{error}</p>
            </div>
          )}

          {!loading && !error && filteredNotifications.length === 0 && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl sm:rounded-2xl p-8 sm:p-12 text-center backdrop-blur-xl">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4">
                <Bell className="w-6 h-6 sm:w-8 sm:h-8 text-slate-500" />
              </div>
              <p className="text-sm sm:text-base font-semibold text-slate-200 mb-1">
                {filter === "all"
                  ? "No notifications yet"
                  : `No ${filter.toLowerCase()} notifications`}
              </p>
              <p className="text-xs sm:text-sm text-slate-500">
                {filter === "all"
                  ? "Sent notifications will appear here."
                  : "Try changing the filter."}
              </p>
            </div>
          )}

          {!loading && !error && filteredNotifications.length > 0 && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-3 sm:space-y-4"
            >
              <AnimatePresence>
                {filteredNotifications.map((notif) => {
                  const aud = getAudienceMeta(notif);
                  return (
                    <motion.div
                      key={notif._id}
                      variants={itemVariants}
                      layout
                      exit={{ opacity: 0, x: -40, scale: 0.94 }}
                      transition={{ duration: 0.25 }}
                      className={`
                        relative group overflow-hidden rounded-xl sm:rounded-2xl border
                        transition-all duration-300
                        hover:-translate-y-1 hover:shadow-2xl
                        ${
                          notif.isRead
                            ? "bg-slate-900/60 border-slate-800"
                            : "bg-slate-900/90 border-purple-500/40 shadow-lg shadow-purple-500/10"
                        }
                      `}
                    >
                      {!notif.isRead && (
                        <motion.div
                          className="absolute -right-12 -top-12 w-32 sm:w-48 h-32 sm:h-48 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"
                          animate={{
                            scale: [1, 1.15, 1],
                            opacity: [0.3, 0.5, 0.3],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        />
                      )}

                      {/* Audience Chip - Top Right */}
                      <div className="absolute right-2 sm:right-3 top-2 sm:top-3 z-10">
                        <div
                          className={`
                            inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border backdrop-blur-md text-[9px] sm:text-[10px] font-bold uppercase tracking-wider
                            ${aud.bg} ${aud.border} ${aud.text}
                          `}
                        >
                          <aud.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          <span className={`w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full ${aud.dot} animate-pulse`} />
                          <span>{aud.label}</span>
                        </div>
                      </div>

                      {/* Unread indicator bar */}
                      {!notif.isRead && (
                        <span className="absolute left-0 top-3 sm:top-4 bottom-3 sm:bottom-4 w-0.5 sm:w-1 rounded-r-full bg-gradient-to-b from-purple-500 via-pink-500 to-purple-500" />
                      )}

                      <div className="relative p-3 sm:p-4 md:p-6 flex items-start gap-2 sm:gap-3 md:gap-4">
                        {/* Bell icon */}
                        <motion.div
                          whileHover={{ rotate: [0, -12, 12, 0], scale: 1.05 }}
                          transition={{ duration: 0.4 }}
                          className="flex-shrink-0"
                        >
                          <div
                            className={`
                              w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center
                              ${
                                notif.isRead
                                  ? "bg-slate-800 text-slate-400 border border-slate-700"
                                  : "bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/40"
                              }
                            `}
                          >
                            <Bell className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                          </div>
                        </motion.div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 pr-12 sm:pr-16 md:pr-28">
                          <p
                            className={`
                              text-xs sm:text-sm md:text-lg font-bold mb-1
                              ${notif.isRead ? "text-slate-200" : "text-purple-100"}
                            `}
                          >
                            {notif.title || "Notification"}
                          </p>

                          <p className="text-[11px] sm:text-xs md:text-sm text-slate-300 leading-relaxed break-words mb-2">
                            {notif.message}
                          </p>

                          <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-[11px] text-slate-500 flex-wrap">
                            <span className="flex items-center gap-1">
                              🕒 {formatDate(notif.createdAt)}
                            </span>
                            {notif.category && (
                              <span className="px-1.5 sm:px-2 py-0.5 rounded-md bg-slate-800/60 border border-slate-700 text-slate-400">
                                {notif.category}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="absolute right-2 sm:right-3 bottom-2 sm:bottom-3 flex items-center gap-1.5 sm:gap-2">
                          {!notif.isRead && (
                            <motion.button
                              whileTap={{ scale: 0.94 }}
                              whileHover={{ scale: 1.06 }}
                              onClick={() => markAsRead(notif._id)}
                              className="rounded-lg sm:rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 text-[9px] sm:text-[10px] md:text-xs font-bold shadow-md hover:shadow-lg transition"
                            >
                              <span className="hidden sm:inline">Mark read</span>
                              <span className="sm:hidden">✓</span>
                            </motion.button>
                          )}

                          <motion.button
                            whileTap={{ scale: 0.94 }}
                            whileHover={{ scale: 1.08, rotate: 8 }}
                            onClick={() => deleteNotification(notif._id)}
                            className="rounded-lg sm:rounded-xl bg-red-500/10 text-red-400 p-1.5 sm:p-2 md:p-2.5 shadow-sm hover:bg-red-500/20 hover:shadow-md transition border border-red-500/30"
                            aria-label="Delete"
                          >
                            <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
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

      {/* Create Notification Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4"
            onClick={() => {
              setShowCreateModal(false);
              setCreateStatus("");
            }}
          >
                        <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-slate-900 border border-slate-700 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                    <Send className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-100">
                    Create Notification
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreateStatus("");
                  }}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold text-slate-300 mb-2">
                    Notification Title
                  </label>
                  <input
                    type="text"
                    value={newNotif.title}
                    onChange={(e) =>
                      setNewNotif({ ...newNotif, title: e.target.value })
                    }
                    placeholder="e.g., 🔥 Flash Sale Alert!"
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold text-slate-300 mb-2">
                    Message
                  </label>
                  <textarea
                    value={newNotif.message}
                    onChange={(e) =>
                      setNewNotif({ ...newNotif, message: e.target.value })
                    }
                    placeholder="Type your message here..."
                    rows={3}
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition resize-none"
                  />
                </div>

                {/* Target Audience */}
                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold text-slate-300 mb-2">
                    Send To
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "USERS", label: "Users", icon: Users, color: "sky" },
                      { value: "SELLERS", label: "Sellers", icon: Store, color: "amber" },
                      { value: "BOTH", label: "Both", icon: Mail, color: "emerald" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() =>
                          setNewNotif({ ...newNotif, targetAudience: opt.value })
                        }
                        className={`flex flex-col items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 sm:py-3 rounded-lg sm:rounded-xl border-2 text-[10px] sm:text-xs font-bold transition ${
                          newNotif.targetAudience === opt.value
                            ? `bg-${opt.color}-500/20 border-${opt.color}-500 text-${opt.color}-300`
                            : "bg-slate-800/40 border-slate-700 text-slate-400 hover:bg-slate-800"
                        }`}
                      >
                        <opt.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold text-slate-300 mb-2">
                    Category
                  </label>
                  <select
                    value={newNotif.category}
                    onChange={(e) =>
                      setNewNotif({ ...newNotif, category: e.target.value })
                    }
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-purple-500 transition"
                  >
                    <option value="GENERAL">General</option>
                    <option value="SYSTEM">System</option>
                    <option value="OFFER">Offer</option>
                    <option value="ORDER">Order</option>
                  </select>
                </div>

                {/* Link (optional) */}
                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold text-slate-300 mb-2">
                    Link (Optional)
                  </label>
                  <input
                    type="text"
                    value={newNotif.link}
                    onChange={(e) =>
                      setNewNotif({ ...newNotif, link: e.target.value })
                    }
                    placeholder="/category?cat=fashion"
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
                  />
                </div>

                {/* Status message */}
                {createStatus && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-xs sm:text-sm font-semibold text-center py-2 rounded-lg ${
                      createStatus.includes("✅")
                        ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/30"
                        : "text-red-400 bg-red-500/10 border border-red-500/30"
                    }`}
                  >
                    {createStatus}
                  </motion.p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6">
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreateStatus("");
                    setNewNotif({
                      title: "",
                      message: "",
                      targetAudience: "USERS",
                      category: "GENERAL",
                      link: "",
                    });
                  }}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl bg-slate-800 text-slate-200 text-xs sm:text-sm font-semibold border border-slate-700 hover:bg-slate-700 transition"
                >
                  Cancel
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.96 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={createNotification}
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs sm:text-sm font-bold shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Send Notification</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminNotifications;


