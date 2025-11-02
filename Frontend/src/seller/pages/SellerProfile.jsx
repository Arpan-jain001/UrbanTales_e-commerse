import React, { useState, useEffect } from "react";
import SellerNavbar from "../components/SellerNavbar";
import { useSellerAuth } from "../context/SellerAuthContext";

export default function SellerProfile() {
  const { seller, updateProfile, logout } = useSellerAuth();
  const [form, setForm] = useState({
    fullName: "", email: "", phone: "", shopName: "", address: "", bio: ""
  });
  const [editing, setEditing] = useState(false);
  useEffect(() => {
    if (seller) setForm({
      fullName: seller.fullName || "", email: seller.email || "", phone: seller.phone || "",
      shopName: seller.shopName || "", address: seller.address || "", bio: seller.bio || ""
    });
  }, [seller]);
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const saveUpdate = async () => {
    await updateProfile({ shopName: form.shopName, address: form.address, bio: form.bio });
    setEditing(false);
  };
  return (
    <>
      <SellerNavbar />
      <div className="min-h-screen bg-white py-10 flex items-center justify-center">
        <div className="bg-gray-50 p-10 rounded-xl shadow-xl w-full max-w-3xl">
          <h2 className="text-2xl font-bold text-[#440077] mb-3">Your Profile</h2>
          <div className="mb-4"><b>Name:</b> {form.fullName}</div>
          <div className="mb-4"><b>Email:</b> {form.email}</div>
          <div className="mb-4"><b>Phone:</b> {form.phone}</div>
          {editing
            ? <>
                <input name="shopName" value={form.shopName} onChange={handleChange} className="w-full mb-3 border rounded p-2" placeholder="Shop Name"/>
                <input name="address" value={form.address} onChange={handleChange} className="w-full mb-3 border rounded p-2" placeholder="Address"/>
                <textarea name="bio" value={form.bio} onChange={handleChange} className="w-full mb-3 border rounded p-2" placeholder="Bio"/>
                <button className="bg-[#440077] text-yellow-200 px-4 py-2 rounded" onClick={saveUpdate}>Update</button>
                <button className="ml-3 bg-gray-500 text-white px-4 py-2 rounded" onClick={() => setEditing(false)}>Cancel</button>
              </>
            : <>
                <div className="mb-4"><b>Shop:</b> {form.shopName || "N/A"}</div>
                <div className="mb-4"><b>Address:</b> {form.address || "N/A"}</div>
                <div className="mb-4"><b>Bio:</b> {form.bio || "N/A"}</div>
                <button className="bg-[#440077] text-yellow-200 py-2 px-4 rounded" onClick={() => setEditing(true)}>Edit Profile</button>
              </>
          }
          <button className="mt-6 bg-red-500 text-white px-3 py-1 rounded" onClick={logout}>Logout</button>
        </div>
      </div>
    </>
  )
}
