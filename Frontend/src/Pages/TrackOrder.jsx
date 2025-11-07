  import React, { useEffect, useState } from "react";
  import Navbar from "../Components/Navbar";
  import Footer from "../Components/Footer";
  import { HashLoader } from "react-spinners";
  import { useNavigate } from "react-router-dom";
  import { motion } from "framer-motion";
  import { FaBox, FaTruck, FaRegClock, FaRegTimesCircle, FaCheck } from "react-icons/fa";

  const API_BASE = import.meta.env.VITE_BACKEND_API_URL
  ? import.meta.env.VITE_BACKEND_API_URL + "/api"
  : "http://localhost:3000/api";


  const ORDER_STAGES = [
    "Pending",
    "Placed",
    "Picked Up",
    "Out for Delivery",
    "Delivered"
  ];
  const RETURN_STAGES = [
    "Requested",
    "Pickup Scheduled",
    "Picked Up",
    "Refund Initiated",
    "Refunded"
  ];
  const ICON_MAP = {
    "Pending": <FaRegClock />,
    "Placed": <FaBox />,
    "Picked Up": <FaTruck />,
    "Out for Delivery": <FaTruck />,
    "Delivered": <FaCheck />,
    "Cancelled": <FaRegTimesCircle />
  };

  function AnimatedClock() {
    const [time, setTime] = useState(new Date());
    useEffect(() => {
      const interval = setInterval(() => setTime(new Date()), 1000);
      return () => clearInterval(interval);
    }, []);
    return (
      <div className="flex items-center justify-center gap-2 my-4 select-none">
        <span className="text-xl">🕒</span>
        <motion.span
          className="font-mono text-2xl"
          animate={{ scale: [1, 1.11, 1], color: ["#070A52", "#2563EB", "#070A52"] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </motion.span>
      </div>
    );
  }

  function ModernOrderTracker({ currentStatus }) {
    let stages = currentStatus === "Cancelled"
      ? ["Pending", "Placed", "Cancelled"]
      : ORDER_STAGES;
    const index = stages.indexOf(currentStatus);

    return (
      <div className="flex items-center w-full my-3">
        {stages.map((stage, i) => {
          const isActive = currentStatus === "Cancelled"
            ? i < stages.length - 1 || stage === "Cancelled"
            : i <= index;
          return (
            <React.Fragment key={stage}>
              <motion.div
                className={
                  `w-8 h-8 flex items-center justify-center rounded-full border-4 shadow-sm
                  ${stage === "Cancelled"
                      ? "bg-red-200 border-red-600 text-red-700"
                      : isActive
                        ? "bg-blue-700 border-blue-700 text-white"
                        : "bg-gray-200 border-gray-300 text-gray-500"
                  }`
                }
                animate={{ scale: isActive ? 1.09 : 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {ICON_MAP[stage]}
              </motion.div>
              {i < stages.length - 1 &&
                <div className={`flex-1 h-1 mx-2 rounded
                  ${isActive ?
                    (stage === "Cancelled" ? "bg-red-400" : "bg-blue-400")
                    : "bg-gray-300"
                  }`} />}
            </React.Fragment>
          );
        })}
      </div>
    );
  }

  function ModernReturnTracker({ currentStatus }) {
    const index = RETURN_STAGES.indexOf(currentStatus);
    return (
      <div className="flex items-center w-full my-2">
        {RETURN_STAGES.map((stage, i) => {
          const isActive = i <= index;
          return (
            <React.Fragment key={stage}>
              <motion.div
                className={`w-8 h-8 rounded-full border-4 flex items-center justify-center
                  ${isActive ? "bg-yellow-400 border-yellow-400 text-white" : "bg-gray-200 border-gray-300 text-gray-400"}`}
                animate={{ scale: isActive ? 1.07 : 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {isActive ? <FaCheck /> : i + 1}
              </motion.div>
              {i < RETURN_STAGES.length - 1 &&
                <div className={`flex-1 h-1 mx-2 rounded 
                  ${isActive ? "bg-yellow-300" : "bg-gray-200"}`} />}
            </React.Fragment>
          );
        })}
      </div>
    );
  }

  // Normalizes status for every kind of case
  function normalizeStatus(status) {
    return (status || "").toLowerCase().replace(/\s+/g, " ").trim();
  }

  // Show Cancel Order only if not delivered/cancelled/returned
  function canCancel(order) {
    const status = normalizeStatus(order.items[0].status || order.orderStatus);
    return !["delivered", "cancelled", "returned"].includes(status);
  }

  // Show Return only for delivered and not returned, inside 4 days
  function canReturn(order) {
    if (!order?.deliveredAt) return false;
    const status = normalizeStatus(order.items[0].status || order.orderStatus);
    if (status !== "delivered") return false;
    const days = (new Date() - new Date(order.deliveredAt)) / (1000 * 60 * 60 * 24);
    return days >= 0 && days <= 4 && (!order?.returnStatus || order.returnStatus === "");
  }

  export default function TrackOrder() {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [filterStatus, setFilterStatus] = useState("all");
    const [modalType, setModalType] = useState(null);
    const [modalOrderId, setModalOrderId] = useState(null);
    const [modalReason, setModalReason] = useState("");
    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    const selectedOrder = orders.find(o => o._id === selectedOrderId);

    // Robust filter (case-insensitive on order/item)
    const filterOrders = (ordersList, status) => {
      if (status === "all") return setFilteredOrders(ordersList);
      if (status === "returned") {
        setFilteredOrders(ordersList.filter(o =>
          normalizeStatus(o.returnStatus) === "refunded" ||
          normalizeStatus(o.orderStatus) === "returned"
        ));
        return;
      }
      setFilteredOrders(
        ordersList.filter(o =>
          normalizeStatus(o.orderStatus) === status ||
          o.items.some(item => normalizeStatus(item.status) === status)
        )
      );
    };

    const reloadOrders = () => {
      fetch(`${API_BASE}/orders`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.ok ? res.json() : Promise.reject("Failed to fetch orders"))
        .then(data => {
          setOrders(data.orders);
          filterOrders(data.orders, filterStatus);
          if (loading) setLoading(false);
        })
        .catch(() => {
          setError("Couldn't load orders.");
          setLoading(false);
        });
    };

    useEffect(() => {
      if (!token) {
        setError("Please login to view your orders.");
        setLoading(false);
        return;
      }
      reloadOrders();
      // eslint-disable-next-line
    }, [token]);

    useEffect(() => {
      if (!token) return;
      const interval = setInterval(() => {
        reloadOrders();
      }, 15000);
      return () => clearInterval(interval);
    }, [token]);

    useEffect(() => {
      filterOrders(orders, filterStatus);
      // eslint-disable-next-line
    }, [orders, filterStatus]);

    const openReasonModal = (type, id) => {
      setModalType(type);
      setModalOrderId(id);
      setModalReason("");
    };
    const closeModal = () => {
      setModalType(null);
      setModalOrderId(null);
      setModalReason("");
    };

    // Cancel: instant frontend update!
    const submitAction = async () => {
      if (!modalReason.trim()) return alert("Please enter a reason!");
      const url = modalType === "cancel"
        ? `${API_BASE}/orders/${modalOrderId}/cancel`
        : `${API_BASE}/orders/${modalOrderId}/return`;
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ reason: modalReason })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to process");
        if (modalType === "cancel") {
          setOrders(prevOrders => prevOrders.map(o =>
            o._id === modalOrderId
              ? { ...o, orderStatus: "Cancelled", cancelReason: modalReason }
              : o
          ));
          setFilteredOrders(prevOrders => prevOrders.map(o =>
            o._id === modalOrderId
              ? { ...o, orderStatus: "Cancelled", cancelReason: modalReason }
              : o
          ));
        }
        closeModal();
        setSelectedOrderId(null);
        alert(modalType === "cancel" ? "Order cancelled." : "Return request initiated");
      } catch (err) {
        alert(err.message || `Failed to ${modalType} order`);
      }
    };

    const cancelReturnRequest = async (id) => {
      if (!window.confirm("Cancel your return request?")) return;
      try {
        const res = await fetch(`${API_BASE}/orders/${id}/cancelReturn`, {
          method: "POST", headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Cancel return failed");
        reloadOrders();
        setSelectedOrderId(null);
      } catch (err) {
        alert(err.message || "Failed to cancel return");
      }
    };

    if (loading) {
      return (
        <div className="flex justify-center items-center h-screen">
          <HashLoader color="#070A52" size={80} />
        </div>
      );
    }

    if (error) {
      return (
        <>
          <Navbar />
          <div className="flex justify-center items-center h-screen font-semibold text-red-600">
            {error}
          </div>
          <Footer />
        </>
      );
    }

    return (
      <>
        <Navbar />
        <AnimatedClock />
        <main className="max-w-5xl mx-auto p-6">
          <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">Your Orders</h1>
          <div className="mb-5 flex justify-center">
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="border rounded px-3 py-1 shadow"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="placed">Placed</option>
              <option value="picked up">Picked Up</option>
              <option value="out for delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="returned">Returned</option>
            </select>
          </div>
          {filteredOrders.length === 0 ? (
            <p className="text-center text-gray-500">No orders found.</p>
          ) : (
            <div className="grid gap-7">
              {filteredOrders.map((order) => {
                const currentStatus = order.items[0].status || order.orderStatus;
                return (
                  <div
                    key={order._id}
                    className="bg-white border rounded-xl shadow-md p-6 hover:shadow-lg transition cursor-pointer flex flex-col md:flex-row md:items-center gap-7"
                    onClick={() => setSelectedOrderId(order._id)}
                  >
                    <div className="flex flex-col items-center md:items-start w-full md:w-52">
                      <img
                        src={order.items[0].image}
                        alt="Order"
                        className="w-20 h-20 rounded-lg object-cover shadow"
                      />
                      <p className="font-medium text-center text-sm mt-2">
                        {order.items[0].name.length > 28
                          ? order.items[0].name.slice(0, 28) + "..."
                          : order.items[0].name}
                        {order.items.length > 1 && <> +{order.items.length - 1}</>}
                      </p>
                      <span className="text-xs text-gray-400">#{order._id.slice(0, 7)}</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-lg font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        Status:
                        {currentStatus === "Delivered" ? (
                          <span className="text-green-600">{currentStatus}</span>
                        ) : currentStatus === "Cancelled" ? (
                          <span className="text-red-600">{currentStatus}</span>
                        ) : currentStatus === "Returned" ? (
                          <span className="text-yellow-700">{currentStatus}</span>
                        ) : (
                          <span>{currentStatus}</span>
                        )}
                      </div>
                      <p className="text-gray-500 text-sm mb-2">
                        Ordered: {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                      <ModernOrderTracker currentStatus={currentStatus} />
                      {order.returnStatus && (
                        <ModernReturnTracker currentStatus={order.returnStatus} />
                      )}
                      {order.cancelReason && (
                        <p className="text-xs text-red-700 font-semibold mt-1">
                          Cancel Reason: {order.cancelReason}
                        </p>
                      )}
                      {order.returnReason && (
                        <p className="text-xs text-yellow-800 font-semibold mt-1">
                          Return Reason: {order.returnReason}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {selectedOrder && (
            <section className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
              <div className="bg-white p-7 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto relative shadow-xl">
                <button
                  className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-2xl font-bold"
                  onClick={() => setSelectedOrderId(null)}
                  aria-label="Close"
                >&times;</button>
                <h2 className="text-2xl font-semibold mb-4">Order Details</h2>
                <div className="grid md:grid-cols-2 gap-7 mb-3">
                  <div>
                    <h3 className="font-semibold mb-2">Products</h3>
                    <ul className="space-y-4 max-h-80 overflow-y-auto">
                      {selectedOrder.items.map((item) => {
                        const itemStatus = item.status || selectedOrder.orderStatus;
                        return (
                          <li key={item.id} className="flex items-center space-x-4">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-16 h-16 rounded object-cover"
                            />
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p>Qty: {item.qty}, Price: ₹{item.price}</p>
                              <p className="text-xs text-gray-600">
                                Status: <span className="font-semibold">{itemStatus}</span>
                              </p>
                              <ModernOrderTracker currentStatus={itemStatus} />
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Details</h3>
                    <p><b>Name:</b> {selectedOrder.name}</p>
                    <p><b>Mobile:</b> {selectedOrder.mobile}</p>
                    <p><b>Address:</b> {selectedOrder.address}</p>
                    <p><b>Instructions:</b> {selectedOrder.instructions || "None"}</p>
                    <p>
                      <b>Payment Status:</b>{" "}
                      {selectedOrder.paymentMethod === "COD" &&
                        (
                          normalizeStatus(selectedOrder.orderStatus) === "delivered" ||
                          selectedOrder.items.every(
                            item => normalizeStatus(item.status || selectedOrder.orderStatus) === "delivered"
                          )
                        )
                        ? "Paid"
                        : (selectedOrder.paymentStatus || "N/A")}
                    </p>
                    <p><b>Order Status:</b> {selectedOrder.items[0].status || selectedOrder.orderStatus}</p>
                    {selectedOrder.deliveredAt && (
                      <p><b>Delivered On:</b> {new Date(selectedOrder.deliveredAt).toLocaleDateString()}</p>
                    )}
                    <p>
                      <b>Tracking Info:</b> {selectedOrder.trackingInfo || "Not available"}
                    </p>
                    {selectedOrder.returnReason && (
                      <p><b>Return Reason:</b> {selectedOrder.returnReason}</p>
                    )}
                    {selectedOrder.cancelReason && (
                      <p><b>Cancel Reason:</b> {selectedOrder.cancelReason}</p>
                    )}
                  </div>
                </div>
                <div className="mt-6 flex gap-4 flex-wrap">
                  {canCancel(selectedOrder) && (
                    <button
                      onClick={() => openReasonModal("cancel", selectedOrder._id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow"
                    >Cancel Order</button>
                  )}
                  {canReturn(selectedOrder) && (
                    <button
                      onClick={() => openReasonModal("return", selectedOrder._id)}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded shadow"
                    >Return Order</button>
                  )}
                  {normalizeStatus(selectedOrder.orderStatus) === "returned" && selectedOrder.returnStatus === "Requested" && (
                    <button
                      onClick={() => cancelReturnRequest(selectedOrder._id)}
                      className="bg-gray-600 hover:bg-gray-800 text-white px-4 py-2 rounded shadow"
                    >Cancel Return</button>
                  )}
                </div>
              </div>
              {!!modalType && (
                <div className="fixed inset-0 bg-black bg-opacity-20 z-50 flex items-center justify-center">
                  <div className="bg-white p-7 rounded-xl w-full max-w-md shadow flex flex-col gap-4">
                    <h3 className="font-semibold text-lg mb-1">
                      {modalType === "return" ? "Return Order" : "Cancel Order"}
                    </h3>
                    <label className="text-sm">
                      Your reason {modalType === "return" ? "for return" : "for cancellation"}:
                      <textarea
                        value={modalReason}
                        onChange={e => setModalReason(e.target.value)}
                        className="mt-2 border px-2 py-1 w-full outline-none rounded"
                        rows={3}
                        required
                      />
                    </label>
                    <div className="flex gap-4 mt-2">
                      <button
                        className={modalType === "return"
                          ? "bg-yellow-700 hover:bg-yellow-800 px-4 py-1 rounded text-white"
                          : "bg-red-700 hover:bg-red-800 px-4 py-1 rounded text-white"
                        }
                        onClick={submitAction}
                        disabled={!modalReason.trim()}
                      >Submit</button>
                      <button
                        className="bg-gray-500 hover:bg-gray-700 px-4 py-1 rounded text-white"
                        onClick={closeModal}
                      >Cancel</button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}
        </main>
        <Footer />
      </>
    );
  }
