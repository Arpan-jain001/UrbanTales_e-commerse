import React, { useEffect, useMemo, useState } from "react";
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
  FiPhone,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
  FiSend,
} from "react-icons/fi";
import VerificationActionModal from "../components/VerificationActionModal";

const BASE_API_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

const getVerifiedStyle = (isVerified) =>
  isVerified
    ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
    : "bg-amber-500/10 text-amber-300 border-amber-500/30";

const isExpired = (deadline) => Boolean(deadline && new Date(deadline).getTime() < Date.now());

export default function AdminUsers() {
  const { token } = useAdminAuth();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [bulkSending, setBulkSending] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [modalState, setModalState] = useState({
    open: false,
    mode: "",
    user: null,
  });

  const fetchUsers = async (pageNum = page, q = search, status = statusFilter) => {
    try {
      setLoading(true);
      const params = { page: pageNum, limit };
      if (q.trim()) params.search = q.trim();
      if (status !== "ALL") params.status = status;

      const res = await axios.get(`${BASE_API_URL}/api/admin/users`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers(res.data.users || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error("Admin fetch users error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchUsers(page, search, statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, page, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers(1, search, statusFilter);
  };

  const closeModal = () => {
    setModalState({ open: false, mode: "", user: null });
  };

  const handleVerify = async (user) => {
    try {
      setActionLoadingId(user._id);
      await axios.patch(
        `${BASE_API_URL}/api/admin/users/${user._id}/verification`,
        { isVerified: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFeedback({
        type: "success",
        message: `${user.fullName || user.email} verified successfully.`,
      });
      await fetchUsers(page, search, statusFilter);
    } catch (err) {
      console.error("User verification update failed:", err);
      setFeedback({
        type: "error",
        message: err.response?.data?.message || "Failed to update verification status.",
      });
    } finally {
      setActionLoadingId("");
    }
  };

  const handleResend = async (user) => {
    try {
      setActionLoadingId(user._id);
      const res = await axios.post(
        `${BASE_API_URL}/api/admin/users/${user._id}/resend-verification`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setFeedback({
        type: "success",
        message: res.data?.message || `Verification email resent to ${user.email}.`,
      });
      await fetchUsers(page, search, statusFilter);
    } catch (err) {
      console.error("User resend verification failed:", err);
      setFeedback({
        type: "error",
        message: err.response?.data?.message || "Failed to resend verification email.",
      });
    } finally {
      setActionLoadingId("");
    }
  };

  const handleBulkReminder = async () => {
    try {
      setBulkSending(true);
      const res = await axios.post(
        `${BASE_API_URL}/api/admin/users/reminders`,
        {
          search,
          status: statusFilter === "VERIFIED" ? "UNVERIFIED" : statusFilter,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setFeedback({
        type: "success",
        message: res.data?.message || "Verification reminders sent successfully.",
      });
      await fetchUsers(page, search, statusFilter);
    } catch (err) {
      console.error("Bulk user reminder failed:", err);
      setFeedback({
        type: "error",
        message: err.response?.data?.message || "Failed to send verification reminders.",
      });
    } finally {
      setBulkSending(false);
    }
  };

  const handleModalSubmit = async ({ reason, sendEmail }) => {
    const user = modalState.user;
    if (!user) return;

    try {
      setActionLoadingId(user._id);

      if (modalState.mode === "unverify") {
        await axios.patch(
          `${BASE_API_URL}/api/admin/users/${user._id}/verification`,
          {
            isVerified: false,
            reason,
            sendVerificationEmail: sendEmail,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setFeedback({
          type: "success",
          message: sendEmail
            ? "User marked unverified and fresh verification email sent."
            : "User marked unverified successfully.",
        });
      }

      if (modalState.mode === "delete") {
        await axios.delete(`${BASE_API_URL}/api/admin/users/${user._id}`, {
          headers: { Authorization: `Bearer ${token}` },
          data: { reason },
        });
        setFeedback({
          type: "success",
          message: `${user.fullName || user.email} deleted successfully.`,
        });
      }

      closeModal();
      await fetchUsers(page, search, statusFilter);
    } catch (err) {
      console.error("User admin action failed:", err);
      setFeedback({
        type: "error",
        message: err.response?.data?.message || "Failed to complete admin action.",
      });
    } finally {
      setActionLoadingId("");
    }
  };

  const pages = Math.max(1, Math.ceil(total / limit));
  const verifiedCount = useMemo(() => users.filter((user) => user.isVerified).length, [users]);
  const expiredCount = useMemo(
    () => users.filter((user) => !user.isVerified && isExpired(user.verificationDeadline)).length,
    [users]
  );

  const renderActions = (user) => {
    const busy = actionLoadingId === user._id;
    return (
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          disabled={busy}
          onClick={() =>
            user.isVerified
              ? setModalState({ open: true, mode: "unverify", user })
              : handleVerify(user)
          }
          className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition ${
            user.isVerified
              ? "bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20"
              : "bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20"
          } disabled:opacity-50`}
        >
          {busy ? "Updating..." : user.isVerified ? "Mark Unverified" : "Verify"}
        </button>
        {!user.isVerified ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => handleResend(user)}
            className="px-3 py-1.5 rounded-lg text-[11px] font-bold border border-blue-500/30 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 transition disabled:opacity-50 inline-flex items-center gap-1"
          >
            <FiSend size={12} />
            Resend Mail
          </button>
        ) : null}
        <button
          type="button"
          disabled={busy}
          onClick={() => setModalState({ open: true, mode: "delete", user })}
          className="px-3 py-1.5 rounded-lg text-[11px] font-bold border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 transition disabled:opacity-50"
        >
          Delete
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-4 w-full">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg flex-shrink-0">
            <FiUsers className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-100">Users Management</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Buyer verification, reminders, and admin review controls
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-slate-900/70 border border-slate-700 text-slate-300">
            <span className="text-slate-500">Total:</span>{" "}
            <span className="font-semibold text-blue-300">{total}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/40 text-emerald-300">
            <span className="text-emerald-400/80">Verified:</span>{" "}
            <span className="font-bold">{verifiedCount}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/40 text-amber-300">
            <span className="text-amber-200/80">Expired:</span>{" "}
            <span className="font-bold">{expiredCount}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-900/70 border border-slate-700 text-slate-400">
            Page {page}/{pages}
          </div>
          <button
            type="button"
            onClick={handleBulkReminder}
            disabled={bulkSending || loading}
            className="px-3 py-1.5 rounded-lg bg-blue-600/15 border border-blue-500/40 text-blue-300 font-semibold hover:bg-blue-600/25 transition disabled:opacity-50"
          >
            {bulkSending ? "Sending..." : "Send Reminders"}
          </button>
        </div>
      </div>

      {feedback ? (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            feedback.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border-rose-500/30 bg-rose-500/10 text-rose-300"
          }`}
        >
          {feedback.message}
        </div>
      ) : null}

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
              placeholder="Search by name, email or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-800/60 border border-slate-700 rounded-lg pl-10 pr-3 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="relative sm:col-span-2">
              <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg pl-10 pr-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition appearance-none"
              >
                <option value="ALL">All Users</option>
                <option value="VERIFIED">Verified Only</option>
                <option value="UNVERIFIED">Unverified Only</option>
              </select>
            </div>

            <button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold px-4 py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all active:scale-95"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </motion.form>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="hidden md:block rounded-2xl border border-slate-800 bg-slate-950/80 backdrop-blur-xl shadow-[0_18px_45px_rgba(15,23,42,0.85)] overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-900/90 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3 text-left text-slate-400 font-medium">User</th>
                <th className="px-4 py-3 text-left text-slate-400 font-medium">Email</th>
                <th className="px-4 py-3 text-left text-slate-400 font-medium">Phone</th>
                <th className="px-4 py-3 text-left text-slate-400 font-medium">Status</th>
                <th className="px-4 py-3 text-left text-slate-400 font-medium">Deadline</th>
                <th className="px-4 py-3 text-left text-slate-400 font-medium">Joined</th>
                <th className="px-4 py-3 text-left text-slate-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                      <span>Loading users...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    <FiUsers size={32} className="text-slate-600 mx-auto mb-2" />
                    <p>No users found</p>
                  </td>
                </tr>
              ) : (
                users.map((user, idx) => (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.02 * idx }}
                    className="border-b border-slate-800/60 hover:bg-slate-900/70 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {user.fullName?.[0]?.toUpperCase() || user.name?.[0]?.toUpperCase() || "U"}
                        </div>
                        <div>
                          <p className="font-medium text-slate-100">
                            {user.fullName || user.name || "Unknown"}
                          </p>
                          <p className="text-[11px] text-slate-500 font-mono">
                            ID: {user._id?.slice(-6)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-300 text-xs max-w-[220px] truncate">
                      {user.email}
                    </td>
                    <td className="px-4 py-3 text-slate-300 text-xs">{user.phone || "-"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border flex items-center gap-1 w-fit ${getVerifiedStyle(
                          user.isVerified
                        )}`}
                      >
                        {user.isVerified ? (
                          <>
                            <FiCheckCircle size={12} />
                            Verified
                          </>
                        ) : (
                          <>
                            <FiXCircle size={12} />
                            Unverified
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[11px] text-slate-300">
                      {user.isVerified ? (
                        "-"
                      ) : user.verificationDeadline ? (
                        <span className={isExpired(user.verificationDeadline) ? "text-amber-300" : ""}>
                          {new Date(user.verificationDeadline).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "2-digit",
                          })}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-4 py-3 text-[11px] text-slate-300">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "2-digit",
                          })
                        : "-"}
                    </td>
                    <td className="px-4 py-3">{renderActions(user)}</td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-800 text-xs text-slate-400">
          <span>
            Page <span className="font-semibold text-slate-200">{page}</span> of{" "}
            <span className="font-semibold text-slate-200">{pages}</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-900 transition text-slate-300"
            >
              <FiChevronLeft size={14} />
              Prev
            </button>
            <button
              type="button"
              disabled={page === pages}
              onClick={() => setPage((prev) => Math.min(pages, prev + 1))}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-900 transition text-slate-300"
            >
              Next
              <FiChevronRight size={14} />
            </button>
          </div>
        </div>
      </motion.div>

      <div className="md:hidden">
        <AnimatePresence>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-3" />
              <p className="text-xs">Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-8 text-center backdrop-blur-xl">
              <FiUsers size={36} className="text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-400 font-medium">No users found</p>
              <p className="text-xs text-slate-500 mt-1">Try different filters</p>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user, idx) => (
                <motion.div
                  key={user._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 backdrop-blur-xl shadow-lg"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0">
                        {user.fullName?.[0]?.toUpperCase() || user.name?.[0]?.toUpperCase() || "U"}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-100">
                          {user.fullName || user.name || "Unknown User"}
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          ID: {user._id?.slice(-8)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold border flex items-center gap-1 ${getVerifiedStyle(
                        user.isVerified
                      )}`}
                    >
                      {user.isVerified ? <FiCheckCircle size={10} /> : <FiXCircle size={10} />}
                      {user.isVerified ? "Verified" : "Unverified"}
                    </span>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-xs">
                      <FiMail className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      <span className="text-slate-300 truncate">{user.email}</span>
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-2 text-xs">
                        <FiPhone className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                        <span className="text-slate-400">{user.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs">
                      <FiCalendar className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      <span className="text-slate-500 text-[11px]">
                        Joined{" "}
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "-"}
                      </span>
                    </div>
                    {!user.isVerified && user.verificationDeadline && (
                      <div className="flex items-center gap-2 text-xs">
                        <FiRefreshCw className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                        <span
                          className={`text-[11px] ${
                            isExpired(user.verificationDeadline) ? "text-amber-300" : "text-slate-400"
                          }`}
                        >
                          Deadline{" "}
                          {new Date(user.verificationDeadline).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  {renderActions(user)}
                </motion.div>
              ))}

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
                  <span className="text-[10px]">{users.length} of {total}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={page === 1}
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-900 active:scale-95 transition text-xs font-semibold text-slate-300"
                  >
                    <FiChevronLeft size={14} />
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={page === pages}
                    onClick={() => setPage((prev) => Math.min(pages, prev + 1))}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-900 active:scale-95 transition text-xs font-semibold text-slate-300"
                  >
                    Next
                    <FiChevronRight size={14} />
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>

      <VerificationActionModal
        open={modalState.open}
        mode={modalState.mode}
        label={modalState.user?.fullName || modalState.user?.email || ""}
        loading={Boolean(actionLoadingId)}
        onClose={closeModal}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
}
