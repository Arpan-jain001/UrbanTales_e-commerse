import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { saveUserAuth } from "../utils/authStorage";

const BASE_API_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

export default function VerifyAccount() {
  const navigate = useNavigate();
  const location = useLocation();
  const search = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const [email, setEmail] = useState(location.state?.email || search.get("email") || "");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const verificationToken = search.get("token") || "";

  const completeLogin = (data) => {
    saveUserAuth(data.token, data.user);
    navigate("/", { replace: true });
  };

  const verifyAccount = async (payload) => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const { data } = await axios.post(`${BASE_API_URL}/api/users/verify-account`, payload);
      setMessage(data.message || "Account verified successfully.");
      completeLogin(data);
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (verificationToken) {
      verifyAccount({ token: verificationToken, email });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verificationToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || otp.length !== 6) return;
    await verifyAccount({ email, otp });
  };

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    setError("");
    setMessage("");
    try {
      const { data } = await axios.post(`${BASE_API_URL}/api/users/resend-verification`, { email });
      setMessage(data.message || "Verification email resent.");
      setOtp("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend verification email.");
    } finally {
      setResending(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="relative min-h-[calc(100vh-120px)] flex items-center justify-center overflow-hidden px-4 py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,#e0f2fe_0%,transparent_45%),radial-gradient(circle_at_90%_15%,#e9d5ff_0%,transparent_45%),radial-gradient(circle_at_40%_90%,#dbeafe_0%,transparent_45%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative w-full max-w-xl rounded-3xl overflow-hidden shadow-[0_30px_90px_rgba(2,6,23,0.16)] border border-white/70 bg-white/75 backdrop-blur-xl p-6 sm:p-10"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Verify Account</h2>
              <p className="text-sm text-gray-500 mt-1">
                Verification is mandatory before login.
              </p>
            </div>
            <span className="hidden sm:inline-flex items-center rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-xs font-medium border border-blue-100">
              OTP + Link
            </span>
          </div>

          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
              >
                {message}
              </motion.div>
            )}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition"
                placeholder="name@email.com"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Verification OTP</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none tracking-[0.4em] text-center text-lg focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition"
                placeholder="000000"
                required
              />
            </div>

            <motion.button
              type="submit"
              disabled={loading || otp.length !== 6 || !email}
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full rounded-xl py-3 font-semibold text-white shadow-md transition bg-[#070A52] hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Verifying..." : "Verify & Login"}
            </motion.button>

            <button
              type="button"
              onClick={handleResend}
              disabled={resending || !email}
              className="w-full rounded-xl py-3 font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {resending ? "Resending..." : "Resend Verification Email"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already verified?{" "}
            <Link to="/login" className="text-blue-700 font-medium hover:underline">
              Go to Login
            </Link>
          </p>
        </motion.div>
      </div>
      <Footer />
    </>
  );
}
