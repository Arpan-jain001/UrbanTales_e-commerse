import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion"; 
import { useAdminAuth } from "../context/AdminAuthContext";

const BASE_API_URL =
  import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

export default function AdminManage() {
  const { token, isSuperAdmin } = useAdminAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
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

  return (
    <div className="space-y-5">
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
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="bg-emerald-500 text-slate-900 text-sm font-semibold px-4 py-2 rounded-xl shadow hover:bg-emerald-400 transition"
          >
            + Add Admin
          </button>
        )}
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 backdrop-blur">
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs md:text-sm">
            <thead className="bg-slate-900/80 border-b border-slate-800">
              <tr>
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
                    colSpan={5}
                    className="px-3 py-6 text-center text-slate-500"
                  >
                    Loading admins...
                  </td>
                </tr>
              ) : admins.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
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
                    className="border-b border-slate-800/60"
                  >
                    <td className="px-3 py-2 text-slate-100">
                      {a.fullName}
                    </td>
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

      {/* Add Admin Modal */}
      {modalOpen && isSuperAdmin && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-100">
                Create New Admin
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <p className="text-[11px] text-slate-500 mb-3">
              An email with credentials will be sent automatically to the new
              admin.
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

              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 text-xs rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-1.5 text-xs rounded-xl bg-emerald-500 text-slate-950 font-semibold hover:bg-emerald-400 disabled:opacity-60"
                >
                  {creating ? "Creating..." : "Create Admin"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
