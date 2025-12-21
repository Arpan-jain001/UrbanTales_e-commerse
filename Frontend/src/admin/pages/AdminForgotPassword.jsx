import React, { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion"; 
import { useNavigate } from "react-router-dom";

const BASE_API_URL =
  import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

export default function AdminForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");

    if (!email) {
      setErr("Please enter your admin email.");
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`${BASE_API_URL}/api/admin/forgot-password`, { email });
      setMsg("OTP sent to your email (check inbox & spam).");
      // next to verify otp page with email in state
      setTimeout(() => {
        navigate("/admin/verify-otp", { state: { email } });
      }, 1000);
    } catch (error) {
      setErr(
        error.response?.data?.message || "Failed to send OTP. Try again."
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
          Admin password reset
        </h1>
        <p className="text-xs text-slate-400 mb-4">
          Enter your admin email to receive a one-time OTP code.
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
              placeholder="superadmin@example.com"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 bg-amber-400 text-slate-950 text-xs font-semibold py-2 rounded-xl hover:bg-amber-300 disabled:opacity-60"
          >
            {submitting ? "Sending OTP..." : "Send OTP"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/login")}
            className="w-full text-[11px] text-slate-400 hover:text-slate-200 mt-2"
          >
            Back to login
          </button>
        </form>
      </motion.div>
    </div>
  );
}
