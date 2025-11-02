import React, { useEffect, useState } from 'react';
import { Link, useLocation } from "react-router-dom";
import Navbar from '../Components/Navbar';
import Footer from '../Components/Footer';
import { HashLoader } from "react-spinners";

export default function Category() {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const category = params.get('cat');
    if (!category) {
      setError("Invalid category");
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`http://localhost:3000/api/products/${category}`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setError(null);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch products");
        setLoading(false);
      });
  }, [location.search]);

  const addToCart = async (product) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in.");
      return;
    }
    const mainImage = (product.images && product.images.length > 0)
                      ? product.images[0]
                      : product.image;
    const item = { id: product._id, name: product.name, price: product.price, image: mainImage, qty: 1 };
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <HashLoader color="#070A52" size={80} />
      </div>
    );
  }
  if (error) {
    return <p className="text-center text-red-600 mt-10">{error}</p>;
  }

  const params = new URLSearchParams(location.search);
  const categoryName = params.get('cat');

  return (
    <>
      <Navbar />
      <div className="p-4 md:p-8 bg-gradient-to-b from-[#f6f6fd] to-[#fff] min-h-screen">
        <h2 className="text-3xl font-bold mb-8 text-center tracking-tight text-[#070A52]">
          {categoryName ? `${categoryName.charAt(0).toUpperCase() + categoryName.slice(1)} Collection` : "Category Collection"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
          {products.length === 0 ? (
            <p className="col-span-full text-center text-gray-500">No products found.</p>
          ) : (
            products.map((product) => (
              <div
                key={product._id}
                className="relative bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col items-center transition hover:shadow-2xl hover:-translate-y-1 duration-200 pb-14"
              >
                {/* CLICKABLE IMAGE + NAME */}
                <Link to={`/product/${product._id}`} className="w-full flex flex-col items-center pt-6">
                  <div className="w-64 h-64 flex items-center justify-center bg-[#f4f4f8] rounded-xl overflow-hidden">
                    <img
                      src={(product.images && product.images.length > 0) ? product.images[0] : product.image}
                      alt={product.name}
                      className="h-60 w-60 object-contain transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                  <h3 className="font-semibold text-lg md:text-xl text-[#1a202c] mt-3 mb-2 text-center">{product.name}</h3>
                </Link>
                {/* PRICE */}
                <span className="text-purple-700 font-extrabold text-2xl mb-4">₹{product.price}</span>
                {/* ADD TO CART BUTTON */}
                <button
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 w-4/5 bg-gradient-to-tr from-orange-500 to-orange-600 text-white py-2 rounded-xl text-base font-semibold shadow-lg hover:from-orange-600 hover:to-orange-700 active:scale-95 transition-all"
                  onClick={() => addToCart(product)}
                >
                  Add to Cart
                </button>
              </div>
            ))
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
