import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const modalCopy = {
  unverify: {
    title: "Mark Account Unverified",
    submitLabel: "Mark Unverified",
    checkboxLabel: "Send a fresh verification email immediately",
    placeholder: "Explain why this account is being marked unverified...",
  },
  delete: {
    title: "Delete Account",
    submitLabel: "Delete Account",
    checkboxLabel: "",
    placeholder: "Enter the mandatory deletion reason for audit trail...",
  },
};

export default function VerificationActionModal({
  open,
  mode,
  label,
  loading,
  onClose,
  onSubmit,
}) {
  const [reason, setReason] = useState("");
  const [sendEmail, setSendEmail] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setReason("");
      setSendEmail(true);
      setError("");
    }
  }, [open]);

  if (!open || !mode) {
    return null;
  }

  const copy = modalCopy[mode];

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedReason = reason.trim();

    if (!trimmedReason) {
      setError("Reason is required for this action.");
      return;
    }

    setError("");
    await onSubmit({ reason: trimmedReason, sendEmail });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[90] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={loading ? undefined : onClose}
      >
        <motion.form
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          onSubmit={handleSubmit}
          onClick={(event) => event.stopPropagation()}
          className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-950 shadow-[0_24px_80px_rgba(2,6,23,0.85)] overflow-hidden"
        >
          <div className="px-6 py-5 border-b border-slate-800">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500 font-semibold">
              Admin Action
            </p>
            <h3 className="mt-2 text-xl font-semibold text-slate-100">{copy.title}</h3>
            <p className="mt-1 text-sm text-slate-400">
              {label ? `Target: ${label}` : "Target account"}.
            </p>
          </div>

          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Reason</label>
              <textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                rows={4}
                placeholder={copy.placeholder}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40 resize-none"
              />
            </div>

            {mode === "unverify" ? (
              <label className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3">
                <input
                  type="checkbox"
                  checked={sendEmail}
                  onChange={(event) => setSendEmail(event.target.checked)}
                  className="mt-1 rounded border-slate-600 bg-slate-950"
                />
                <span className="text-sm text-slate-300">{copy.checkboxLabel}</span>
              </label>
            ) : null}

            {error ? (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
                {error}
              </div>
            ) : null}
          </div>

          <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-sm font-semibold text-slate-300 hover:bg-slate-900 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition disabled:opacity-50 ${
                mode === "delete"
                  ? "bg-gradient-to-r from-rose-600 to-red-600 hover:brightness-110"
                  : "bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-110"
              }`}
            >
              {loading ? "Saving..." : copy.submitLabel}
            </button>
          </div>
        </motion.form>
      </motion.div>
    </AnimatePresence>
  );
}
