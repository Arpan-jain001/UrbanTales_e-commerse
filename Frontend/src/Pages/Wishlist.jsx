import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { getStoredUserToken } from "../utils/authStorage";

const BASE_API_URL =
  import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";
const formatCurrency = (value) => `Rs. ${Number(value || 0).toFixed(2)}`;

export default function Wishlist() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadWishlist = async () => {
    const token = getStoredUserToken();
    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${BASE_API_URL}/api/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to load wishlist.");
      }
      setItems(Array.isArray(data.wishlist) ? data.wishlist : []);
    } catch (err) {
      setError(err.message || "Unable to load wishlist.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const removeItem = async (productId) => {
    const token = getStoredUserToken();
    try {
      const res = await fetch(`${BASE_API_URL}/api/wishlist/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to remove wishlist item.");
      }
      setItems((prev) =>
        prev.filter((item) => String(item._id) !== String(productId))
      );
    } catch (err) {
      alert(err.message || "Unable to remove wishlist item.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-100 px-4 py-8 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl bg-white p-6 shadow-md">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
                  Saved For Later
                </p>
                <h1 className="mt-2 text-3xl font-bold text-[#070A52]">
                  Your Wishlist
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                  All saved products are coming directly from your account data.
                </p>
              </div>
              <Link
                to="/category"
                className="rounded-full bg-[#070A52] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#0d1170]"
              >
                Continue Shopping
              </Link>
            </div>

            {loading ? (
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                {[...Array(4)].map((_, idx) => (
                  <div
                    key={idx}
                    className="h-80 rounded-3xl bg-slate-200 animate-pulse"
                  />
                ))}
              </div>
            ) : error ? (
              <div className="mt-8 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            ) : items.length === 0 ? (
              <div className="mt-10 rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
                <p className="text-2xl font-semibold text-slate-800">
                  Your wishlist is empty.
                </p>
                <p className="mt-3 text-sm text-slate-500">
                  Save products from category or product pages and they will
                  appear here.
                </p>
              </div>
            ) : (
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                {items.map((item) => (
                  <div
                    key={item._id}
                    className="rounded-3xl bg-slate-50 p-4 shadow-sm ring-1 ring-slate-200"
                  >
                    <Link to={`/product/${item._id}`} className="block">
                      <img
                        src={item.images?.[0] || item.image}
                        alt={item.name}
                        className="h-64 w-full rounded-2xl object-cover bg-white"
                      />
                    </Link>
                    <div className="mt-4">
                      <Link
                        to={`/product/${item._id}`}
                        className="line-clamp-2 text-lg font-semibold text-slate-900"
                      >
                        {item.name}
                      </Link>
                      <p className="mt-1 text-sm text-slate-500">
                        {item.category}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-lg font-semibold text-[#070A52]">
                          {formatCurrency(item.price || 0)}
                        </span>
                        <span
                          className={`text-xs font-semibold ${
                            Number(item.stock || 0) > 0
                              ? "text-emerald-600"
                              : "text-rose-600"
                          }`}
                        >
                          {Number(item.stock || 0) > 0
                            ? "In Stock"
                            : "Out of Stock"}
                        </span>
                      </div>
                      {item.availableSizes?.length ? (
                        <p className="mt-2 text-xs text-slate-500">
                          Sizes: {item.availableSizes.join(", ")}
                        </p>
                      ) : null}
                      {item.availableColors?.length ? (
                        <p className="mt-1 text-xs text-slate-500">
                          Colors:{" "}
                          {item.availableColors
                            .map((color) => color.name || color)
                            .join(", ")}
                        </p>
                      ) : null}
                    </div>
                    <div className="mt-4 flex gap-3">
                      <Link
                        to={`/product/${item._id}`}
                        className="flex-1 rounded-full bg-[#070A52] px-4 py-2 text-center text-sm font-semibold text-white"
                      >
                        View Product
                      </Link>
                      <button
                        onClick={() => removeItem(item._id)}
                        className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
