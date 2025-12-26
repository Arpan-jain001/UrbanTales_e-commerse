import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminAuth } from "../context/AdminAuthContext";
import { FiTrash2, FiUserX, FiAlertTriangle, FiMessageSquare, FiUser, FiMail, FiShield } from "react-icons/fi";

const BASE_API_URL =
  import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

export default function AdminManage() {
  const { token, isSuperAdmin } = useAdminAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    username: "",
    role: "ADMIN",
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    fetchAdmins();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_API_URL}/api/admin/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAdmins(res.data.admins || []);
    } catch (err) {
      console.error("Fetch admins error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setError("");
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.username) {
      setError("Please fill all required fields.");
      return;
    }

    setCreating(true);
    try {
      await axios.post(
        `${BASE_API_URL}/api/admin/create`,
        {
          fullName: form.fullName,
          email: form.email,
          username: form.username,
          role: form.role,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setForm({ fullName: "", email: "", username: "", role: "ADMIN" });
      setModalOpen(false);
      fetchAdmins();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to create admin. Try again."
      );
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteClick = (admin) => {
    setAdminToDelete(admin);
    setDeleteReason("");
    setDeleteConfirmModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!adminToDelete) return;

    if (!deleteReason.trim()) {
      setError("Please provide a reason for removing this admin.");
      return;
    }

    setDeleting(true);
    setError("");
    try {
      await axios.delete(`${BASE_API_URL}/api/admin/delete/${adminToDelete._id}`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { reason: deleteReason },
      });

      setDeleteConfirmModal(false);
      setAdminToDelete(null);
      setDeleteReason("");
      setDeleteMode(false);
      fetchAdmins();
    } catch (err) {
      console.error("Delete admin error:", err);
      setError(err.response?.data?.message || "Failed to delete admin.");
    } finally {
      setDeleting(false);
    }
  };

  const toggleDeleteMode = () => {
    setDeleteMode(!deleteMode);
    setError("");
  };

  return (
  <div className="space-y-4 md:space-y-5 px-3 md:px-0">
    {/* Header */}
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <div>
        <h2 className="text-lg md:text-xl font-semibold text-slate-100">
          Admin Members
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Manage admin accounts with secure access control.
        </p>
      </div>
      {isSuperAdmin && (
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={toggleDeleteMode}
            className={`flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold px-4 py-2.5 sm:py-2 rounded-xl shadow transition ${
              deleteMode
                ? "bg-slate-700 text-slate-200 hover:bg-slate-600"
                : "bg-rose-500 text-white hover:bg-rose-400"
            }`}
          >
            <FiUserX size={16} />
            {deleteMode ? "Cancel" : "Remove Admin"}
          </button>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-emerald-500 text-slate-900 text-xs sm:text-sm font-semibold px-4 py-2.5 sm:py-2 rounded-xl shadow hover:bg-emerald-400 transition"
          >
            + Add Admin
          </button>
        </div>
      )}
    </div>


      {error && (
        <div className="text-xs text-red-400 bg-red-950/40 border border-red-700/60 rounded-xl px-3 sm:px-4 py-2">
          {error}
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-2xl border border-slate-800 bg-slate-950/60 backdrop-blur overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs md:text-sm">
            <thead className="bg-slate-900/80 border-b border-slate-800">
              <tr>
                {deleteMode && (
                  <th className="px-3 py-2 text-left text-slate-400 font-medium w-12">
                    Action
                  </th>
                )}
                <th className="px-3 py-2 text-left text-slate-400 font-medium">
                  Name
                </th>
                <th className="px-3 py-2 text-left text-slate-400 font-medium">
                  Email
                </th>
                <th className="px-3 py-2 text-left text-slate-400 font-medium">
                  Username
                </th>
                <th className="px-3 py-2 text-left text-slate-400 font-medium">
                  Role
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
                    colSpan={deleteMode ? 6 : 5}
                    className="px-3 py-6 text-center text-slate-500"
                  >
                    Loading admins...
                  </td>
                </tr>
              ) : admins.length === 0 ? (
                <tr>
                  <td
                    colSpan={deleteMode ? 6 : 5}
                    className="px-3 py-6 text-center text-slate-500"
                  >
                    No admins found.
                  </td>
                </tr>
              ) : (
                admins.map((a) => (
                  <motion.tr
                    key={a._id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border-b border-slate-800/60 hover:bg-slate-900/40 transition-colors"
                  >
                    {deleteMode && (
                      <td className="px-3 py-2">
                        <button
                          onClick={() => handleDeleteClick(a)}
                          className="w-8 h-8 rounded-full bg-rose-500/20 hover:bg-rose-500/40 border border-rose-500/60 flex items-center justify-center transition-all duration-300 group"
                          title="Delete admin"
                        >
                          <FiTrash2
                            size={14}
                            className="text-rose-400 group-hover:text-rose-300"
                          />
                        </button>
                      </td>
                    )}
                    <td className="px-3 py-2 text-slate-100">{a.fullName}</td>
                    <td className="px-3 py-2 text-slate-300">{a.email}</td>
                    <td className="px-3 py-2 text-slate-300">{a.username}</td>
                    <td className="px-3 py-2 text-[11px]">
                      <span
                        className={
                          a.role === "SUPER_ADMIN"
                            ? "px-2 py-1 rounded-full bg-pink-500/20 text-pink-300"
                            : "px-2 py-1 rounded-full bg-slate-700/40 text-slate-200"
                        }
                      >
                        {a.role}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-slate-300 text-[11px]">
                      {new Date(a.createdAt).toLocaleDateString("en-IN")}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="text-center py-10 text-slate-500">
            <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-2" />
            <p className="text-xs">Loading admins...</p>
          </div>
        ) : admins.length === 0 ? (
          <div className="text-center py-10 text-slate-500 bg-slate-950/60 rounded-xl border border-slate-800">
            <p className="text-sm">No admins found.</p>
          </div>
        ) : (
          admins.map((a) => (
            <motion.div
              key={a._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative bg-slate-950/60 backdrop-blur border border-slate-800 rounded-xl p-4 hover:bg-slate-900/60 transition"
            >
              {/* Delete Button in Delete Mode */}
              {deleteMode && (
                <button
                  onClick={() => handleDeleteClick(a)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-rose-500/20 hover:bg-rose-500/40 border border-rose-500/60 flex items-center justify-center transition-all"
                >
                  <FiTrash2 size={14} className="text-rose-400" />
                </button>
              )}

              {/* Admin Info */}
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                      {a.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-100">{a.fullName}</p>
                      <span
                        className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          a.role === "SUPER_ADMIN"
                            ? "bg-pink-500/20 text-pink-300 border border-pink-500/30"
                            : "bg-slate-700/40 text-slate-200 border border-slate-600/30"
                        }`}
                      >
                        {a.role}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <FiMail size={12} className="text-slate-500" />
                    <span className="truncate">{a.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <FiUser size={12} className="text-slate-500" />
                    <span>@{a.username}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <FiShield size={12} className="text-slate-500" />
                    <span>Joined {new Date(a.createdAt).toLocaleDateString("en-IN")}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Add Admin Modal */}
      <AnimatePresence>
        {modalOpen && isSuperAdmin && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-100">
                  Create New Admin
                </h3>
                                <button
                  onClick={() => setModalOpen(false)}
                  className="text-xs text-slate-400 hover:text-slate-200 transition"
                >
                  ✕
                </button>
              </div>

              <p className="text-[11px] text-slate-500 mb-3">
                An email with credentials will be sent automatically to the new admin.
              </p>

              {error && (
                <div className="mb-2 text-xs text-red-400 bg-red-950/40 border border-red-700/60 rounded px-3 py-1.5">
                  {error}
                </div>
              )}

              <form onSubmit={handleCreate} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400/70"
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400/70"
                    placeholder="admin@example.com"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Username</label>
                  <input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400/70"
                    placeholder="username"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-300">Role</label>
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400/70"
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                  </select>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-900 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 px-4 py-2 text-xs rounded-xl bg-emerald-500 text-slate-950 font-semibold hover:bg-emerald-400 disabled:opacity-60 transition"
                  >
                    {creating ? "Creating..." : "Create Admin"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirmModal && adminToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-slate-950 border border-rose-800/60 rounded-2xl p-4 sm:p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex flex-col items-center text-center">
                {/* Warning Icon */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-rose-500/20 border-2 border-rose-500/60 flex items-center justify-center mb-3 sm:mb-4 animate-pulse">
                  <FiAlertTriangle size={28} className="text-rose-400" />
                </div>

                {/* Title */}
                <h3 className="text-base sm:text-lg font-bold text-slate-100 mb-2">
                  Are you sure?
                </h3>

                {/* Message */}
                <p className="text-xs sm:text-sm text-slate-400 mb-1">
                  Do you want to remove this admin from UrbanTales?
                </p>
                <p className="text-xs text-slate-500 mb-3 sm:mb-4">
                  This will permanently delete{" "}
                  <span className="font-semibold text-rose-400">
                    {adminToDelete.fullName}
                  </span>
                  's account and they will no longer be able to login.
                </p>

                {/* Admin Details Card */}
                <div className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-3 sm:p-4 mb-3 sm:mb-4">
                  <div className="space-y-2 text-left">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Name:</span>
                      <span className="text-slate-200 font-medium truncate ml-2">
                        {adminToDelete.fullName}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Email:</span>
                      <span className="text-slate-200 font-medium truncate ml-2">
                        {adminToDelete.email}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Username:</span>
                      <span className="text-slate-200 font-medium">
                        {adminToDelete.username}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Role:</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          adminToDelete.role === "SUPER_ADMIN"
                            ? "bg-pink-500/20 text-pink-300"
                            : "bg-slate-700/40 text-slate-200"
                        }`}
                      >
                        {adminToDelete.role}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Reason Input */}
                <div className="w-full mb-3 sm:mb-4">
                  <label className="flex items-center gap-2 text-xs text-slate-300 mb-2">
                    <FiMessageSquare size={14} className="text-rose-400" />
                    Reason for removal <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    value={deleteReason}
                    onChange={(e) => {
                      setDeleteReason(e.target.value);
                      setError("");
                    }}
                    placeholder="Please explain why this admin is being removed..."
                    rows={3}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-rose-400/70 resize-none"
                  />
                  <p className="text-[10px] text-slate-500 mt-1.5">
                    This reason will be sent to the admin's email address
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="w-full mb-3 text-xs text-rose-400 bg-rose-950/40 border border-rose-700/60 rounded-lg px-3 py-2">
                    {error}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 sm:gap-3 w-full">
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteConfirmModal(false);
                      setAdminToDelete(null);
                      setDeleteReason("");
                      setError("");
                    }}
                    disabled={deleting}
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-900 transition disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteConfirm}
                    disabled={deleting || !deleteReason.trim()}
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-gradient-to-r from-rose-500 to-red-600 text-white hover:from-rose-600 hover:to-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {deleting ? (
                      <>
                        <svg
                          className="animate-spin h-3 w-3 sm:h-4 sm:w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span className="hidden sm:inline">Removing...</span>
                        <span className="sm:hidden">...</span>
                      </>
                    ) : (
                      <>
                        <FiTrash2 size={14} />
                        <span className="hidden sm:inline">Remove Permanently</span>
                        <span className="sm:hidden">Remove</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Warning Text */}
                <p className="text-[10px] text-rose-400/80 mt-2 sm:mt-3">
                  ⚠ This action cannot be undone • Email will be sent
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

