import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion"; 
import { useLocation, useNavigate } from "react-router-dom";

const BASE_API_URL =
  import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

export default function AdminResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialEmail = location.state?.email || "";
  const initialOtp = location.state?.otp || "";

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState(initialOtp);
  const [newPassword, setNewPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!initialEmail || !initialOtp) {
      navigate("/admin/forgot-password", { replace: true });
    }
  }, [initialEmail, initialOtp, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");

    if (!email || !otp || !newPassword) {
      setErr("Please fill all fields.");
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`${BASE_API_URL}/api/admin/reset-password`, {
        email,
        otp,
        newPassword,
      });
      setMsg("Password reset successful. You can now login with new password.");
      setTimeout(() => navigate("/admin/login", { replace: true }), 1000);
    } catch (error) {
      setErr(
        error.response?.data?.message || "Failed to reset password. Try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6"
      >
        <h1 className="text-lg font-semibold text-slate-100 mb-1">
          Set new password
        </h1>
        <p className="text-xs text-slate-400 mb-4">
          Create a strong new password for your admin account.
        </p>

        {err && (
          <div className="mb-2 text-xs text-red-400 bg-red-950/40 border border-red-700/60 rounded px-3 py-1.5">
            {err}
          </div>
        )}
        {msg && (
          <div className="mb-2 text-xs text-emerald-300 bg-emerald-950/40 border border-emerald-700/60 rounded px-3 py-1.5">
            {msg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-slate-300">Admin email</label>
            <input
              type="email"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400/70"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-300">OTP</label>
            <input
              type="text"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400/70"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-300">New password</label>
            <input
              type="password"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400/70"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 bg-emerald-500 text-slate-950 text-xs font-semibold py-2 rounded-xl hover:bg-emerald-400 disabled:opacity-60"
          >
            {submitting ? "Saving..." : "Reset password"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
