import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HashLoader } from "react-spinners";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { motion, AnimatePresence } from "framer-motion";

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

/* ===================== INLINE CSS ===================== */
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

/* ===================== SMS Toast ===================== */
const SmsToast = ({ type = "info", message, onClose }) => {
  const bar =
    type === "success" ? "bg-emerald-500" : type === "error" ? "bg-red-500" : "bg-blue-500";
  const badge = type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️";

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
          <button onClick={onClose} className="text-xs text-slate-500 hover:text-slate-700" aria-label="Close toast">
            ✕
          </button>
        </div>
      </div>
    </motion.div>
  );
};

/* ===================== Saving Overlay ===================== */
const SavingOverlay = ({ text = "Saving changes..." }) => (
  <motion.div
    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/35 backdrop-blur-md"
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
      <HashLoader color="#070A52" size={44} />
      <p className="mt-4 text-sm text-slate-800 text-center font-medium">{text}</p>
      <p className="mt-1 text-xs text-slate-500 text-center">Please wait…</p>
    </motion.div>
  </motion.div>
);

/* ===================== Helpers ===================== */
const safeStr = (v) => String(v ?? "");

const getInitials = (name) => {
  const parts = safeStr(name).trim().split(" ").filter(Boolean);
  if (!parts.length) return "U";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

export default function EditProfile() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // ✅ Address is a STRING (free-text)
  const [user, setUser] = useState({
    profileImage: "",
    fullName: "",
    email: "",
    phone: "",
    address: "", // ✅ free text string
    dob: "",
    gender: "",
    role: "user",
    bio: "",
  });

  useEffect(() => () => window.clearTimeout(window.__toastTimer), []);

  const fireToast = (type, message) => {
    setToast({ type, message });
    window.clearTimeout(window.__toastTimer);
    window.__toastTimer = window.setTimeout(() => setToast(null), 2600);
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

  // ✅ Fetch profile from backend (source of truth)
  useEffect(() => {
    const run = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          fireToast("error", "Please log in first.");
          navigate("/login", { replace: true });
          return;
        }

        const res = await fetch(`${BACKEND_API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load profile");

        const u = data.user || {};

        // ✅ handle address string from backend:
        // - if backend saves address as string -> use it
        // - if backend returns array -> best-effort convert to string
        const addressString =
          typeof u.address === "string"
            ? u.address
            : Array.isArray(u.address) && u.address.length
            ? (u.address[0]?.street || "")
            : "";

        setUser({
          profileImage: safeStr(u.profileImage),
          fullName: safeStr(u.fullName),
          email: safeStr(u.email),
          phone: safeStr(u.phone),
          address: safeStr(addressString),
          dob: safeStr(u.dob),
          gender: safeStr(u.gender),
          role: safeStr(u.role || "user"),
          bio: safeStr(u.bio),
        });

        // optional cache for quick UI elsewhere
        localStorage.setItem("user", JSON.stringify(u));
      } catch (e) {
        console.error(e);
        fireToast("error", e.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Save profile to backend
  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) return fireToast("error", "Please log in first.");

    if (!user.fullName.trim()) return fireToast("error", "Full name is required.");
    if (!user.phone.trim()) return fireToast("error", "Phone is required.");

    setSaving(true);

    try {
      // ✅ address as STRING (free text) — anything allowed
      const payload = {
        fullName: user.fullName,
        phone: user.phone,
        address: user.address, // ✅ string
        bio: user.bio,
        dob: user.dob,
        gender: user.gender,
        profileImage: user.profileImage,
      };

      const res = await fetch(`${BACKEND_API_URL}/api/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        fireToast("error", data.message || "Update failed.");
        return;
      }

      // backend should return updated user
      localStorage.setItem("user", JSON.stringify(data.user));
      fireToast("success", "Profile updated successfully.");
      setTimeout(() => navigate("/profile"), 550);
    } catch (e) {
      console.error(e);
      fireToast("error", "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

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
        {toast && <SmsToast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <AnimatePresence>{saving && <SavingOverlay text="Saving changes…" />}</AnimatePresence>

      {/* Premium background */}
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
          {/* Header */}
          <div className="relative px-6 sm:px-10 py-8 border-b border-white/60">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(219,234,254,1)_0%,transparent_45%),radial-gradient(circle_at_80%_10%,rgba(224,231,255,1)_0%,transparent_45%),linear-gradient(135deg,rgba(255,255,255,0.85)_0%,rgba(248,250,252,0.85)_100%)]" />
            <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-5">
                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt="Profile"
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover shadow-lg border border-white"
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[#070A52] text-white flex items-center justify-center text-3xl font-extrabold shadow-lg">
                    {getInitials(user.fullName)}
                  </div>
                )}

                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight">
                    <span className="bg-[linear-gradient(90deg,#0ea5e9,#2563eb,#7c3aed,#0ea5e9)] bg-[length:200%_200%] bg-clip-text text-transparent animate-gradient">
                      Edit Profile
                    </span>
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    Update your details — address accepts any format (even a single character).
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-xl bg-[#070A52] text-white px-5 py-3 font-semibold shadow-md hover:brightness-110 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  💾 Save Changes
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/profile")}
                  disabled={saving}
                  className="rounded-xl bg-slate-100 text-slate-700 px-5 py-3 font-semibold border border-slate-200 hover:bg-slate-200 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Cancel
                </motion.button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Summary */}
              <div className="lg:col-span-1 rounded-3xl border border-slate-200 bg-white/85 shadow-sm p-6">
                <h3 className="text-lg font-bold text-slate-900">Profile Summary</h3>
                <p className="text-sm text-slate-600 mt-1">This appears on your profile page.</p>

                <div className="mt-5 space-y-3">
                  <MiniInfo label="Name" value={user.fullName || "Not set"} />
                  <MiniInfo label="Email" value={user.email || "Not set"} />
                  <MiniInfo label="Role" value={user.role || "user"} />
                </div>

                <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Address rule</p>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                    You can enter your address in any format — symbols, emojis, or even one letter — it will still save safely.
                  </p>
                </div>
              </div>

              {/* Right: Form */}
              <div className="lg:col-span-2 rounded-3xl border border-slate-200 bg-white/85 shadow-sm p-6">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <h3 className="text-lg font-bold text-slate-900">Personal Information</h3>
                  <span className="text-xs text-slate-500">Required fields must be filled</span>
                </div>

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Full Name" name="fullName" value={user.fullName} onChange={handleChange} required disabled={saving} />
                  <Field label="Email" name="email" type="email" value={user.email} onChange={handleChange} required disabled={true} />
                  <Field label="Phone" name="phone" value={user.phone} onChange={handleChange} required disabled={saving} />

                  <Field label="Date of Birth" name="dob" type="date" value={user.dob} onChange={handleChange} disabled={saving} />
                  <SelectField label="Gender" name="gender" value={user.gender} onChange={handleChange} options={["Male", "Female", "Other"]} disabled={saving} />

                  <Field label="Role" name="role" value={user.role} onChange={handleChange} disabled={true} />

                  <Field
                    label="Address (any format)"
                    name="address"
                    value={user.address}
                    onChange={handleChange}
                    className="sm:col-span-2"
                    disabled={saving}
                    placeholder="Type anything… even 'a' ✅"
                  />

                  <Field
                    label="Profile Image URL (optional)"
                    name="profileImage"
                    value={user.profileImage}
                    onChange={handleChange}
                    className="sm:col-span-2"
                    disabled={saving}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
                  <textarea
                    name="bio"
                    rows="4"
                    value={user.bio}
                    onChange={handleChange}
                    disabled={saving}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none
                    focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition resize-none disabled:opacity-60"
                    placeholder="Write something about yourself…"
                  />
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    disabled={saving}
                    className="sm:w-auto w-full rounded-xl bg-[#070A52] text-white px-5 py-3 font-semibold shadow-md hover:brightness-110 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    💾 Save Changes
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate("/profile")}
                    disabled={saving}
                    className="sm:w-auto w-full rounded-xl bg-slate-100 text-slate-700 px-5 py-3 font-semibold border border-slate-200 hover:bg-slate-200 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </motion.button>
                </div>

                <p className="mt-4 text-xs text-slate-500">Changes are saved securely to your account.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <Footer />
    </>
  );
}

/* ===================== Reusable fields ===================== */
function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  disabled = false,
  className = "",
  placeholder = "",
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value ?? ""}
        onChange={onChange}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none
        focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition disabled:opacity-60"
      />
    </div>
  );
}

function SelectField({ label, name, value, onChange, options, disabled = false }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <select
        name={name}
        value={value ?? ""}
        onChange={onChange}
        disabled={disabled}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none
        focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition disabled:opacity-60"
      >
        <option value="">Choose</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function MiniInfo({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs uppercase text-slate-500 tracking-wide font-semibold">{label}</p>
      <p className="text-sm font-semibold text-slate-900 mt-1 break-words">{value}</p>
    </div>
  );
}
