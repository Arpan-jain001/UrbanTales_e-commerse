import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { HashLoader } from "react-spinners";

// Helper: get thumbnails for images/videos
const getMediaItems = (product) => {
  const arr = [];
  if (product.images?.length) {
    product.images.forEach(url => arr.push({ type: "image", url }));
  }
  if (product.videos?.length) {
    product.videos.forEach(url => arr.push({ type: "video", url }));
  }
  if ((!product.images?.length) && product.image)
    arr.unshift({ type: "image", url: product.image });
  return arr;
};

export default function SingleProduct() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(0);
  const [showAll, setShowAll] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:3000/api/products/id/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load product");
        return res.json();
      })
      .then((data) => {
        setProduct(data);
        setSelected(0);
        if (data?.category) {
          fetch(`http://localhost:3000/api/products/${data.category}`)
            .then(res => res.json())
            .then((all) => {
              setSuggestions(Array.isArray(all) ? all.filter(p => p._id !== id).slice(0, 4) : []);
            });
        } else {
          setSuggestions([]);
        }
        setError(null);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load product");
        setLoading(false);
      });
  }, [id]);

  const addToCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in.");
      navigate("/login");
      return;
    }
    const mainImage = getMediaItems(product)[selected]?.url || product.images?.[0] || product.image;
    const item = {
      id: product._id,
      name: product.name,
      price: product.price,
      image: mainImage,
      qty: 1
    };
    try {
      const res = await fetch("http://localhost:3000/api/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ item }),
      });
      const data = await res.json();
      alert(data.msg || (res.ok ? "Added to cart!" : "Error"));
    } catch {
      alert("Server error");
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen bg-white"><HashLoader color="#070A52" size={80} /></div>;
  if (error) return <div className="text-center text-red-600 mt-10">{error}</div>;
  if (!product) return null;

  const mediaItems = getMediaItems(product);
  const maxThumbnails = 6;
  const thumbnailsToShow = showAll ? mediaItems : mediaItems.slice(0, maxThumbnails);
  const remainingCount = mediaItems.length - maxThumbnails;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-b from-[#f6f6fc] to-[#fff] py-10 px-4 md:px-0">
        {/* Main container: flex-col on mobile, flex-row on md+ */}
        <div className="bg-white rounded-3xl shadow-xl max-w-5xl mx-auto p-6 md:p-10 mb-12 flex flex-col md:flex-row gap-8">

          {/* Left: Image + Thumbnails */}
          <div className="flex-1 flex flex-col items-center">
            {/* Main Image */}
            {mediaItems[selected]?.type === "image" ? (
              <img
                src={mediaItems[selected]?.url}
                alt={product.name}
                className="rounded-2xl max-w-full max-h-[400px] object-contain transition-transform duration-300 ease-in-out shadow-lg hover:scale-105 bg-white p-4"
              />
            ) : (
              <video
                controls
                src={mediaItems[selected]?.url}
                className="rounded-2xl max-w-full max-h-[400px] object-contain bg-black shadow-lg"
              >
                Sorry, your browser does not support embedded videos.
              </video>
            )}
            {/* Thumbnails below main image */}
            <div className="flex mt-4 space-x-4 overflow-x-auto no-scrollbar w-full justify-center md:justify-start">
              {thumbnailsToShow.map((item, i) => (
                <button
                  key={i}
                  aria-label={`${item.type === 'video' ? 'Video' : 'Image'} thumbnail ${i + 1}`}
                  className={`rounded-lg p-1 border cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 transition-shadow duration-300 flex-shrink-0 
                    ${selected === i ? 'border-yellow-400 shadow-lg' : 'border-gray-300'}`}
                  style={{ width: 56, height: 56, position: "relative" }}
                  onClick={() => setSelected(i)}
                >
                  {item.type === "image" ? (
                    <img src={item.url} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-contain rounded" />
                  ) : (
                    <div className="relative w-full h-full bg-gray-200 flex items-center justify-center rounded">
                      <svg viewBox="0 0 40 40" width={24} height={24} className="absolute inset-0 m-auto text-yellow-400 fill-current">
                        <circle cx="20" cy="20" r="18" fill="white" stroke="currentColor" strokeWidth="2" />
                        <polygon points="17,14 28,20 17,26" fill="currentColor" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
              {!showAll && remainingCount > 0 && (
                <button
                  onClick={() => setShowAll(true)}
                  className="mb-2 px-3 py-2 border rounded bg-gray-100 text-gray-500 font-semibold cursor-pointer w-14 text-center text-sm flex-shrink-0"
                  aria-label={`Show ${remainingCount} more`}
                >
                  +{remainingCount}
                </button>
              )}
            </div>
          </div>

          {/* Right: Product Name, Description and Add to Cart */}
          <div className="flex-1 flex flex-col justify-center text-center md:text-left md:pl-8">
            <h1 className="text-4xl font-bold text-[#070A52] mb-4">{product.name}</h1>
            <p className="text-gray-700 text-lg mb-6">{product.description || "No description available."}</p>
            <div className="text-purple-700 font-extrabold text-3xl mb-6">₹{product.price}</div>
            <button
              onClick={addToCart}
              className="px-10 py-4 rounded-xl bg-gradient-to-tr from-orange-500 to-orange-600 text-white font-semibold shadow-lg hover:from-orange-600 hover:to-orange-700 active:scale-95 transition transform mx-auto md:mx-0"
            >
              Add to Cart
            </button>
          </div>

        </div>

        {/* Suggested Products */}
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-[#070A52] mb-8">Suggested Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {suggestions.length === 0 ? (
              <div className="col-span-full text-gray-400">No suggestions</div>
            ) : suggestions.map(item => (
              <Link key={item._id} to={`/product/${item._id}`} className="bg-white rounded-xl shadow-lg p-4 flex flex-col items-center hover:shadow-xl transition">
                <div className="w-40 h-40 bg-[#f7f7fc] rounded-lg flex items-center justify-center mb-2 overflow-hidden">
                  <img src={item.images?.[0] || item.image} alt={item.name} className="h-36 w-36 object-contain" />
                </div>
                <div className="font-semibold text-center text-base mb-1 text-[#1a202c]">{item.name}</div>
                <span className="text-purple-600 font-bold text-lg">₹{item.price}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
