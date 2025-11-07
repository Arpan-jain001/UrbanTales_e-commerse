import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HashLoader } from "react-spinners";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

export default function EditProfile() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({
    profileImage: "",
    fullName: "",
    email: "",
    phone: "",
    address: "",
    dob: "",
    gender: "",
    role: "",
    bio: "",
  });

  // Load user data from localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      const savedUser = JSON.parse(localStorage.getItem("user"));
      if (savedUser) {
        setUser(savedUser);
      }
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Handle input field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Image Upload (Cloudinary)
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "unsigned_profile");
    formData.append("folder", "profile/image");

    try {
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dmtgrhnzl/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (res.ok) {
        const updatedUser = { ...user, profileImage: data.secure_url };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        alert("✅ Profile image uploaded successfully!");
      } else {
        console.error("Upload Error:", data);
        alert("❌ Failed to upload image.");
      }
    } catch (err) {
      console.error("Error uploading image:", err);
      alert("❌ Upload error.");
    }
  };

  // Remove profile image
  const handleRemoveImage = () => {
    const updatedUser = { ...user, profileImage: "" };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  // Save profile changes to backend
  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("User not authenticated!");
        return;
      }

      const res = await fetch(`${BACKEND_API_URL}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(user),
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ Profile updated successfully!");
        localStorage.setItem("user", JSON.stringify(data.user)); // Sync updated data
        navigate("/profile");
      } else {
        console.error("Update failed:", data);
        alert(data.message || "❌ Failed to update profile.");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("❌ Something went wrong.");
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
      <Navbar />
      <div className="min-h-screen bg-gradient-to-r from-blue-50 to-blue-100 flex items-center justify-center px-4 py-10">
        <div className="bg-white shadow-2xl rounded-2xl w-full max-w-3xl p-8">
          <h2 className="text-3xl font-bold text-center text-blue-700 mb-8">
            Edit Your Profile
          </h2>

          {/* Profile Image */}
          <div className="flex flex-col items-center mb-6">
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt="Profile"
                className="w-32 h-32 rounded-full border-4 border-blue-300 shadow-md object-cover mb-4"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center text-3xl font-bold mb-4 shadow-md">
                {user.fullName
                  ?.split(" ")
                  .map((w) => w[0]?.toUpperCase())
                  .join("")}
              </div>
            )}

            <div className="flex gap-4">
              <label className="px-4 py-2 bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700 transition">
                Choose File
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              {user.profileImage && (
                <button
                  onClick={handleRemoveImage}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                >
                  Remove Image
                </button>
              )}
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Full Name" name="fullName" value={user.fullName} onChange={handleChange} />
            <Input label="Email" name="email" value={user.email} onChange={handleChange} />
            <Input label="Phone" name="phone" value={user.phone} onChange={handleChange} />
            <Input label="Date of Birth" name="dob" type="date" value={user.dob} onChange={handleChange} />
            <Select label="Gender" name="gender" value={user.gender} onChange={handleChange} options={["Male", "Female", "Other"]} />
            <Input label="Role" name="role" value={user.role} onChange={handleChange} />
            <Input label="Address" name="address" value={user.address} onChange={handleChange} />
          </div>

          {/* Bio */}
          <div className="mt-4">
            <label className="block text-gray-700 text-sm mb-1">Bio</label>
            <textarea
              name="bio"
              rows="3"
              value={user.bio}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-blue-400 resize-none"
              placeholder="Write something about yourself..."
            />
          </div>

          {/* Buttons */}
          <div className="mt-6 flex justify-end gap-4">
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Save Changes
            </button>
            <button
              onClick={() => navigate("/profile")}
              className="px-5 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

function Input({ label, name, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="block text-gray-700 text-sm mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-blue-400"
        required
      />
    </div>
  );
}

function Select({ label, name, value, onChange, options }) {
  return (
    <div>
      <label className="block text-gray-700 text-sm mb-1">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-blue-400"
        required
      >
        <option value="">Choose Gender</option>
        {options.map((opt, idx) => (
          <option key={idx} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
