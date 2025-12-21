import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion"; 
import { useAdminAuth } from "../context/AdminAuthContext";

const BASE_API_URL =
  import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

export default function AdminProfile() {
  const { token, admin: authAdmin, logout } = useAdminAuth();
  const [admin, setAdmin] = useState(null);
  const [completion, setCompletion] = useState(0);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    avatar: "",
    designation: "",
    bio: "",
  });

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [saveErr, setSaveErr] = useState("");

  const [pwdForm, setPwdForm] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMsg, setPwdMsg] = useState("");
  const [pwdErr, setPwdErr] = useState("");

  useEffect(() => {
    if (!token) return;
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_API_URL}/api/admin/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const a = res.data.admin;
      setAdmin(a);
      setCompletion(res.data.completion || 0);
      setForm({
        fullName: a.fullName || "",
        phone: a.phone || "",
        avatar: a.avatar || "",
        designation: a.designation || "",
        bio: a.bio || "",
      });
    } catch (err) {
      console.error("Admin profile fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setSaveErr("");
    setSaveMsg("");
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveErr("");
    setSaveMsg("");

    try {
      const res = await axios.put(
        `${BASE_API_URL}/api/admin/profile`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSaveMsg("Profile updated successfully.");
      setCompletion(res.data.completion || completion);
      setAdmin(res.data.admin || admin);
    } catch (err) {
      setSaveErr(
        err.response?.data?.message || "Failed to update profile. Try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePwdChangeInput = (e) => {
    setPwdErr("");
    setPwdMsg("");
    setPwdForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!pwdForm.currentPassword || !pwdForm.newPassword) {
      setPwdErr("Please enter both current and new password.");
      return;
    }
    setPwdLoading(true);
    setPwdErr("");
    setPwdMsg("");

    try {
      await axios.post(
        `${BASE_API_URL}/api/admin/change-password`,
        pwdForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPwdMsg(
        "Password changed successfully. Please use new password next time."
      );
      setPwdForm({ currentPassword: "", newPassword: "" });
    } catch (err) {
      setPwdErr(
        err.response?.data?.message || "Failed to change password. Try again."
      );
    } finally {
      setPwdLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-40 flex items-center justify-center text-slate-400 text-sm">
        Loading profile...
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="text-sm text-red-400">
        Could not load admin profile. Try logging in again.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & completion */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-lg md:text-xl font-semibold text-slate-100">
            Profile & Security
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage your admin profile details and keep your account secure.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-400">Profile completion</div>
          <div className="relative w-40 h-2 rounded-full bg-slate-800 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completion}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="h-full bg-linear-to-r from-emerald-400 via-amber-300 to-pink-400"
            />
          </div>
          <div className="text-xs text-emerald-300 font-semibold">
            {completion}%
          </div>
        </div>
      </div>

      {/* Profile card */}
      <div className="grid gap-5 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-slate-800 bg-slate-950/70 backdrop-blur p-5 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-100">
                Profile information
              </h3>
              <p className="text-[11px] text-slate-500">
                Update your personal and contact details.
              </p>
            </div>
            <button
              onClick={logout}
              className="text-[11px] text-rose-300 hover:text-rose-200"
            >
              Logout
            </button>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs text-slate-300">Full Name</label>
              <input
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400/70"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-300">Email (read only)</label>
              <input
                disabled
                value={admin.email}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-300">Phone</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400/70"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-300">Designation</label>
              <input
                name="designation"
                value={form.designation}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400/70"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-300">Avatar URL</label>
              <input
                name="avatar"
                value={form.avatar}
                onChange={handleChange}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400/70"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-300">Bio</label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                rows={3}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400/70 resize-none"
              />
            </div>

            {saveErr && (
              <div className="text-[11px] text-red-400 bg-red-950/40 border border-red-700/60 rounded px-3 py-1">
                {saveErr}
              </div>
            )}
            {saveMsg && (
              <div className="text-[11px] text-emerald-300 bg-emerald-950/40 border border-emerald-700/60 rounded px-3 py-1">
                {saveMsg}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-1.5 text-xs rounded-xl bg-amber-400 text-slate-950 font-semibold hover:bg-amber-300 disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Change password */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-slate-800 bg-slate-950/70 backdrop-blur p-5 space-y-4"
        >
          <div>
            <h3 className="text-sm font-semibold text-slate-100">
              Change password
            </h3>
            <p className="text-[11px] text-slate-500">
              Use a strong password different from your other accounts.
            </p>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs text-slate-300">
                Current password
              </label>
              <input
                type="password"
                name="currentPassword"
                value={pwdForm.currentPassword}
                onChange={handlePwdChangeInput}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-400/70"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-300">New password</label>
              <input
                type="password"
                name="newPassword"
                value={pwdForm.newPassword}
                onChange={handlePwdChangeInput}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-rose-400/70"
              />
            </div>

            {pwdErr && (
              <div className="text-[11px] text-red-400 bg-red-950/40 border border-red-700/60 rounded px-3 py-1">
                {pwdErr}
              </div>
            )}
            {pwdMsg && (
              <div className="text-[11px] text-emerald-300 bg-emerald-950/40 border border-emerald-700/60 rounded px-3 py-1">
                {pwdMsg}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={pwdLoading}
                className="px-4 py-1.5 text-xs rounded-xl bg-rose-500 text-slate-950 font-semibold hover:bg-rose-400 disabled:opacity-60"
              >
                {pwdLoading ? "Updating..." : "Update password"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
