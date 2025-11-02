import React, { useEffect, useState } from "react";
import SellerNavbar from "../components/SellerNavbar";
import SellerSidebar from "../components/SellerSidebar";
import SellerFooter from "../components/SellerFooter";
import { useSellerAuth } from "../context/SellerAuthContext";
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Chip } from "@mui/material";
import axios from "axios";

const API = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

export default function SellerEarnings() {
  const { token, logout } = useSellerAuth();
  const [chartData, setChartData] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch monthly earnings chart and ALL orders to compute true subtotal earning
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    let gotOrders = false, gotChart = false;
    axios.get(`${API}/api/sellers/orders`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(({ data }) => {
        setOrders((data && data.orders) || []);
        gotOrders = true;
        if (gotChart) setLoading(false);
      })
      .catch(logout);

    axios.get(`${API}/api/sellers/analytics/salesChart`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(({ data }) => {
        setChartData(data || []);
        gotChart = true;
        if (gotOrders) setLoading(false);
      })
      .catch(() => { setChartData([]); setLoading(false); });
  }, [token, logout]);

  // Live subtotal calculation matches dashboard/order manager logic
  let liveSubtotal = 0, totalCount = 0;
  orders.forEach(order => {
    (order.items || []).forEach(item => {
      const isSold =
        (order.paymentMethod !== "COD" && order.paymentStatus === "Successful")
        || (order.paymentMethod === "COD" && item.status === "Delivered");
      if (isSold) {
        liveSubtotal += (item.price * item.qty);
        totalCount += item.qty;
      }
    });
  });

  return (
    <>
      <SellerNavbar />
      <Box sx={{ display: "flex", bgcolor: "#f8f6fc", minHeight: "100vh" }}>
        <SellerSidebar />
        <Box component="main" sx={{ flex: 1, p: { xs: 2, md: 7 } }}>
          <Typography variant="h4" fontWeight={800} color="#440077" mb={4}>Earnings Statistics</Typography>
          <Box display="flex" gap={3} alignItems="center" justifyContent={{ xs: "flex-start", md: "flex-end" }} mb={2}>
            <Chip label={"Total Earned: ₹" + liveSubtotal} color="success" sx={{ fontSize: 19, fontWeight: 700, px: 2, height: 38 }} />
            <Chip label={"Total Sold: " + totalCount} color="primary" sx={{ fontWeight: 700, px: 2, height: 38 }} />
          </Box>
          <Box maxWidth={570} bgcolor="#fff" boxShadow={3} borderRadius={3} mx="auto" p={4} mt={2}>
            {loading ? (
              <Box display="flex" alignItems="center" justifyContent="center" py={8}>
                <CircularProgress color="primary" size={44} />
                <Typography ml={2} color="#440077">Loading earnings...</Typography>
              </Box>
            ) : (
              <>
                <TableContainer component={Paper} elevation={0}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell><b>Month</b></TableCell>
                        <TableCell><b>Earnings</b></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {chartData.map((row, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{row.month}</TableCell>
                          <TableCell>₹ {row.earnings}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                {chartData.length === 0 &&
                  <Typography color="text.secondary" align="center" py={7} fontStyle="italic">
                    No sales data yet.
                  </Typography>
                }
              </>
            )}
          </Box>
        </Box>
      </Box>
      <SellerFooter />
    </>
  );
}
