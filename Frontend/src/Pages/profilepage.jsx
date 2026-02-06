import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { HashLoader } from "react-spinners";

const BACKEND_API_URL =
  import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

/* ===================== INLINE CSS (same file) ===================== */
const INLINE_CSS = `
@keyframes gradientMove { 
  0%{background-position:0% 50%} 
  50%{background-position:100% 50%} 
  100%{background-position:0% 50%} 
}
.animate-gradient{ animation: gradientMove 7s ease infinite; }

.noise{
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='.35'/%3E%3C/svg%3E");
}

@keyframes float1 { 0%,100%{ transform: translate3d(0,0,0) } 50%{ transform: translate3d(18px,-14px,0) } }
@keyframes float2 { 0%,100%{ transform: translate3d(0,0,0) } 50%{ transform: translate3d(-14px,18px,0) } }
.float-1{ animation: float1 10s ease-in-out infinite; }
.float-2{ animation: float2 12s ease-in-out infinite; }
`;

/* ===================== small icons ===================== */
const I = ({ children }) => (
  <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm text-slate-700">
    {children}
  </span>
);

const IconMail = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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

const IconPhone = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M7 4h3l1 5-2 1c1 3 3 5 6 6l1-2 5 1v3c0 1-1 2-2 2-9 0-16-7-16-16 0-1 1-2 2-2Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  </svg>
);

const IconMap = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M10 4 4 6v14l6-2 4 2 6-2V4l-6 2-4-2Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path
      d="M10 4v14M14 6v14"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const IconUser = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path
      d="M4 21a8 8 0 0 1 16 0"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const IconLogout = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M10 7V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2v-1"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M15 12H3m0 0 3-3m-3 3 3 3"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/* ===================== Logout Modal ===================== */
const LogoutModal = ({ open, onClose, onConfirm, loggingOut }) => {
  if (!open) return null;
  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/45"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => !loggingOut && onClose()}
    >
      <motion.div
        className="w-full max-w-md rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden"
        initial={{ opacity: 0, scale: 0.92, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ type: "spring", stiffness: 220, damping: 18 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600">
              <IconLogout />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-extrabold text-slate-900">
                Confirm logout
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Are you sure you want to log out of your account?
              </p>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <motion.button
              whileTap={{ scale: 0.98 }}
              whileHover={{ scale: 1.01 }}
              onClick={onClose}
              disabled={loggingOut}
              className="flex-1 rounded-xl bg-slate-100 text-slate-700 py-3 font-semibold hover:bg-slate-200 transition disabled:opacity-60"
            >
              Cancel
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.98 }}
              whileHover={{ scale: 1.01 }}
              onClick={onConfirm}
              disabled={loggingOut}
              className="flex-1 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white py-3 font-semibold shadow-md hover:shadow-lg transition disabled:opacity-60 flex items-center justify-center"
            >
              {loggingOut ? <HashLoader color="#fff" size={18} /> : "Yes, logout"}
            </motion.button>
          </div>

          <p className="mt-4 text-xs text-slate-500">
            Tip: You can log in again anytime from the Login page.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ===================== Helpers ===================== */
const safeStr = (v) => String(v ?? "");

const addressToString = (address) => {
  // backend me address array store ho raha hai
  if (typeof address === "string") return address; // safety
  if (Array.isArray(address) && address.length) return address[0]?.street || "";
  return "";
};

const ProfilePage = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // ✅ user state (backend se fill hoga)
  const [user, setUser] = useState({
    fullName: "Guest User",
    email: "guest@example.com",
    phone: "0000000000",
    address: "Not added yet",
    dob: "N/A",
    gender: "N/A",
    role: "user",
    bio: "No bio added yet.",
    profileImage: "",
  });

  // ✅ Fetch from backend (always fresh)
  useEffect(() => {
    const run = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          // agar login nhi hai
          setLoading(false);
          navigate("/login", { replace: true });
          return;
        }

        const res = await fetch(`${BACKEND_API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch profile");

        const u = data.user || {};
        const formatted = {
          fullName: safeStr(u.fullName) || "User",
          email: safeStr(u.email),
          phone: safeStr(u.phone),
          address: safeStr(addressToString(u.address)) || "Not added yet",
          dob: safeStr(u.dob) || "N/A",
          gender: safeStr(u.gender) || "N/A",
          role: safeStr(u.role || "user"),
          bio: safeStr(u.bio) || "No bio added yet.",
          profileImage: safeStr(u.profileImage),
        };

        setUser(formatted);

        // optional cache (UI fast)
        localStorage.setItem("user", JSON.stringify(u));
      } catch (err) {
        console.error(err);
        // fallback: localStorage user (if available)
        const cached = JSON.parse(localStorage.getItem("user") || "null");
        if (cached) {
          setUser((prev) => ({
            ...prev,
            ...cached,
            address:
              safeStr(addressToString(cached.address)) || prev.address,
          }));
        }
      } finally {
        setLoading(false);
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getInitials = (name) => {
    const parts = safeStr(name).trim().split(" ").filter(Boolean);
    if (!parts.length) return "U";
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const doLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await new Promise((r) => setTimeout(r, 450));
      localStorage.clear();
      navigate("/WelcomePage", { replace: true });

      window.history.pushState(null, "", window.location.href);
      window.onpopstate = function () {
        window.history.pushState(null, "", window.location.href);
      };
    } finally {
      setLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  const cardIn = useMemo(
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <HashLoader color="#070A52" size={80} />
      </div>
    );
  }

  return (
    <>
      <style>{INLINE_CSS}</style>
      <Navbar />

      <AnimatePresence>
        {showLogoutModal && (
          <LogoutModal
            open={showLogoutModal}
            onClose={() => !loggingOut && setShowLogoutModal(false)}
            onConfirm={doLogout}
            loggingOut={loggingOut}
          />
        )}
      </AnimatePresence>

      <div className="relative min-h-[calc(100vh-120px)] flex items-center justify-center overflow-hidden px-4 py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,#e0f2fe_0%,transparent_45%),radial-gradient(circle_at_90%_15%,#e9d5ff_0%,transparent_45%),radial-gradient(circle_at_40%_90%,#dbeafe_0%,transparent_45%),linear-gradient(180deg,#f8fafc_0%,#eef2ff_100%)]" />
        <div className="absolute inset-0 opacity-[0.06] bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="noise absolute inset-0 opacity-[0.06] pointer-events-none" />
        <div className="pointer-events-none absolute -top-10 left-8 h-40 w-40 rounded-full bg-blue-200/40 blur-2xl float-1" />
        <div className="pointer-events-none absolute bottom-8 right-10 h-44 w-44 rounded-full bg-indigo-200/40 blur-2xl float-2" />

        <motion.div
          variants={cardIn}
          initial="hidden"
          animate="show"
          className="relative w-full max-w-6xl rounded-3xl overflow-hidden
          shadow-[0_30px_90px_rgba(2,6,23,0.16)] border border-white/70 bg-white/65 backdrop-blur-xl"
        >
          {/* HEADER */}
          <div className="relative px-6 sm:px-10 py-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(219,234,254,1)_0%,transparent_45%),radial-gradient(circle_at_80%_10%,rgba(224,231,255,1)_0%,transparent_45%),linear-gradient(135deg,rgba(255,255,255,0.85)_0%,rgba(248,250,252,0.85)_100%)]" />
            <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-5">
                <motion.div
                  initial={{ scale: 0.98, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 220, damping: 18 }}
                  className="relative"
                >
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt="Profile"
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover shadow-lg border border-white"
                    />
                  ) : (
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-[#070A52] text-white flex items-center justify-center text-4xl font-extrabold shadow-lg">
                      {getInitials(user.fullName)}
                    </div>
                  )}

                  <span className="absolute -bottom-2 -right-2 rounded-2xl border border-white/70 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                    {user.role || "user"}
                  </span>
                </motion.div>

                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight">
                    <span className="bg-[linear-gradient(90deg,#0ea5e9,#2563eb,#7c3aed,#0ea5e9)] bg-[length:200%_200%] bg-clip-text text-transparent animate-gradient">
                      {user.fullName}
                    </span>
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    Manage your profile details and account settings.
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/75 px-3 py-1 text-xs border border-slate-200 text-slate-700 shadow-sm">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      Account Active
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/65 px-3 py-1 text-xs border border-slate-200 text-slate-700 shadow-sm">
                      🔒 Secure
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/editprofile")}
                  className="rounded-xl bg-[#070A52] text-white px-5 py-3 font-semibold shadow-md hover:brightness-110 transition"
                >
                  ✏️ Edit Profile
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowLogoutModal(true)}
                  className="rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white px-5 py-3 font-semibold shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
                >
                  <IconLogout />
                  Logout
                </motion.button>
              </div>
            </div>
          </div>

          {/* BODY */}
          <div className="p-6 sm:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* LEFT */}
              <motion.div
                variants={cardIn}
                className="lg:col-span-1 rounded-3xl border border-slate-200 bg-white/80 shadow-sm p-6"
              >
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <I>
                    <IconUser />
                  </I>
                  Quick Details
                </h3>

                <div className="mt-5 space-y-4">
                  <MiniRow icon={<IconMail />} label="Email" value={user.email} />
                  <MiniRow
                    icon={<IconPhone />}
                    label="Phone"
                    value={user.phone}
                  />
                  <MiniRow icon={<IconMap />} label="Address" value={user.address} />
                </div>

                <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                    Bio
                  </p>
                  <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                    {user.bio || "No bio added yet."}
                  </p>
                </div>
              </motion.div>

              {/* RIGHT */}
              <motion.div
                variants={cardIn}
                className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white/80 shadow-sm p-6"
              >
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <h3 className="text-lg font-bold text-slate-900">
                    Personal Information
                  </h3>
                  <span className="text-xs text-slate-500">
                    Updated from your account data
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoCard label="Email" value={user.email} />
                  <InfoCard label="Phone" value={user.phone} />
                  <InfoCard label="Address" value={user.address} />
                  <InfoCard label="Date of Birth" value={user.dob} />
                  <InfoCard label="Gender" value={user.gender} />
                  <InfoCard label="Account Type" value={user.role} />
                </div>

                <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-semibold text-slate-900">Tip</p>
                  <p className="text-sm text-slate-600 mt-1">
                    Keep your phone number and address updated for smoother order
                    delivery and support.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>

      <Footer />
    </>
  );
};

export default ProfilePage;

/* ===================== Reusable UI ===================== */
function MiniRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm text-slate-700">
          {icon}
        </span>
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          {label}
        </p>
        <p className="text-sm font-semibold text-slate-900 break-words">
          {value || "Not provided"}
        </p>
      </div>
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition">
      <p className="text-xs uppercase text-slate-500 tracking-wide font-semibold">
        {label}
      </p>
      <p className="text-sm font-semibold text-slate-900 mt-1 break-words">
        {value || "Not provided"}
      </p>
    </div>
  );
}
