import React, { useEffect, useState } from "react";
import SellerNavbar from "../components/SellerNavbar";
import SellerSidebar from "../components/SellerSidebar";
import { useParams, useNavigate } from "react-router-dom";
import { useSellerAuth } from "../context/SellerAuthContext";
import axios from "axios";
import SellerOrderStatusTracker from "../components/SellerOrderStatusTracker";

export default function SellerOrderDetails() {
  const { token, logout } = useSellerAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      setLoading(true);
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_API_URL}/api/orders/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setOrder(data.order || null);
      } catch (e) {
        setErr("Order not found or access denied.");
      }
      setLoading(false);
    }
    fetchOrder();
  }, [id, token]);

  if (loading) return <div className="flex items-center justify-center h-60">Loading order...</div>;
  if (err) return <div className="flex items-center justify-center h-60 text-red-600">{err}</div>;
  if (!order) return null;

  return (
    <>
      <SellerNavbar />
      <div className="flex">
        <SellerSidebar />
        <main className="flex-1 px-12 py-10">
          <h2 className="mb-4 text-2xl font-bold text-[#440077]">Order Details</h2>
          <div className="max-w-2xl bg-white p-8 rounded-xl shadow mb-8">
            <div className="flex justify-between mb-3">
              <div>
                <div className="font-bold text-[#440077] text-lg">Order #{order.orderId || order._id}</div>
                <div className="text-xs text-gray-500">Placed: {new Date(order.createdAt).toLocaleString()}</div>
              </div>
              <div>
                <SellerOrderStatusTracker status={order.orderStatus} orderId={order._id} />
              </div>
            </div>
            <div className="mb-3">
              <span className="text-sm font-bold">Total:</span> <span className="text-[#440077] font-bold">₹{order.totalAmount}</span>
            </div>
            <div className="mb-3">
              <span className="text-sm font-bold">Buyer:</span> {order.name}
            </div>
            <div className="mb-3">
              <span className="text-sm font-bold">Address:</span> {order.address}
            </div>
            <div className="mb-3">
              <span className="text-sm font-bold">Payment Method:</span> {order.paymentMethod}
            </div>
            <div className="mb-3">
              <span className="text-sm font-bold">Instructions:</span> {order.instructions || "None"}
            </div>
            <div className="mb-4">
              <h4 className="font-semibold mb-2 text-[#440077]">Products:</h4>
              <ul>
                {order.items.map((item, idx) => (
                  <li key={idx} className="border-b py-2 flex justify-between">
                    <span className="font-bold">{item.name}</span>
                    <span className="text-xs text-gray-500">x{item.qty}</span>
                    <span className="font-medium">&#8377; {item.price}</span>
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => navigate("/seller/orders")}
              className="bg-[#440077] text-yellow-200 rounded px-6 py-2 font-bold hover:bg-yellow-400 hover:text-[#440077] transition"
            >
              Back to Orders
            </button>
          </div>
        </main>
      </div>
    </>
  );
}
