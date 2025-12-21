import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion"; 
import { useLocation, useNavigate } from "react-router-dom";

const BASE_API_URL =
  import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

export default function AdminVerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialEmail = location.state?.email || "";
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  // simple 15-min label (backend actual check karega)
  const [timerMsg] = useState("OTP valid for 15 minutes.");

  useEffect(() => {
    if (!initialEmail) {
      // agar direct open kare bina email ke
      navigate("/admin/forgot-password", { replace: true });
    }
  }, [initialEmail, navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");

    if (!email || !otp) {
      setErr("Please enter email and OTP.");
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`${BASE_API_URL}/api/admin/verify-otp`, {
        email,
        otp,
      });
      setMsg("OTP verified. You can now set a new password.");
      setTimeout(() => {
        navigate("/admin/reset-password", { state: { email, otp } });
      }, 1000);
    } catch (error) {
      setErr(error.response?.data?.message || "OTP verification failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    setErr("");
    setMsg("");
    try {
      await axios.post(`${BASE_API_URL}/api/admin/forgot-password`, { email });
      setMsg("New OTP sent. Check your inbox/spam.");
    } catch (error) {
      setErr(error.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setResending(false);
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
          Verify OTP
        </h1>
        <p className="text-xs text-slate-400 mb-2">
          Enter the 6-digit OTP sent to your admin email.
        </p>
        <p className="text-[11px] text-amber-300 mb-3">{timerMsg}</p>

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

        <form onSubmit={handleVerify} className="space-y-3">
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
          <div className="space-y-1">
            <label className="text-xs text-slate-300">OTP</label>
            <input
              type="text"
              maxLength={6}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 tracking-[0.3em] text-center focus:outline-none focus:ring-2 focus:ring-amber-400/70"
              value={otp}
              onChange={(e) => setOtp(e.target.value.toUpperCase())}
              placeholder="______"
            />
          </div>

          <div className="flex justify-between items-center text-[11px] text-slate-400">
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="text-amber-300 hover:text-amber-200"
            >
              {resending ? "Resending..." : "Resend OTP"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/forgot-password")}
              className="hover:text-slate-200"
            >
              Change email
            </button>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 bg-emerald-500 text-slate-950 text-xs font-semibold py-2 rounded-xl hover:bg-emerald-400 disabled:opacity-60"
          >
            {submitting ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
