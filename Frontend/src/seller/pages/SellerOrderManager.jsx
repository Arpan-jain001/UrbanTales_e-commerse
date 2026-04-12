import React, { useEffect, useState } from "react";
import { useSellerAuth } from "../context/SellerAuthContext";
import SellerNavbar from "../components/SellerNavbar";
import SellerFooter from "../components/SellerFooter";
import SellerOrderStatusTracker from "../components/SellerOrderStatusTracker";
import { Box, Typography, Card, Button, Select, MenuItem, CircularProgress, Grid } from "@mui/material";
import axios from "axios";

const API = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";
const ORDER_STATUSES = [
  "Pending", "Placed", "Picked Up", "Out for Delivery", "Delivered", "Cancelled"
];
const RETURN_STATUSES = [
  "Requested",
  "Pickup Scheduled",
  "Picked Up",
  "Refund Initiated",
  "Refunded",
];

export default function SellerOrderManager() {
  const { token } = useSellerAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    axios.get(`${API}/api/sellers/orders`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(({ data }) => { setOrders(data.orders); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  const updateStatus = async (orderId, itemId, status) => {
    try {
      await axios.put(
        `${API}/api/sellers/orders/${orderId}/item/${itemId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders(orders =>
        orders.map(order =>
          order._id === orderId
            ? {
                ...order,
                items: order.items.map(item =>
                  item.id === itemId ? { ...item, status } : item
                )
              }
            : order
        )
      );
      alert("Order item status updated!");
    } catch {
      alert("Status update failed!");
    }
  };

  const updateReturnStatus = async (orderId, returnStatus) => {
    try {
      await axios.put(
        `${API}/api/sellers/orders/${orderId}/return-status`,
        { returnStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId
            ? {
                ...order,
                returnStatus,
                orderStatus: returnStatus === "Refunded" ? "Returned" : order.orderStatus,
                items:
                  returnStatus === "Refunded"
                    ? order.items.map((item) => ({ ...item, status: "Returned" }))
                    : order.items,
              }
            : order
        )
      );
      alert("Return status updated!");
    } catch (error) {
      console.error("Return status update failed:", error);
      alert("Return status update failed!");
    }
  };

  return (
    <>
      <SellerNavbar />
      <Box sx={{ minHeight: "100vh", bgcolor: "#f8f6fc", px: 3, py: 6 }}>
        <Typography variant="h4" fontWeight={800} color="#440077" mb={3}>
          Manage Orders & Update Status
        </Typography>
        {loading ? (
          <Box display="flex" alignItems="center" justifyContent="center" py={6}>
            <CircularProgress color="primary" size={48} />
            <Typography ml={2} color="#440077">Loading orders...</Typography>
          </Box>
        ) : !orders.length ? (
          <Typography color="gray" align="center" mt={7}>No orders found.</Typography>
        ) : (
          orders.map(order => (
            <Card key={order._id} sx={{ mb: 5, p: 3, boxShadow: 8 }}>
              <Typography fontWeight={700}>Order #{order.orderId || order._id}</Typography>
              <Typography color="text.secondary" fontSize={15}>
                Placed: {new Date(order.createdAt).toLocaleString()}
              </Typography>
              <Grid container spacing={2} mb={2} mt={1}>
                {order.items.map(item => (
                  <Grid item xs={12} md={6} key={item.id}>
                    <Box display="flex" gap={2} alignItems="center" borderBottom="1px solid #ececec" pb={1} mb={1}>
                      <img src={item.image} alt={item.name} height={44} width={44} style={{ borderRadius: 9, background: "#f4f4f4" }}/>
                      <Box flex={1}>
                        <Typography fontWeight={600}>{item.name}</Typography>
                        <Typography fontSize={13} color="text.secondary">Qty: {item.qty} | ₹{item.price} each</Typography>
                      </Box>
                      <Select
                        value={item.status || order.orderStatus}
                        size="small"
                        onChange={e => updateStatus(order._id, item.id, e.target.value)}
                        sx={{ minWidth: 120, mx: 2 }}
                      >
                        {ORDER_STATUSES.map(status => <MenuItem key={status} value={status}>{status}</MenuItem>)}
                      </Select>
                      <Typography fontSize={13} color="#440077">Status: <b>{item.status || order.orderStatus}</b></Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
              {order.returnStatus ? (
                <Box
                  display="flex"
                  flexDirection={{ xs: "column", md: "row" }}
                  alignItems={{ xs: "stretch", md: "center" }}
                  gap={2}
                  mb={2}
                  p={2}
                  border="1px solid #f5d27a"
                  borderRadius="12px"
                  bgcolor="#fff8e6"
                >
                  <Typography fontWeight={700} color="#8a5b00">
                    Return Flow
                  </Typography>
                  <Select
                    value={order.returnStatus}
                    size="small"
                    onChange={(e) => updateReturnStatus(order._id, e.target.value)}
                    sx={{ minWidth: 220, bgcolor: "#fff" }}
                  >
                    {RETURN_STATUSES.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </Select>
                  <Typography fontSize={13} color="#8a5b00">
                    Customer reason: <b>{order.returnReason || "Not provided"}</b>
                  </Typography>
                </Box>
              ) : null}
              {/* Tracker only for first item */}
              <SellerOrderStatusTracker status={order.items[0]?.status || order.orderStatus} />
            </Card>
          ))
        )}
      </Box>
      <SellerFooter />
    </>
  );
}
