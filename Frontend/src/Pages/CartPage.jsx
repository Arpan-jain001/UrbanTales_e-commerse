import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HashLoader } from "react-spinners";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { getStoredUserToken } from "../utils/authStorage";

const BACKEND_API_URL =
  import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = getStoredUserToken();

  const loadCart = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${BACKEND_API_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCartItems(data.items || []);
      setSubtotal(data.subtotal || 0);
    } catch (err) {
      console.error("Cart load error:", err);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    const count = cartItems.reduce((sum, item) => sum + Number(item.qty || 0), 0);
    setItemCount(count);
  }, [cartItems]);

  const updateQty = async (item, qty) => {
    const safeQty = Math.max(1, Number(qty || 1));

    try {
      const res = await fetch(`${BACKEND_API_URL}/api/cart/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          itemId: item.id,
          qty: safeQty,
          selectedSize: item.selectedSize || "",
          selectedColor: item.selectedColor || "",
        }),
      });
      const data = await res.json();
      setCartItems(data.cart?.items || []);
      setSubtotal(data.subtotal || 0);
    } catch (err) {
      console.error("Cart update failed:", err);
    }
  };

  const deleteItem = async (item) => {
    try {
      const res = await fetch(`${BACKEND_API_URL}/api/cart/remove`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          itemId: item.id,
          selectedSize: item.selectedSize || "",
          selectedColor: item.selectedColor || "",
        }),
      });
      const data = await res.json();
      setCartItems(data.cart?.items || []);
      setSubtotal(data.subtotal || 0);
    } catch (err) {
      console.error("Cart delete failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <HashLoader color="#070A52" size={80} />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="w-[90%] max-w-[900px] mx-auto my-10 md:my-20 bg-white p-6 md:p-10 rounded-lg shadow-lg">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center text-gray-800">
          Shopping Cart
        </h1>

        {!token ? (
          <p className="text-center text-lg text-gray-600 mt-6">
            Please login to view your cart.
          </p>
        ) : cartItems.length === 0 ? (
          <p className="text-center text-lg text-gray-600">Your cart is empty.</p>
        ) : (
          <>
            {cartItems.map((item, index) => (
              <div
                key={`${item.id}-${item.selectedSize || "nosize"}-${item.selectedColor || "nocolor"}-${index}`}
                className="flex flex-col md:flex-row border-t py-5 items-center justify-between"
              >
                <div className="flex items-center w-full md:w-auto mb-4 md:mb-0">
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-100 mr-4 rounded overflow-hidden flex-shrink-0">
                    <img
                      src={item.selectedColorImage || item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-base md:text-lg text-gray-900">
                      {item.name}
                    </div>
                    <div className="text-sm text-gray-500 mt-1 space-y-1">
                      {item.selectedSize && <p>Size: {item.selectedSize}</p>}
                      {item.selectedColor && <p>Color: {item.selectedColor}</p>}
                    </div>
                    <div className="text-lg md:text-xl font-bold my-1 text-gray-800">
                      ₹{Number(item.price || 0).toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 md:space-x-4 flex-wrap justify-center md:justify-end w-full md:w-auto">
                  <div className="flex items-center border border-gray-300 rounded-md">
                    <button
                      onClick={() => updateQty(item, item.qty - 1)}
                      className="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded-l-md transition-colors"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={item.qty}
                      min={1}
                      onChange={(e) => updateQty(item, parseInt(e.target.value, 10) || 1)}
                      className="w-12 text-center border-x border-gray-300 py-1 text-gray-800 focus:outline-none"
                    />
                    <button
                      onClick={() => updateQty(item, item.qty + 1)}
                      className="px-3 py-1 text-gray-700 hover:bg-gray-100 rounded-r-md transition-colors"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => deleteItem(item)}
                    className="flex items-center text-red-500 hover:text-red-700 transition-colors text-sm md:text-base mt-2 md:mt-0"
                  >
                    <span className="mr-1">🗑</span> Delete
                  </button>
                </div>
              </div>
            ))}

            <div className="border-t pt-6 mt-6 text-right">
              <div className="text-xl font-semibold text-gray-800">
                Subtotal ({itemCount} items):{" "}
                <strong className="text-blue-600">₹{subtotal.toFixed(2)}</strong>
              </div>
              <button
                className="bg-blue-600 text-white px-8 py-3 mt-6 rounded-lg font-semibold shadow-md hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                disabled={itemCount === 0}
                onClick={() => navigate("/checkout")}
              >
                Proceed to Pay
              </button>
            </div>
          </>
        )}
      </div>
      <Footer />
    </>
  );
}
