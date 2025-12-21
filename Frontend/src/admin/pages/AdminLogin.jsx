import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion"; 
import axios from "axios";
import { useAdminAuth } from "../context/AdminAuthContext";

import SimpleCaptcha from "../components/SimpleCaptcha.jsx";

// 🔊 files
import loginMusic from "../../assets/admin/login-music.mp3";
import helloGeneric from "../../assets/admin/hello-generic.mp3";

const BASE_API_URL =
  import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

// 🔊 Voice greeting with fallback MP3
function speakGreeting(name) {
  if (typeof window === "undefined") return;

  if ("speechSynthesis" in window) {
    const utter = new SpeechSynthesisUtterance(
      `Hello ${name}, welcome to UrbanTales admin panel`
    );
    utter.rate = 1;
    utter.pitch = 1.1;
    utter.lang = "en-IN";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  } else {
    const audio = new Audio(helloGeneric);
    audio.play().catch(() => {});
  }
}

export default function AdminLogin() {
  const [form, setForm] = useState({
    identifier: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [playMusic, setPlayMusic] = useState(true);
  const [captchaValid, setCaptchaValid] = useState(false);
  const navigate = useNavigate();
  const { login } = useAdminAuth();

  // Background music (starts after first render, user has interacted by clicking)
  useEffect(() => {
    const audio = new Audio(loginMusic);
    audio.loop = true;
    audio.volume = 0.25;
    if (playMusic) {
      audio.play().catch(() => {});
    }
    return () => {
      audio.pause();
    };
  }, [playMusic]);

  const handleChange = (e) => {
    setError("");
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCaptchaValidity = (ok) => {
    setError("");
    setCaptchaValid(ok);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.identifier || !form.password) {
      setError("Please enter email/username and password.");
      return;
    }

    if (!captchaValid) {
      setError("Captcha is incorrect.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await axios.post(`${BASE_API_URL}/api/admin/login`, {
        identifier: form.identifier,
        password: form.password,
      });

      login(res.data);

      const name =
        res.data?.admin?.fullName || res.data?.admin?.username || "admin";
      speakGreeting(name);

      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center overflow-hidden relative">
      {/* animated gradient layer */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_0_0,#f97316_0,transparent_55%),radial-gradient(circle_at_100%_100%,#6366f1_0,transparent_55%)] opacity-40" />
      {/* animated blobs */}
      <motion.div
        className="absolute -top-40 -left-32 w-80 h-80 bg-purple-500/40 blur-3xl rounded-full"
        animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-40 -right-32 w-96 h-96 bg-blue-500/35 blur-3xl rounded-full"
        animate={{ x: [0, -30, 20, 0], y: [0, 30, -25, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md bg-slate-950/85 border border-slate-700/70 rounded-3xl p-8 shadow-[0_0_40px_rgba(15,23,42,0.9)] backdrop-blur-2xl"
      >
        {/* glowing ring */}
        <div className="absolute -inset-px rounded-3xl bg-linear-to-r from-amber-400/10 via-pink-500/10 to-indigo-500/10 pointer-events-none" />

        <div className="relative">
          {/* Top badge / logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center justify-between mb-6"
          >
            <div>
              <p className="text-sm text-slate-400">UrbanTales</p>
              <h1 className="text-2xl font-semibold bg-linear-to-r from-amber-300 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
                Admin Control Center
              </h1>
            </div>
            <button
              type="button"
              onClick={() => setPlayMusic((p) => !p)}
              className="text-xs px-3 py-1 rounded-full border border-slate-600 text-slate-300 hover:bg-slate-800/70 transition"
            >
              {playMusic ? "Mute" : "Music"}
            </button>
          </motion.div>

          <p className="text-sm text-slate-400 mb-6">
            Sign in with your admin credentials to access the dashboard.
          </p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 text-sm text-red-400 bg-red-950/40 border border-red-700/60 rounded-xl px-3 py-2"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm text-slate-300">
                Email or Username
              </label>
              <input
                type="text"
                name="identifier"
                value={form.identifier}
                onChange={handleChange}
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2.5 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400/60"
                placeholder="admin@example.com or superadmin"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm text-slate-300">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2.5 text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400/60"
                placeholder="••••••••"
              />
            </div>

            {/* Captcha */}
            <SimpleCaptcha onValidityChange={handleCaptchaValidity} />

            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Protected access for UrbanTales team only.</span>
              <button
                type="button"
                onClick={() => navigate("/admin/forgot-password")}
                className="text-amber-300 hover:text-amber-200"
              >
                Forgot password?
              </button>
            </div>

            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.97, y: 0 }}
              type="submit"
              disabled={submitting}
              className="w-full mt-2 bg-linear-to-r from-amber-400 via-pink-500 to-indigo-500 text-slate-950 font-semibold text-sm py-2.5 rounded-xl shadow-lg shadow-amber-500/30 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Signing in..." : "Sign in as Admin"}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
