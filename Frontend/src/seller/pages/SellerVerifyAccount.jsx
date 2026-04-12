import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useSellerAuth } from "../context/SellerAuthContext";

const BASE_API_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

const logoUrl =
  "https://drive.google.com/uc?export=view&id=1XxU_zf3_ZBDjuEWqGorEYUgBTzjoyaW_";

export default function SellerVerifyAccount() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useSellerAuth();
  const search = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const [email, setEmail] = useState(location.state?.email || search.get("email") || "");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const verificationToken = search.get("token") || "";

  const completeSellerLogin = (data) => {
    login(data.token, data.seller);
    navigate("/seller/dashboard", { replace: true });
  };

  const verifySeller = async (payload) => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const { data } = await axios.post(`${BASE_API_URL}/api/sellers/auth/verify-account`, payload);
      setMessage(data.message || "Seller account verified successfully.");
      completeSellerLogin(data);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!verificationToken) return;
    verifySeller({ token: verificationToken, email });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verificationToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || otp.length !== 6) return;
    await verifySeller({ email, otp });
  };

  const handleResend = async () => {
    if (!email) return;

    setResending(true);
    setError("");
    setMessage("");

    try {
      const { data } = await axios.post(`${BASE_API_URL}/api/sellers/auth/resend-verification`, {
        email,
      });
      setMessage(data.message || "Verification email resent successfully.");
      setOtp("");
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to resend verification email."
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-3xl shadow-2xl p-10 w-full">
          <div className="text-center mb-6">
            <img src={logoUrl} className="mx-auto w-28 mb-4" alt="UrbanTales" />
            <h2 className="text-3xl font-bold text-[#070A52] mb-2">Verify Seller Account</h2>
            <p className="text-sm text-gray-500">
              Verification is mandatory before entering the seller dashboard.
            </p>
          </div>

          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm text-center"
              >
                {message}
              </motion.div>
            )}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#070A52] transition"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Verification OTP
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#070A52] transition tracking-[0.35em] text-center"
                required
              />
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#070A52] to-[#0d1170] text-white font-bold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading || otp.length !== 6 || !email}
            >
              {loading ? "Verifying..." : "Verify & Login"}
            </motion.button>

            <button
              type="button"
              onClick={handleResend}
              disabled={resending || !email}
              className="w-full py-3 rounded-xl border-2 border-gray-200 font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resending ? "Resending..." : "Resend Verification Email"}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              Back to seller login?{" "}
              <Link to="/sellerlogin" className="text-[#070A52] font-bold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
