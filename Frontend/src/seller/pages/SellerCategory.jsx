import React, { useEffect, useState } from "react";
import SellerNavbar from "../components/SellerNavbar";
import SellerFooter from "../components/SellerFooter";
import SellerProductCard from "../components/SellerProductCard";
import { useSellerAuth } from "../context/SellerAuthContext";
import { useParams, useNavigate } from "react-router-dom";
import { HashLoader } from "react-spinners";

const CATEGORY_LIST = [
  "fashion", "electronic", "furniture", "kitchen", "toys", "cosmetic", "food", "sports", "appliances"
];

export default function SellerCategory() {
  const { category } = useParams();
  const { token, seller, logout } = useSellerAuth(); // Make sure seller context provides seller._id
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        // Get sellerId from context (must be set at login!)
        const sellerId = seller?._id;
        // Pass sellerId in query string
        const url =
          `${import.meta.env.VITE_BACKEND_API_URL}/api/products?category=${category}` +
          (sellerId ? `&sellerId=${sellerId}` : "");
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setProducts(data || []);
      } catch {
        logout();
      }
      setLoading(false);
    }
    fetchProducts();
  }, [token, seller, category, logout]);

  const deleteProduct = async (product) => {
    if (!window.confirm("Delete this product?")) return;
    await fetch(`${import.meta.env.VITE_BACKEND_API_URL}/api/products/${product._id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    setProducts(products.filter(p => p._id !== product._id));
  };

  if (loading)
    return <div className="flex items-center justify-center h-screen"><HashLoader color="#440077" size={80} /></div>;

  return (
    <>
      <SellerNavbar />
      <div className="min-h-screen flex bg-[#f8f6fc]">
        <aside className="w-64 bg-white rounded-r-xl shadow px-5 py-8 mr-10 mt-5">
          <h3 className="font-bold text-xl text-[#440077] mb-5">Categories</h3>
          <ul className="space-y-2">
            {CATEGORY_LIST.map((cat) => (
              <li key={cat}>
                <button
                  className={`w-full text-left px-4 py-2 rounded font-medium ${
                    cat === category
                      ? "bg-[#FFCC00] text-[#440077]"
                      : "text-[#440077] hover:bg-[#FFCC00]"
                  }`}
                  onClick={() => navigate(`/seller/category/${cat}`)}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              </li>
            ))}
          </ul>
        </aside>
        <main className="flex-1 p-7">
          <div className="flex items-center justify-between mb-7">
            <h1 className="text-3xl font-bold text-[#440077] capitalize">{category} Products</h1>
            <button
              className="px-6 py-2 bg-[#440077] text-white rounded-lg font-bold hover:bg-yellow-400 hover:text-[#440077] transition"
              onClick={() => navigate("/seller/add-product")}
            >
              + Add Product
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7">
            {products.map((product) => (
              <SellerProductCard
                key={product._id}
                product={product}
                onEdit={() => navigate(`/seller/edit-product/${product._id}`)}
                onDelete={deleteProduct}
              />
            ))}
          </div>
        </main>
      </div>
      <SellerFooter />
    </>
  );
}
