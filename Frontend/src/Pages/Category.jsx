import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { HashLoader } from "react-spinners";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaStar,
  FaShoppingCart,
  FaHeart,
  FaRegHeart,
  FaFilter,
  FaSort,
  FaBolt,
  FaTimes,
} from "react-icons/fa";

const BASE_API_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

export default function Category() {
  const location = useLocation();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("default");
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [wishlist, setWishlist] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch products by category
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get("cat");

    if (!category) {
      setError("Invalid category");
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`${BASE_API_URL}/api/products/${category}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        setProducts(data);
        setFilteredProducts(data);
        setError(null);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch products");
        setLoading(false);
      });
  }, [location.search]);

  // Apply sorting
  useEffect(() => {
    let sorted = [...filteredProducts];

    switch (sortBy) {
      case "price-low-high":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-high-low":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "name-a-z":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-z-a":
        sorted.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }

    setFilteredProducts(sorted);
  }, [sortBy]);

  // Filter by price range
  const handlePriceFilter = () => {
    const filtered = products.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );
    setFilteredProducts(filtered);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setPriceRange([0, 100000]);
    setSortBy("default");
    setFilteredProducts(products);
  };

  const requestNotifyMe = async (product, e) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to request a stock notification.");
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(`${BASE_API_URL}/api/stock-alerts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: product._id }),
      });
      const data = await res.json();
      alert(data.message || "We will notify you when this product is back in stock.");
    } catch (err) {
      console.error("Notify me request failed:", err);
      alert("Unable to subscribe for stock alerts right now.");
    }
  };

  // Add to cart with login check + token invalid handling
  const addToCart = async (product, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (Number(product.stock || 0) <= 0) {
      await requestNotifyMe(product, e);
      return;
    }

    if (product?.availableSizes?.length || product?.availableColors?.length) {
      navigate(`/product/${product._id}`);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to add items to cart.");
      navigate("/login");
      return;
    }

    const mainImage =
      product.images && product.images.length > 0
        ? product.images[0]
        : product.image;

    const item = {
      id: product._id,
      name: product.name,
      price: product.price,
      image: mainImage,
      qty: 1,
      sellerId: product.sellerId,
    };

    try {
      const res = await fetch(`${BASE_API_URL}/api/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ item }),
      });

      const data = await res.json();

      if (res.status === 401 || res.status === 403 || data.message === "Invalid token") {
        localStorage.removeItem("token");
        alert("Session expired. Please login again.");
        navigate("/login");
        return;
      }

      alert(data.msg || (res.ok ? "Added to cart!" : "Error adding to cart"));
    } catch {
      alert("Server error");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchWishlist = async () => {
      try {
        const res = await fetch(`${BASE_API_URL}/api/wishlist`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && Array.isArray(data.wishlist)) {
          setWishlist(data.wishlist.map((item) => item._id || item.id || item));
        } else if (data.message === "Invalid token") {
          localStorage.removeItem("token");
          navigate("/login");
        }
      } catch (err) {
        console.error("Failed to load wishlist:", err);
      }
    };

    fetchWishlist();
  }, [navigate]);

  // Wishlist toggle (optionally adds to cart for logged in user)
  const toggleWishlist = async (product, e) => {
    e.preventDefault();
    e.stopPropagation();

    const productId = product._id;
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to manage your wishlist.");
      navigate("/login");
      return;
    }

    if (wishlist.includes(productId)) {
      try {
        const res = await fetch(`${BASE_API_URL}/api/wishlist/${productId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok) {
          setWishlist((prev) => prev.filter((id) => id !== productId));
          alert(data.message || "Removed from wishlist");
        } else if (data.message === "Invalid token") {
          localStorage.removeItem("token");
          navigate("/login");
        }
      } catch {
        alert("Unable to update wishlist. Please try again.");
      }
    } else {
      try {
        const res = await fetch(`${BASE_API_URL}/api/wishlist`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ productId }),
        });
        const data = await res.json();
        if (res.ok) {
          setWishlist((prev) => [...prev, productId]);
          alert(data.message || "Added to wishlist");
        } else if (data.message === "Invalid token") {
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          alert(data.message || "Unable to add to wishlist.");
        }
      } catch {
        alert("Unable to update wishlist. Please try again.");
      }
    }
  };

  // Loading state
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
          <HashLoader color="#070A52" size={80} />
        </div>
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
          <div className="text-center bg-white p-12 rounded-3xl shadow-2xl">
            <p className="text-red-600 text-xl mb-4">{error}</p>
            <Link
              to="/"
              className="inline-block px-6 py-3 bg-gradient-to-r from-[#070A52] to-[#0d1170] text-white rounded-xl hover:shadow-lg transition"
            >
              Go back to home
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const params = new URLSearchParams(location.search);
  const categoryName = params.get("cat");

  // MAIN RENDER
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
        {/* Premium Hero Section */}
        <div className="relative bg-gradient-to-r from-[#070A52] via-purple-900 to-indigo-900 text-white py-16 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden opacity-20">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute bg-white rounded-full"
                style={{
                  width: Math.random() * 100 + 50,
                  height: Math.random() * 100 + 50,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: Math.random() * 5 + 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-3 bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
                {categoryName
                  ? `${categoryName.charAt(0).toUpperCase() + categoryName.slice(1)}`
                  : "Category"}
              </h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-blue-200 text-lg"
              >
                Discover {filteredProducts.length} premium products
              </motion.p>
            </motion.div>
          </div>
        </div>

        {/* Filter Button & Results Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-4 mb-8 flex items-center justify-between"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowFilters(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition"
          >
            <FaFilter />
            <span>Filters</span>
          </motion.button>

          <div className="bg-gradient-to-r from-green-50 to-blue-50 px-4 py-2 rounded-xl">
            <span className="text-gray-700 text-sm font-semibold">
              Showing <span className="text-purple-600">{filteredProducts.length}</span> of{" "}
              <span className="text-purple-600">{products.length}</span>
            </span>
          </div>
        </motion.div>

        {/* Filter Sidebar */}
        <AnimatePresence>
          {showFilters && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowFilters(false)}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              />

              <motion.div
                initial={{ x: -400 }}
                animate={{ x: 0 }}
                exit={{ x: -400 }}
                transition={{ type: "spring", damping: 25 }}
                className="fixed left-0 top-0 h-full w-80 md:w-96 bg-white shadow-2xl z-50 overflow-y-auto"
              >
                <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 flex items-center justify-between shadow-lg z-10">
                  <div className="flex items-center gap-3">
                    <FaFilter className="text-2xl" />
                    <h2 className="text-2xl font-bold">Filters</h2>
                  </div>
                  <motion.button
                    whileHover={{ rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowFilters(false)}
                    className="bg-white/20 p-2 rounded-lg hover:bg-white/30 transition"
                  >
                    <FaTimes className="text-xl" />
                  </motion.button>
                </div>

                <div className="p-6 space-y-8">
                  {/* Sort By */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-2 rounded-lg">
                        <FaSort className="text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-800">Sort By</h3>
                    </div>
                    <div className="space-y-2">
                      {[
                        { value: "default", label: "Relevance" },
                        { value: "price-low-high", label: "Price: Low to High" },
                        { value: "price-high-low", label: "Price: High to Low" },
                        { value: "name-a-z", label: "Name: A to Z" },
                        { value: "name-z-a", label: "Name: Z to A" },
                      ].map((option) => (
                        <motion.label
                          key={option.value}
                          whileHover={{ x: 4 }}
                          className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition ${
                            sortBy === option.value
                              ? "bg-gradient-to-r from-purple-100 to-indigo-100 border-2 border-purple-500"
                              : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                          }`}
                        >
                          <input
                            type="radio"
                            name="sortBy"
                            value={option.value}
                            checked={sortBy === option.value}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-5 h-5 text-purple-600 focus:ring-purple-500"
                          />
                          <span className="font-medium text-gray-700">{option.label}</span>
                        </motion.label>
                      ))}
                    </div>
                  </div>

                  <div className="border-t-2 border-gray-200" />

                  {/* Price Range */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="bg-gradient-to-r from-orange-500 to-red-500 p-2 rounded-lg">
                        <span className="text-white text-lg font-bold">₹</span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-800">Price Range</h3>
                    </div>

                    <div className="space-y-4">
                      {/* Min */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">
                          Minimum Price
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
                            ₹
                          </span>
                          <input
                            type="number"
                            placeholder="0"
                            value={priceRange[0]}
                            onChange={(e) =>
                              setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])
                            }
                            className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 font-medium transition"
                          />
                        </div>
                      </div>

                      {/* Max */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-600 mb-2">
                          Maximum Price
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
                            ₹
                          </span>
                          <input
                            type="number"
                            placeholder="100000"
                            value={priceRange[1]}
                            onChange={(e) =>
                              setPriceRange([
                                priceRange[0],
                                parseInt(e.target.value) || 100000,
                              ])
                            }
                            className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 font-medium transition"
                          />
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-xl">
                        <p className="text-sm text-gray-600 font-medium">Selected Range:</p>
                        <p className="text-lg font-bold text-purple-600">
                          ₹{priceRange[0].toLocaleString()} - ₹
                          {priceRange[1].toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="sticky bottom-0 bg-white border-t-2 border-gray-200 p-6 shadow-lg">
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={clearFilters}
                      className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition"
                    >
                      Clear All
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handlePriceFilter}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-xl transition"
                    >
                      Apply Filters
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Products Grid */}
        <motion.div
          layout
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
        >
          <AnimatePresence>
            {filteredProducts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full text-center py-16"
              >
                <div className="bg-white rounded-3xl shadow-xl p-12 max-w-md mx-auto">
                  <p className="text-gray-500 text-lg mb-4">😔 No products found</p>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={clearFilters}
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition font-semibold"
                  >
                    Reset Filters
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              filteredProducts.map((product, index) => (
                <motion.div
                  key={product._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.03 }}
                  className="group"
                >
                  <Link to={`/product/${product._id}`}>
                    <motion.div
                      whileHover={{ y: -8 }}
                      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
                    >
                      <div className="relative aspect-square bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 overflow-hidden">
                        <motion.img
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.4 }}
                          src={
                            product.images && product.images.length > 0
                              ? product.images[0]
                              : product.image
                          }
                          alt={product.name}
                          className="w-full h-full object-contain p-4"
                        />

                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => toggleWishlist(product, e)}
                          className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2.5 shadow-lg hover:shadow-xl transition z-10"
                        >
                          {wishlist.includes(product._id) ? (
                            <FaHeart className="text-red-500 text-lg" />
                          ) : (
                            <FaRegHeart className="text-gray-400 text-lg" />
                          )}
                        </motion.button>

                        {product.originalPrice && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute top-3 left-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg"
                          >
                            🔥{" "}
                            {Math.round(
                              ((product.originalPrice - product.price) /
                                product.originalPrice) *
                                100
                            )}
                            % OFF
                          </motion.div>
                        )}

                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
                      </div>

                      <div className="p-4">
                        <h3 className="font-bold text-sm md:text-base text-gray-800 mb-2 line-clamp-2 group-hover:text-purple-600 transition min-h-[2.5rem]">
                          {product.name}
                        </h3>

                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center gap-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-2.5 py-1 rounded-lg text-xs font-bold shadow-md">
                            <span>4.3</span>
                            <FaStar className="text-xs" />
                          </div>
                          <span className="text-xs text-gray-500 font-medium">(234)</span>
                        </div>

                        <div className="flex items-baseline gap-2 mb-4">
                          <span className="text-xl md:text-2xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                            ₹{product.price}
                          </span>
                          {product.originalPrice && (
                            <span className="text-xs text-gray-400 line-through font-medium">
                              ₹{product.originalPrice}
                            </span>
                          )}
                        </div>
                        {Number(product.stock || 0) <= 0 && (
                          <div className="inline-flex items-center rounded-full bg-rose-500/10 border border-rose-500/20 px-3 py-1 text-xs text-rose-600 font-semibold mb-3">
                            Out of stock
                          </div>
                        )}

                        <motion.button
                          whileHover={{ scale: Number(product.stock || 0) <= 0 ? 1 : 1.02 }}
                          whileTap={{ scale: Number(product.stock || 0) <= 0 ? 1 : 0.98 }}
                          onClick={(e) =>
                            Number(product.stock || 0) <= 0 ? requestNotifyMe(product, e) : addToCart(product, e)
                          }
                          className={`w-full ${
                            Number(product.stock || 0) <= 0
                              ? "bg-slate-500 text-white"
                              : "bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white hover:shadow-xl"
                          } py-3 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden group/btn`}
                        >
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                            initial={{ x: "-100%" }}
                            whileHover={{ x: "100%" }}
                            transition={{ duration: 0.6 }}
                          />
                          <FaShoppingCart className="relative z-10" />
                          <span className="relative z-10">
                            {Number(product.stock || 0) <= 0 ? "Notify Me" : "Add to Cart"}
                          </span>
                        </motion.button>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </motion.div>

        {/* Load More */}
        {filteredProducts.length > 0 && filteredProducts.length >= 20 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mt-12"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-bold hover:shadow-2xl transition-all duration-300 flex items-center gap-3 mx-auto"
            >
              <FaBolt />
              Load More Products
            </motion.button>
          </motion.div>
        )}
      </div>
      <Footer />
    </>
  );
}
