import React from "react";
import { useNavigate } from "react-router-dom";
import orderConfirmedGif from "../assets/order-confirmed.gif"; // Ensure this path is correct
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

const BASE_API_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

const OrderConfirmed = () => {
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = React.useState(null);

  React.useEffect(() => {
    const stored = localStorage.getItem("lastPlacedOrder");
    if (stored) {
      try {
        setOrderDetails(JSON.parse(stored));
        return;
      } catch {
        setOrderDetails(null);
      }
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${BASE_API_URL}/api/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch orders");
        return res.json();
      })
      .then((data) => {
        const latest = data?.orders?.[0];
        if (!latest) return;
        setOrderDetails({
          orderId: latest.orderId || latest._id,
          totalAmount:
            latest.totalAmount || (
              Number(latest.subtotal || 0) +
              Number(latest.deliveryCharge || 0) -
              Number(latest.discountAmount || 0)
            ).toFixed(2),
          paymentMethod: latest.paymentMethod,
          address: latest.address,
          name: latest.name,
          mobile: latest.mobile,
        });
      })
      .catch(() => {});
  }, []);

  return (
    <>
        <Navbar />
    <div className="flex items-center justify-center p-5 bg-gray-100 px-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 text-center max-w-md w-full">
        {/* Heading */}
        <h1 className="text-3xl font-bold text-[#070A52] mb-6">Order Confirmed!</h1>

        {/* GIF */}
        <img
          src={orderConfirmedGif}
          alt="Order Confirmed"
          className="mx-auto w-64 h-64 object-contain mb-6"
        />

        {orderDetails ? (
          <div className="text-left mb-6 space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-500">Order ID</p>
            <p className="text-lg font-semibold text-gray-800">{orderDetails.orderId}</p>
            <p className="text-sm text-gray-600">Amount Paid: ₹{orderDetails.totalAmount}</p>
            <p className="text-sm text-gray-600">Payment method: {orderDetails.paymentMethod || "COD"}</p>
            <p className="text-sm text-gray-600">Shipping to: {orderDetails.address}</p>
          </div>
        ) : (
          <p className="text-sm text-gray-600 mb-6">Your order has been confirmed and our team is processing it.</p>
        )}

        {/* Continue Shopping + Track Order Buttons */}
        <div className="mt-4 flex flex-col sm:flex-row justify-center gap-3">
          <button
            onClick={() => navigate("/")}
            className="bg-[#070A52] text-white font-semibold px-6 py-2 rounded-lg shadow hover:bg-green-600 transition duration-300"
          >
            Continue Shopping
          </button>
          {orderDetails?.orderId && (
            <button
              onClick={() => navigate(`/trackorder?orderId=${encodeURIComponent(orderDetails.orderId)}`)}
              className="bg-white border border-[#070A52] text-[#070A52] font-semibold px-6 py-2 rounded-lg shadow-sm hover:bg-[#070A52] hover:text-white transition duration-300"
            >
              Track Order
            </button>
          )}
        </div>
      </div>
    </div>
    <Footer />
    </>
  );
};

export default OrderConfirmed;
