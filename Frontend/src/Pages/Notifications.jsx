import React, { useEffect, useState, useMemo } from "react";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { Bell, CheckCheck, Filter, Trash2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
      staggerChildren: 0.06,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12, scale: 0.99 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.18, ease: "easeOut" },
  },
};

const FILTERS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "read", label: "Read" },
];

const getSourceMeta = (senderType) => {
  if (senderType === "ADMIN") {
    return {
      label: "Admin",
      bg: "bg-indigo-100",
      border: "border-indigo-300",
      text: "text-indigo-700",
      dot: "bg-indigo-500",
    };
  }
  if (senderType === "SELLER") {
    return {
      label: "Seller",
      bg: "bg-emerald-100",
      border: "border-emerald-300",
      text: "text-emerald-700",
      dot: "bg-emerald-500",
    };
  }
  return {
    label: "System",
    bg: "bg-slate-100",
    border: "border-slate-300",
    text: "text-slate-700",
    dot: "bg-slate-500",
  };
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please login to view notifications.");
      setLoading(false);
      return;
    }

    const fetchNotifications = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${BASE_API_URL}/api/notifications`, {
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

    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await fetch(`${BASE_API_URL}/api/notifications/mark-read`, {
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
    const token = localStorage.getItem("token");
    if (!token) return;
    const ids = notifications.filter((n) => !n.isRead).map((n) => n._id);
    if (!ids.length) return;

    try {
      await fetch(`${BASE_API_URL}/api/notifications/mark-read`, {
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
    const token = localStorage.getItem("token");
    if (!token) return;

    setNotifications((prev) => prev.filter((n) => n._id !== id));

    try {
      await fetch(`${BASE_API_URL}/api/notifications/${id}`, {
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

  const unreadNotificationCount = notifications.filter((n) => !n.isRead).length;

  const filteredNotifications = useMemo(() => {
    let list = [...notifications].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    if (filter === "unread") return list.filter((n) => !n.isRead);
    if (filter === "read") return list.filter((n) => n.isRead);
    return list;
  }, [notifications, filter]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30">
      <Navbar notificationCount={unreadNotificationCount} />

      <main className="flex-1 px-4 py-6 md:py-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="max-w-4xl mx-auto w-full"
        >
          <div className="relative overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-200">
            
            {/* Sticky Header with Light Gradient */}
            <div className="sticky top-0 z-20 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 backdrop-blur-xl border-b border-slate-200/50">
              {/* Animated overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_rgba(99,102,241,0.1),_transparent_50%),radial-gradient(circle_at_70%_70%,_rgba(168,85,247,0.1),_transparent_50%)] pointer-events-none animate-pulse" style={{ animationDuration: '4s' }} />
              
              <div className="relative p-5 md:p-7">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <motion.div 
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                      className="w-13 h-13 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white flex items-center justify-center shadow-xl shadow-indigo-500/40"
                    >
                      <Bell className="w-7 h-7" />
                    </motion.div>
                    <div>
                      <h2 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-700 bg-clip-text text-transparent flex items-center gap-2">
                        Your Notifications
                        <Sparkles className="w-5 h-5 text-purple-600" />
                      </h2>
                      <p className="text-xs md:text-sm text-slate-600 mt-1 font-medium">
                        Stay updated with offers, orders and alerts
                      </p>
                    </div>
                  </div>

                  {!loading && notifications.length > 0 && (
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      onClick={markAllAsRead}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 md:px-5 py-2.5 md:py-3 text-xs md:text-sm font-bold shadow-lg shadow-indigo-500/30 transition-all"
                    >
                      <CheckCheck className="w-4 h-4" />
                      <span className="hidden sm:inline">Mark all as read</span>
                      <span className="sm:hidden">Mark all</span>
                    </motion.button>
                  )}
                </div>

                {/* Filter pills */}
                {!loading && notifications.length > 0 && (
                  <div className="flex items-center gap-2 mt-5">
                    <Filter className="w-4 h-4 text-indigo-600" />
                    <div className="flex gap-2 flex-wrap">
                      {FILTERS.map((f) => (
                        <motion.button
                          key={f.key}
                          whileTap={{ scale: 0.95 }}
                          whileHover={{ scale: 1.05 }}
                          onClick={() => setFilter(f.key)}
                          className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold border-2 transition-all ${
                            filter === f.key
                              ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/40"
                              : "bg-white text-slate-700 border-slate-200 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 hover:border-indigo-300 hover:shadow-md"
                          }`}
                        >
                          {f.label}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Elegant Divider Line */}
              <div className="h-px bg-gradient-to-r from-transparent via-indigo-300 to-transparent" />
            </div>

            {/* Scrollable Body */}
            <div className="relative p-4 md:p-6 bg-gradient-to-br from-slate-50/50 to-indigo-50/20 max-h-[calc(100vh-350px)] overflow-y-auto">
              {loading && (
                <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                  <div className="relative">
                    <div className="w-12 h-12 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                    <div className="absolute inset-0 blur-lg bg-indigo-500/20 rounded-full animate-pulse" />
                  </div>
                  <p className="text-sm font-semibold mt-4">Loading notifications...</p>
                </div>
              )}

              {!loading && error && (
                <div className="text-center py-12 text-red-600 text-sm bg-red-50 border-2 border-red-200 rounded-2xl">
                  <p className="font-bold text-base">{error}</p>
                </div>
              )}

              {!loading && !error && filteredNotifications.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 flex items-center justify-center mb-4 shadow-lg">
                    <Bell className="w-8 h-8 text-indigo-600" />
                  </div>
                  <p className="text-base font-bold text-slate-700">
                    {filter === "all"
                      ? "You don't have any notifications yet"
                      : `No ${filter} notifications`}
                  </p>
                  <p className="text-sm mt-2 text-slate-500">
                    {filter === "all"
                      ? "New alerts and offers will appear here"
                      : "Try changing the filter"}
                  </p>
                </div>
              )}

              {!loading && !error && filteredNotifications.length > 0 && (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-3"
                >
                  <AnimatePresence>
                    {filteredNotifications.map((notif) => {
                      const source = getSourceMeta(notif.senderType);

                      return (
                        <motion.div
                          key={notif._id}
                          variants={itemVariants}
                          layout
                          exit={{ opacity: 0, x: -20, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          whileHover={{ scale: 1.01, y: -2 }}
                          className={`
                            relative flex items-start gap-3 p-4 md:p-5 rounded-2xl border-2
                            transition-all duration-200
                            hover:shadow-2xl
                            ${
                              notif.isRead
                                ? "bg-white border-slate-200 hover:border-slate-300"
                                : "bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-indigo-300 shadow-xl shadow-indigo-100/50"
                            }
                          `}
                        >
                                                    {/* Source Chip */}
                          <div className="absolute right-3 top-3 z-10">
                            <div
                              className={`
                                inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 text-[10px] md:text-xs font-bold uppercase tracking-wide backdrop-blur-sm
                                ${source.bg} ${source.border} ${source.text}
                              `}
                            >
                              <span className={`w-2 h-2 rounded-full ${source.dot} animate-pulse`} />
                              <span>{source.label}</span>
                            </div>
                          </div>

                          {/* Unread indicator bar */}
                          {!notif.isRead && (
                            <span className="absolute left-0 top-4 bottom-4 w-1.5 rounded-r-full bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 shadow-lg" />
                          )}

                          {/* Bell icon */}
                          <div className="mt-0.5 flex-shrink-0">
                            <div
                              className={`
                                w-11 h-11 md:w-12 md:h-12 rounded-2xl flex items-center justify-center
                                ${
                                  notif.isRead
                                    ? "bg-slate-100 text-slate-500 border-2 border-slate-200"
                                    : "bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white shadow-xl shadow-indigo-500/50"
                                }
                              `}
                            >
                              <Bell className="w-5 h-5 md:w-6 md:h-6" />
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0 pr-16 md:pr-24">
                            <p
                              className={`
                                text-sm md:text-lg font-bold mb-1
                                ${notif.isRead ? "text-slate-700" : "text-indigo-900"}
                              `}
                            >
                              {notif.title || "Notification"}
                            </p>
                            <p className={`text-xs md:text-sm leading-relaxed break-words ${notif.isRead ? "text-slate-600" : "text-slate-800"}`}>
                              {notif.message}
                            </p>
                            <p className="text-[11px] md:text-xs text-slate-500 mt-2 flex items-center gap-1">
                              <span>🕒</span>
                              {formatDate(notif.createdAt)}
                            </p>
                          </div>

                          {/* Action buttons */}
                          <div className="absolute right-3 bottom-3 flex items-center gap-2">
                            {!notif.isRead && (
                              <motion.button
                                whileTap={{ scale: 0.95 }}
                                whileHover={{ scale: 1.05 }}
                                onClick={() => markAsRead(notif._id)}
                                className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-3 md:px-4 py-1.5 md:py-2 text-[10px] md:text-xs font-bold shadow-lg shadow-indigo-500/30 transition-all"
                              >
                                Mark read
                              </motion.button>
                            )}

                            <motion.button
                              whileTap={{ scale: 0.95 }}
                              whileHover={{ scale: 1.08, rotate: 5 }}
                              onClick={() => deleteNotification(notif._id)}
                              className="rounded-xl bg-red-100 hover:bg-red-200 text-red-600 p-2 md:p-2.5 shadow-md hover:shadow-lg transition-all border-2 border-red-200"
                              aria-label="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
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
      </main>

      <Footer />
    </div>
  );
};

export default Notifications;

