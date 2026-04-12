import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import axios from "axios";
import { auth, provider } from "../../utils/firebase";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { saveUserAuth } from "../utils/authStorage";

const BASE_API_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

/* ===================== INLINE CSS (same file) ===================== */
const INLINE_CSS = `
@keyframes gradientMove {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.animate-gradient {
  animation: gradientMove 7s ease infinite;
}
.noise{
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='.35'/%3E%3C/svg%3E");
}
`;

/* ===================== Toast (SMS-like) ===================== */
const SmsToast = ({ type = "info", message, onClose }) => {
  const badge =
    type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️";

  const bar =
    type === "success"
      ? "bg-emerald-500"
      : type === "error"
      ? "bg-red-500"
      : "bg-blue-500";

  return (
    <motion.div
      className="fixed z-[10000] bottom-5 right-5 w-[92%] max-w-sm"
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 260, damping: 18 }}
      role="status"
      aria-live="polite"
    >
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
        <div className={`h-1 w-full ${bar}`} />
        <div className="px-4 py-3 flex gap-3 items-start">
          <div className="h-10 w-10 rounded-2xl bg-[#070A52] text-white flex items-center justify-center text-sm font-bold shadow-sm">
            UT
          </div>
          <div className="flex-1">
            <div className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <span>{badge}</span>
              <span>UrbanTales</span>
            </div>
            <div className="text-sm text-slate-600 mt-0.5">{message}</div>
          </div>
          <button
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-700"
            aria-label="Close toast"
          >
            ✕
          </button>
        </div>
      </div>
    </motion.div>
  );
};

/* ===================== Loader ===================== */
const LoginLoader = ({ text = "Logging you in..." }) => (
  <motion.div
    className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/35 backdrop-blur-md"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <motion.div
      className="w-[92%] max-w-sm rounded-3xl bg-white shadow-2xl p-7 flex flex-col items-center border border-white/60"
      initial={{ y: 18, opacity: 0, scale: 0.98 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={{ y: 10, opacity: 0, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
    >
      <div className="relative">
        <motion.div
          className="h-14 w-14 rounded-full border-4 border-gray-200 border-t-[#070A52]"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-0 m-auto h-3 w-3 rounded-full bg-[#070A52]"
          animate={{ scale: [1, 1.35, 1] }}
          transition={{ repeat: Infinity, duration: 0.9, ease: "easeInOut" }}
        />
      </div>
      <p className="mt-4 text-sm text-slate-800 text-center font-medium">
        {text}
      </p>
      <p className="mt-1 text-xs text-slate-500 text-center">
        Please wait a moment…
      </p>
    </motion.div>
  </motion.div>
);

/* ===================== Success Overlay ===================== */
const SuccessOverlay = () => (
  <motion.div
    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-md"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <motion.div
      className="w-[92%] max-w-sm rounded-3xl bg-white shadow-2xl p-7 border border-white/60 text-center"
      initial={{ y: 18, opacity: 0, scale: 0.98 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
    >
      <motion.div
        className="mx-auto h-14 w-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center"
        initial={{ scale: 0.9 }}
        animate={{ scale: [0.9, 1.08, 1] }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <motion.svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <motion.path
            d="M20 6L9 17l-5-5"
            stroke="#059669"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.svg>
      </motion.div>

      <h3 className="mt-4 text-lg font-bold text-slate-900">
        Login successful
      </h3>
      <p className="mt-1 text-sm text-slate-600">Redirecting…</p>

      <div className="mt-4 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
        <motion.div
          className="h-full bg-emerald-500"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 1.05, ease: "easeInOut" }}
        />
      </div>
    </motion.div>
  </motion.div>
);

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [toast, setToast] = useState(null); // { type, message }

  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("Logging you in...");

  const [rememberMe, setRememberMe] = useState(true);
  const [showPass, setShowPass] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);

  const navigate = useNavigate();

  const container = useMemo(
    () => ({
      hidden: { opacity: 0 },
      show: { opacity: 1, transition: { staggerChildren: 0.08 } },
    }),
    []
  );

  const item = useMemo(
    () => ({
      hidden: { opacity: 0, y: 16, scale: 0.99 },
      show: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: "spring", stiffness: 220, damping: 18 },
      },
    }),
    []
  );

  const fireToast = (type, message) => {
    setToast({ type, message });
    window.clearTimeout(window.__toastTimer);
    window.__toastTimer = window.setTimeout(() => setToast(null), 2600);
  };

  const successFlow = async () => {
    setShowSuccess(true);
    fireToast("success", "Welcome back! ✅ Login successful.");
    await new Promise((r) => setTimeout(r, 1100));
    setShowSuccess(false);
    navigate("/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading || showSuccess) return;

    setError("");
    setIsLoading(true);
    setLoadingText("Logging in with email…");

    try {
      const { data } = await axios.post(`${BASE_API_URL}/api/users/login`, {
        email,
        password,
      });

      saveUserAuth(data.token, data.user, { remember: rememberMe });
      setIsLoading(false);
      await successFlow();
    } catch (err) {
      const apiError = err.response?.data || {};
      if (apiError?.requiresVerification) {
        setIsLoading(false);
        navigate("/verify-account", {
          state: {
            email,
            actor: "user",
            verificationDeadline: apiError.verificationDeadline,
          },
        });
        return;
      }
      const msg = apiError?.message || "Login failed.";
      setError(msg);
      fireToast("error", msg);
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (isLoading || showSuccess) return;

    setError("");
    setIsLoading(true);
    setLoadingText("Signing in with Google…");

    try {
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      const response = await axios.post(
        `${BASE_API_URL}/api/users/google-firebase`,
        { token: idToken }
      );

      saveUserAuth(response.data.token, response.data.user, { remember: rememberMe });
      setIsLoading(false);
      await successFlow();
    } catch (err) {
      console.error(err);
      setError("Google Sign-in failed.");
      fireToast("error", "Google Sign-in failed.");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      window.clearTimeout(window.__toastTimer);
    };
  }, []);

  return (
    <>
      {/* inline css in same file */}
      <style>{INLINE_CSS}</style>

      <Navbar />

      <AnimatePresence>{isLoading && <LoginLoader text={loadingText} />}</AnimatePresence>
      <AnimatePresence>{showSuccess && <SuccessOverlay />}</AnimatePresence>

      <AnimatePresence>
        {toast && (
          <SmsToast
            type={toast.type}
            message={toast.message}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      {/* ✅ Premium background (same as you asked) */}
      <div className="relative min-h-[calc(100vh-120px)] flex items-center justify-center overflow-hidden px-4 py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,#e0f2fe_0%,transparent_45%),radial-gradient(circle_at_90%_15%,#e9d5ff_0%,transparent_45%),radial-gradient(circle_at_40%_90%,#dbeafe_0%,transparent_45%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]" />
        <div className="absolute inset-0 opacity-[0.06] bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="noise absolute inset-0 opacity-[0.06] pointer-events-none" />

        <motion.div className="relative w-full max-w-6xl" variants={container} initial="hidden" animate="show">
          <motion.div
            variants={item}
            className="grid grid-cols-1 lg:grid-cols-2 rounded-3xl overflow-hidden
            shadow-[0_30px_90px_rgba(2,6,23,0.16)] border border-white/70 bg-white/65 backdrop-blur-xl"
          >
            {/* ✅ LEFT PANEL (Light so gradient text is readable) */}
            <motion.div
              variants={item}
              className="relative overflow-hidden p-7 sm:p-10
              bg-[radial-gradient(circle_at_20%_20%,#dbeafe_0%,transparent_45%),radial-gradient(circle_at_80%_10%,#cffafe_0%,transparent_40%),radial-gradient(circle_at_60%_90%,#e9d5ff_0%,transparent_45%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]
              border-b lg:border-b-0 lg:border-r border-white/70"
            >
              {/* subtle shimmer */}
              <motion.div
                className="absolute -left-1/2 top-0 h-[220%] w-1/3 rotate-12 bg-white/60 blur-2xl"
                animate={{ x: ["-30%", "155%"] }}
                transition={{ repeat: Infinity, duration: 7.0, ease: "easeInOut" }}
              />

              <div className="absolute inset-0 bg-white/35 backdrop-blur-[2px]" />

              <div className="relative">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/75 px-3 py-1 text-xs border border-slate-200 text-slate-700 shadow-sm">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Secure Login • Firebase + JWT
                  </span>

                  <span className="inline-flex items-center gap-2 rounded-full bg-white/65 px-3 py-1 text-xs border border-slate-200 text-slate-700 shadow-sm">
                    ⚡ Fast & Smooth
                  </span>
                </div>

                {/* ✅ Gradient Heading (animated) */}
                <h2
                  className="mt-5 text-3xl sm:text-4xl font-extrabold leading-tight
                  bg-[linear-gradient(90deg,#0ea5e9,#2563eb,#7c3aed,#0ea5e9)]
                  bg-[length:200%_200%] bg-clip-text text-transparent animate-gradient"
                >
                  Welcome back <br className="hidden sm:block" /> to UrbanTales
                </h2>

                <p className="mt-3 text-slate-600 max-w-xl">
                  Log in to continue shopping, manage your orders, and access your account instantly.
                </p>

                <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                  <motion.div
                    whileHover={{ y: -3 }}
                    className="rounded-2xl bg-white/80 border border-slate-200 p-4
                    shadow-[0_12px_30px_rgba(2,6,23,0.06)] transition"
                  >
                    <p className="font-semibold text-slate-900">🚀 Fast access</p>
                    <p className="text-sm text-slate-600">Google login or email/password.</p>
                  </motion.div>

                  <motion.div
                    whileHover={{ y: -3 }}
                    className="rounded-2xl bg-white/80 border border-slate-200 p-4
                    shadow-[0_12px_30px_rgba(2,6,23,0.06)] transition"
                  >
                    <p className="font-semibold text-slate-900">🛡️ Protected</p>
                    <p className="text-sm text-slate-600">Tokens saved as per “Remember me”.</p>
                  </motion.div>
                </div>

                <p className="mt-7 text-xs sm:text-sm text-slate-500">
                  By continuing, you agree to our terms & privacy policy.
                </p>
              </div>
            </motion.div>

            {/* ✅ RIGHT PANEL */}
            <motion.div variants={item} className="p-6 sm:p-10">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Login</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Please enter your details to continue.
                  </p>
                </div>

                <span className="hidden sm:inline-flex items-center rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-xs font-medium border border-blue-100">
                  🔒 Secure
                </span>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                onClick={handleGoogleLogin}
                disabled={isLoading || showSuccess}
                className={`mt-6 w-full rounded-xl bg-white border border-gray-200 px-4 py-3 text-gray-800 flex items-center justify-center gap-3 shadow-sm hover:shadow-md transition ${
                  isLoading || showSuccess ? "opacity-70 cursor-not-allowed" : ""
                }`}
                whileHover={{ scale: isLoading || showSuccess ? 1 : 1.01 }}
                whileTap={{ scale: isLoading || showSuccess ? 1 : 0.98 }}
              >
                <img
                  src="https://www.svgrepo.com/show/355037/google.svg"
                  className="w-5 h-5"
                  alt="Google"
                />
                <span className="font-medium">
                  {isLoading ? "Please wait..." : "Continue with Google"}
                </span>
              </motion.button>

              <div className="flex items-center gap-3 my-6">
                <div className="h-px w-full bg-gray-200" />
                <p className="text-xs text-gray-400">OR</p>
                <div className="h-px w-full bg-gray-200" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <motion.div whileHover={{ y: -1 }}>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    placeholder="name@email.com"
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none
                    focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading || showSuccess}
                  />
                </motion.div>

                <motion.div whileHover={{ y: -1 }}>
                  <label className="text-sm font-medium text-gray-700">Password</label>
                  <div className="mt-1 relative">
                    <input
                      type={showPass ? "text" : "password"}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 pr-14 outline-none
                      focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading || showSuccess}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-600 hover:text-gray-900"
                      disabled={isLoading || showSuccess}
                    >
                      {showPass ? "HIDE" : "SHOW"}
                    </button>
                  </div>
                </motion.div>

                <div className="flex items-center justify-between pt-1">
                  <label className="text-sm text-gray-600 flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      disabled={isLoading || showSuccess}
                    />
                    Keep me logged in
                  </label>

                  <Link to="/reset-password" className="text-sm text-blue-700 hover:underline">
                    Forgot password?
                  </Link>
                </div>

                <motion.button
                  type="submit"
                  disabled={isLoading || showSuccess}
                  className={`w-full rounded-xl py-3 font-semibold text-white shadow-md transition ${
                    isLoading || showSuccess ? "opacity-70 cursor-not-allowed" : ""
                  } bg-[#070A52] hover:brightness-110`}
                  whileHover={{ scale: isLoading || showSuccess ? 1 : 1.01 }}
                  whileTap={{ scale: isLoading || showSuccess ? 1 : 0.98 }}
                >
                  {isLoading ? "Logging in..." : "Log in"}
                </motion.button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-600">
                Don’t have an account?{" "}
                <Link to="/register" className="text-blue-700 font-medium hover:underline">
                  Sign up
                </Link>
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      <Footer />
    </>
  );
};

export default Login;
