import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HashLoader } from "react-spinners";

const BASE_API_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

const logoUrl =
  "https://drive.google.com/uc?export=view&id=1XxU_zf3_ZBDjuEWqGorEYUgBTzjoyaW_";

export default function ResetPasswordRequest() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    try {
      const res = await fetch(
        `${BASE_API_URL}/api/auth/reset-password/request`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setMsg("✅ OTP sent to your registered email.");
        setTimeout(
          () =>
            navigate(`/reset-password/otp?email=${encodeURIComponent(email)}`),
          1000
        );
      } else {
        setMsg(data.msg || "❌ Something went wrong.");
      }
    } catch {
      setMsg("⚠️ Server error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        className="space-y-5 bg-white shadow-lg p-7 rounded-2xl w-full max-w-md"
        onSubmit={handleSubmit}
      >
        <img src={logoUrl} className="mx-auto w-36 mb-4" alt="UrbanTales" />
        <h2 className="font-bold text-xl mb-3 text-[#070A52] text-center">
          Reset Password
        </h2>
        <input
          className="w-full border rounded px-4 py-3"
          value={email}
          type="email"
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your registered email"
          required
        />
        <button
          className="w-full py-3 bg-[#070A52] text-white rounded-xl hover:bg-[#FFCC00] mt-2 disabled:opacity-50"
          type="submit"
          disabled={loading}
        >
          {loading ? <HashLoader color="#fff" size={20} /> : "Send OTP"}
        </button>
        {msg && <div className="text-center mt-2 text-sm text-blue-600">{msg}</div>}
      </form>
    </div>
  );
}
