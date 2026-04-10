import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { motion, AnimatePresence } from "framer-motion";

const BASE_API_URL =
  import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

/* ===================== INLINE CSS (same file) ===================== */
const INLINE_CSS = `
@keyframes gradientMove {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
.animate-gradient { animation: gradientMove 7s ease infinite; }

.noise{
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='.35'/%3E%3C/svg%3E");
}

/* soft floating blobs */
@keyframes float1 { 0%,100%{ transform: translate3d(0,0,0) } 50%{ transform: translate3d(18px,-14px,0) } }
@keyframes float2 { 0%,100%{ transform: translate3d(0,0,0) } 50%{ transform: translate3d(-14px,18px,0) } }
.float-1{ animation: float1 10s ease-in-out infinite; }
.float-2{ animation: float2 12s ease-in-out infinite; }

/* tiny sparkle pulse */
@keyframes sparkle { 0%,100%{ opacity:.45; transform: scale(1) } 50%{ opacity:1; transform: scale(1.12) } }
.sparkle{ animation: sparkle 2.6s ease-in-out infinite; }
`;

/* ===================== Icon (inline) ===================== */
const Icon = ({ name }) => {
  const common = "w-5 h-5";
  if (name === "mail") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9Z"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="m6 8 6 4 6-4"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (name === "shield") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 3 19 6v6c0 5-3.5 8.5-7 9-3.5-.5-7-4-7-9V6l7-3Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="m9.5 12 1.8 1.8 3.7-4"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (name === "spark") {
    return (
      <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 2l1.1 5.1L18 8.2l-4.3 2.7L12 16l-1.7-5.1L6 8.2l4.9-1.1L12 2Z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M19 13l.6 2.6L22 16l-2.4.4L19 19l-.6-2.6L16 16l2.4-.4L19 13Z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return null;
};

/* ===================== SMS-style Toast ===================== */
const SmsToast = ({ type = "info", message, onClose }) => {
  const badge = type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️";
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
const SignupLoader = ({ text = "Creating your account..." }) => (
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
      <p className="mt-1 text-xs text-slate-500 text-center">Please wait…</p>
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

      <h3 className="mt-4 text-lg font-bold text-slate-900">Account created</h3>
      <p className="mt-1 text-sm text-slate-600">Redirecting to login…</p>

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

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null); // {type, message}
  const [showSuccess, setShowSuccess] = useState(false);

  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

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

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const successFlow = async (responseData) => {
    setShowSuccess(true);
    fireToast(
      "success",
      "Signup successful. Please verify your account from the email or OTP screen."
    );
    await new Promise((r) => setTimeout(r, 1200));
    setShowSuccess(false);
    navigate("/verify-account", {
      state: {
        email: responseData?.email || formData.email,
        actor: "user",
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting || showSuccess) return;

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      fireToast("error", "Passwords do not match.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const { data } = await axios.post(`${BASE_API_URL}/api/users/signup`, formData);
      setSubmitting(false);
      await successFlow(data);
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong.";
      setError(msg);
      fireToast("error", msg);
      setSubmitting(false);
    }
  };

  useEffect(() => {
    return () => window.clearTimeout(window.__toastTimer);
  }, []);

  return (
    <>
      <style>{INLINE_CSS}</style>

      <Navbar />

      <AnimatePresence>
        {submitting && <SignupLoader text="Creating your account…" />}
      </AnimatePresence>
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

      {/* ✅ Background same as login */}
      <div className="relative min-h-[calc(100vh-120px)] flex items-center justify-center overflow-hidden px-4 py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,#e0f2fe_0%,transparent_45%),radial-gradient(circle_at_90%_15%,#e9d5ff_0%,transparent_45%),radial-gradient(circle_at_40%_90%,#dbeafe_0%,transparent_45%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]" />
        <div className="absolute inset-0 opacity-[0.06] bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="noise absolute inset-0 opacity-[0.06] pointer-events-none" />

        {/* decorative blobs */}
        <div className="pointer-events-none absolute -top-10 left-8 h-40 w-40 rounded-full bg-blue-200/40 blur-2xl float-1" />
        <div className="pointer-events-none absolute bottom-8 right-10 h-44 w-44 rounded-full bg-indigo-200/40 blur-2xl float-2" />

        <motion.div
          className="relative w-full max-w-6xl"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {/* ✅ Opposite of Login: LEFT = Form, RIGHT = Info */}
          <motion.div
            variants={item}
            className="grid grid-cols-1 lg:grid-cols-2 rounded-3xl overflow-hidden
            shadow-[0_30px_90px_rgba(2,6,23,0.16)] border border-white/70 bg-white/65 backdrop-blur-xl"
          >
            {/* ✅ LEFT: FORM */}
            <motion.div variants={item} className="p-6 sm:p-10">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    Create account
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Create your account in seconds.
                  </p>
                </div>

                <span className="hidden sm:inline-flex items-center rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-xs font-medium border border-blue-100">
                  <span className="mr-2 sparkle inline-flex text-blue-700">
                    <Icon name="spark" />
                  </span>
                  Verified
                </span>
              </div>

              {/* ✅ Professional Info message (your requested text) */}
              <div className="mt-5 rounded-2xl border border-slate-200 bg-white/70 p-4 text-sm text-slate-700 shadow-sm">
                <div className="flex gap-3">
                  <div className="mt-[2px] text-slate-700">
                    <Icon name="mail" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">
                      Important — Verification First
                    </p>
                    <p className="mt-1 text-slate-600 leading-relaxed">
                      After signup, a <b>verification email</b> will be sent
                      first. Your <b>welcome email</b> will be sent only after
                      your account is verified. If you do not see the mail in
                      your inbox, please check your <b>Spam</b> folder as well.
                    </p>
                  </div>
                </div>
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

              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <motion.div whileHover={{ y: -1 }}>
                  <label className="text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Your full name"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none
                    focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition"
                    required
                    disabled={submitting || showSuccess}
                  />
                </motion.div>

                <motion.div whileHover={{ y: -1 }}>
                  <label className="text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone number"
                    value={formData.phone}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none
                    focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition"
                    required
                    disabled={submitting || showSuccess}
                  />
                </motion.div>

                <motion.div whileHover={{ y: -1 }}>
                  <label className="text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="name@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 outline-none
                    focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition"
                    required
                    disabled={submitting || showSuccess}
                  />
                </motion.div>

                <motion.div whileHover={{ y: -1 }}>
                  <label className="text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="mt-1 relative">
                    <input
                      type={showPass ? "text" : "password"}
                      name="password"
                      placeholder="Create password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 pr-14 outline-none
                      focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition"
                      required
                      disabled={submitting || showSuccess}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-600 hover:text-gray-900"
                      disabled={submitting || showSuccess}
                    >
                      {showPass ? "HIDE" : "SHOW"}
                    </button>
                  </div>
                </motion.div>

                <motion.div whileHover={{ y: -1 }}>
                  <label className="text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <div className="mt-1 relative">
                    <input
                      type={showConfirmPass ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirm password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 pr-14 outline-none
                      focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition"
                      required
                      disabled={submitting || showSuccess}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass((s) => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-600 hover:text-gray-900"
                      disabled={submitting || showSuccess}
                    >
                      {showConfirmPass ? "HIDE" : "SHOW"}
                    </button>
                  </div>
                </motion.div>

                <motion.button
                  type="submit"
                  disabled={submitting || showSuccess}
                  className={`w-full rounded-xl py-3 font-semibold text-white shadow-md transition ${
                    submitting || showSuccess ? "opacity-70 cursor-not-allowed" : ""
                  } bg-[#070A52] hover:brightness-110`}
                  whileHover={{ scale: submitting || showSuccess ? 1 : 1.01 }}
                  whileTap={{ scale: submitting || showSuccess ? 1 : 0.98 }}
                >
                  {submitting ? "Signing up..." : "Sign Up"}
                </motion.button>

                <p className="text-center text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-blue-700 font-medium hover:underline"
                  >
                    Sign in
                  </Link>
                </p>
              </form>
            </motion.div>

            {/* ✅ RIGHT: INFO CARD + illustration pattern */}
            <motion.div
              variants={item}
              className="relative overflow-hidden p-7 sm:p-10
              bg-[radial-gradient(circle_at_20%_20%,#dbeafe_0%,transparent_45%),radial-gradient(circle_at_80%_10%,#cffafe_0%,transparent_40%),radial-gradient(circle_at_60%_90%,#e9d5ff_0%,transparent_45%),linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]
              border-t lg:border-t-0 lg:border-l border-white/70"
            >
              {/* subtle shimmer */}
              <motion.div
                className="absolute -left-1/2 top-0 h-[220%] w-1/3 rotate-12 bg-white/60 blur-2xl"
                animate={{ x: ["-30%", "155%"] }}
                transition={{ repeat: Infinity, duration: 7.2, ease: "easeInOut" }}
              />
              <div className="absolute inset-0 bg-white/35 backdrop-blur-[2px]" />

              {/* decorative mini pattern */}
              <div className="pointer-events-none absolute -top-8 -right-10 h-44 w-44 rounded-full bg-blue-200/35 blur-2xl float-1" />
              <div className="pointer-events-none absolute bottom-6 -left-8 h-40 w-40 rounded-full bg-purple-200/35 blur-2xl float-2" />
              <div className="pointer-events-none absolute inset-0 opacity-[0.08] bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:72px_72px]" />

              <div className="relative">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/75 px-3 py-1 text-xs border border-slate-200 text-slate-700 shadow-sm">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    New account setup
                  </span>

                  <span className="inline-flex items-center gap-2 rounded-full bg-white/65 px-3 py-1 text-xs border border-slate-200 text-slate-700 shadow-sm">
                    <span className="sparkle inline-flex">
                      <Icon name="spark" />
                    </span>
                    Smooth onboarding
                  </span>
                </div>

                <h2
                  className="mt-5 text-3xl sm:text-4xl font-extrabold leading-tight
                  bg-[linear-gradient(90deg,#0ea5e9,#2563eb,#7c3aed,#0ea5e9)]
                  bg-[length:200%_200%] bg-clip-text text-transparent animate-gradient"
                >
                  Welcome to <br className="hidden sm:block" /> UrbanTales
                </h2>

                <p className="mt-3 text-slate-600 max-w-xl">
                  Create an account to get a personalized experience, order updates, and a secure profile.
                </p>

                <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                  <motion.div
                    whileHover={{ y: -3 }}
                    className="rounded-2xl bg-white/80 border border-slate-200 p-4
                    shadow-[0_12px_30px_rgba(2,6,23,0.06)] transition"
                  >
                    <div className="flex items-center gap-2 text-slate-900 font-semibold">
                      <span className="text-slate-700">
                        <Icon name="mail" />
                      </span>
                      Verification Email
                    </div>
                    <p className="text-sm text-slate-600 mt-1">
                      Sent immediately after signup. Welcome mail is sent after verification.
                    </p>
                  </motion.div>

                  <motion.div
                    whileHover={{ y: -3 }}
                    className="rounded-2xl bg-white/80 border border-slate-200 p-4
                    shadow-[0_12px_30px_rgba(2,6,23,0.06)] transition"
                  >
                    <div className="flex items-center gap-2 text-slate-900 font-semibold">
                      <span className="text-slate-700">
                        <Icon name="shield" />
                      </span>
                      Secure & Protected
                    </div>
                    <p className="text-sm text-slate-600 mt-1">
                      Your account information is handled securely.
                    </p>
                  </motion.div>
                </div>

                <p className="mt-7 text-xs sm:text-sm text-slate-500">
                  Already registered?{" "}
                  <Link to="/login" className="text-blue-700 font-medium hover:underline">
                    Go to Login
                  </Link>
                </p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      <Footer />
    </>
  );
};

export default Signup;
