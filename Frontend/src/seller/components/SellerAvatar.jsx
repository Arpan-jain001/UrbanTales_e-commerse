import React from "react";

export default function SellerAvatar({ photoURL, name, size = "w-14 h-14", alt }) {
  return photoURL ? (
    <img src={photoURL} alt={alt || name} className={`rounded-full object-cover ${size} border-4 border-yellow-300`} />
  ) : (
    <div className={`rounded-full bg-[#440077] text-yellow-200 ${size} flex items-center justify-center font-bold text-2xl`}>
      {(name || "?")[0].toUpperCase()}
    </div>
  );
}
