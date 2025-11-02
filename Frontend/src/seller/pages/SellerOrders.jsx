import React, { useEffect, useState } from "react";
import SellerNavbar from "../components/SellerNavbar";
import SellerFooter from "../components/SellerFooter";
import SellerOrderStatusTracker from "../components/SellerOrderStatusTracker";
import { useSellerAuth } from "../context/SellerAuthContext";
import { useNavigate } from "react-router-dom";
import { HashLoader } from "react-spinners";
import { Table, TableRow, TableCell, TableHead, TableBody, TableContainer, Paper, Typography, Box, Button, Select, MenuItem } from "@mui/material";
import axios from "axios";

const API = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";
const ORDER_STATUSES = [
  "Pending",
  "Placed",
  "Picked Up",
  "Out for Delivery",
  "Delivered",
  "Cancelled"
];

export default function SellerOrders() {
  const { token, logout } = useSellerAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchOrders() {
      setLoading(true);
      try {
        const { data } = await axios.get(
          `${API}/api/sellers/orders`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setOrders(data.orders || []);
      } catch {
        logout();
      }
      setLoading(false);
    }
    fetchOrders();
  }, [token, logout]);

  // Inline item status update
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <HashLoader color="#440077" size={80} />
      </div>
    );
  }

  return (
    <>
      <SellerNavbar />
      <Box className="bg-[#f8f6fc] min-h-screen p-8">
        <Typography variant="h4" fontWeight={800} color="#440077" mb={4}>
          Order Management
        </Typography>
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 3 }}>
          <Table className="min-w-full text-sm text-left">
            <TableHead>
              <TableRow className="bg-gray-100 border-b text-[#440077]">
                <TableCell>Order ID</TableCell>
                <TableCell>Product(s)</TableCell>
                <TableCell>Buyer Name</TableCell>
                <TableCell>Mobile</TableCell>
                <TableCell>Order Date</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Status/Update</TableCell>
                <TableCell>Track</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Typography color="gray" py={8}>No orders found.</Typography>
                  </TableCell>
                </TableRow>
              ) : orders.map(order => (
                <TableRow key={order._id} hover>
                  <TableCell>{order.orderId || order._id}</TableCell>
                  <TableCell>
                    {order.items.map((item, idx) =>
                      <div key={item.id || idx} style={{ marginBottom: 6 }}>
                        <b>{item.name}</b>
                        <Typography component="span" fontSize={13} color="gray"> ×{item.qty}</Typography><br />
                        <Typography component="span" fontSize={13} color="gray">₹{item.price}</Typography>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{order.name}</TableCell>
                  <TableCell>{order.mobile}</TableCell>
                  <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>₹{order.totalAmount}</TableCell>
                  <TableCell>
                    {order.items.map((item, idx) =>
                      <Box key={item.id || idx} display="flex" alignItems="center" mb={1}>
                        <Select
                          value={item.status || order.orderStatus}
                          size="small"
                          onChange={e => updateStatus(order._id, item.id, e.target.value)}
                          sx={{ minWidth: 120, mr: 1.5 }}
                        >
                          {ORDER_STATUSES.map(status => <MenuItem key={status} value={status}>{status}</MenuItem>)}
                        </Select>
                        <Typography fontSize={13} color="#440077">
                          {item.status || order.orderStatus}
                        </Typography>
                      </Box>
                    )}
                  </TableCell>
                  <TableCell>
                    <SellerOrderStatusTracker status={order.items[0].status || order.orderStatus} orderId={order._id} />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      sx={{ color: "#440077", borderColor: "#440077", fontWeight: 700 }}
                      onClick={() => navigate(`/seller/orders/${order._id}`)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
      <SellerFooter />
    </>
  );
}
