import React, { useEffect, useState } from "react";

export default function SimpleCaptcha({ onValidityChange }) {
  const [code, setCode] = useState("");
  const [value, setValue] = useState("");

  const generate = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let str = "";
    for (let i = 0; i < 5; i++) {
      str += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCode(str);
    setValue("");
    onValidityChange(false);
  };

  useEffect(() => {
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInput = (e) => {
    const v = e.target.value;
    setValue(v);
    const ok = v && v.toUpperCase() === code;
    onValidityChange(ok);
  };

  return (
    <div className="space-y-1.5">
      <label className="text-sm text-slate-300">Captcha Verification</label>
      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center justify-between bg-slate-900/80 border border-slate-700/80 rounded-xl px-3 py-2.5">
          <span className="tracking-[0.35em] font-mono text-sm text-amber-300 select-none">
            {code}
          </span>
          <button
            type="button"
            onClick={generate}
            className="text-[11px] text-slate-400 hover:text-amber-300"
          >
            Refresh
          </button>
        </div>
        <input
          type="text"
          value={value}
          onChange={handleInput}
          className="w-32 bg-slate-900/80 border border-slate-700/80 rounded-xl px-2 py-2.5 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400/60"
          placeholder="Enter"
        />
      </div>
    </div>
  );
}
