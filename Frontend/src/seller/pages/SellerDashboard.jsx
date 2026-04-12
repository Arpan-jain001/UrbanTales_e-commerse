import React, { useEffect, useMemo, useState } from "react";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
  AccessTime,
  Assessment,
  BarChart,
  EmojiEvents,
  Inventory2,
  LocalShipping,
  NotificationsActive,
  ShoppingCart,
} from "@mui/icons-material";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";
import { Bar } from "react-chartjs-2";
import { motion } from "framer-motion";
import axios from "axios";
import SellerFooter from "../components/SellerFooter.jsx";
import { useSellerAuth } from "../context/SellerAuthContext";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const API = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

function LiveClock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        bgcolor: "#f3f0ff",
        borderRadius: 2,
        px: 2,
        py: 1,
        boxShadow: 1,
        minWidth: 175,
        ml: 2,
      }}
    >
      <AccessTime color="primary" sx={{ fontSize: 22 }} />
      <Typography variant="body2" color="primary" fontWeight={700} noWrap>
        {now.toLocaleTimeString()}
        <br />
        {now.toLocaleDateString("en-IN", {
          weekday: "short",
          month: "short",
          day: "numeric",
        })}
      </Typography>
    </Box>
  );
}

function ThoughtBanner() {
  const thoughts = [
    "Success follows consistency. Keep your catalog fresh and your service sharper.",
    "Every fulfilled order builds trust. Great stores win by reliability.",
    "Low stock alerts are opportunities. Restock fast and stay ahead.",
    "The best seller dashboards do not guess. They measure and act.",
    "Small daily improvements compound into stronger store performance.",
  ];
  const [thought] = useState(thoughts[Math.floor(Math.random() * thoughts.length)]);

  return (
    <motion.div initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} className="mb-2">
      <Typography variant="subtitle2" color="primary" sx={{ fontStyle: "italic", fontWeight: 500 }}>
        {thought}
      </Typography>
    </motion.div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, boxShadow: "0 8px 24px #5c27fe22" }}
      transition={{ type: "spring", stiffness: 180, damping: 16 }}
      style={{ width: "100%", height: "100%" }}
    >
      <Card
        elevation={5}
        sx={{
          borderRadius: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 150,
          height: "100%",
          bgcolor: "rgba(255,255,255,.98)",
        }}
      >
        <CardContent sx={{ display: "flex", alignItems: "center", gap: 3, justifyContent: "center" }}>
          <Avatar sx={{ bgcolor: color, width: 66, height: 66, mr: 2, boxShadow: `0 2px 14px ${color}22` }}>
            {icon}
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={500} color="text.secondary">
              {label}
            </Typography>
            <Typography variant="h4" fontWeight={900} color={color}>
              {value}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function SellerDashboard() {
  const { token, seller } = useSellerAuth();
  const [stats, setStats] = useState({
    products: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    soldUnits: 0,
    grossEarnings: 0,
    pendingOrders: 0,
    activeReturnRequests: 0,
    stockRequestCount: 0,
  });
  const [stockSummary, setStockSummary] = useState({
    totalRequests: 0,
    activeRequests: 0,
    notifiedRequests: 0,
    requestedProducts: 0,
  });
  const [salesChart, setSalesChart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNotifDialog, setShowNotifDialog] = useState(false);
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMessage, setNotifMessage] = useState("");
  const [notifStatus, setNotifStatus] = useState("");

  const fetchLiveStats = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [statsRes, chartRes, stockRes] = await Promise.all([
        axios.get(`${API}/api/sellers/analytics/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API}/api/sellers/analytics/salesChart`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API}/api/sellers/notifications/stock-requests`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setStats(statsRes.data || {});
      setSalesChart(Array.isArray(chartRes.data) ? chartRes.data : []);
      setStockSummary(stockRes.data?.summary || {});
    } catch (error) {
      console.error("Seller dashboard fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveStats();
  }, [token]);

  const chartData = useMemo(
    () => ({
      labels: salesChart.map((item) => item.month),
      datasets: [
        {
          label: "Earnings",
          data: salesChart.map((item) => item.earnings),
          backgroundColor: "#5c27fe",
        },
      ],
    }),
    [salesChart]
  );

  const chartOptions = {
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { display: false }, beginAtZero: true },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  const handleSendNotification = async () => {
    if (!notifTitle.trim() || !notifMessage.trim()) {
      setNotifStatus("Title and message are required.");
      return;
    }

    try {
      const res = await axios.post(
        `${API}/api/sellers/notifications/broadcast`,
        {
          title: notifTitle.trim(),
          message: notifMessage.trim(),
          category: "GENERAL",
          link: "/",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.status === 201) {
        setNotifStatus("Notification sent successfully.");
        setNotifTitle("");
        setNotifMessage("");
        setTimeout(() => {
          setShowNotifDialog(false);
          setNotifStatus("");
        }, 1200);
      }
    } catch (err) {
      console.error(err);
      setNotifStatus("Failed to send notification.");
    }
  };

  return (
    <>
      <AppBar position="sticky" color="primary" sx={{ background: "linear-gradient(90deg,#5c27fe,#FFCC00)" }}>
        <Toolbar>
          <Avatar
            alt={seller?.fullName || "Seller"}
            src={seller?.avatar || ""}
            sx={{ mr: 2, bgcolor: "#fff", color: "#5c27fe" }}
          />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Seller Dashboard
          </Typography>
          <Chip label="Seller" color="warning" sx={{ fontWeight: 700, mr: 1 }} />
          <LiveClock />
        </Toolbar>
      </AppBar>

      <Box sx={{ px: { xs: 1, md: 5 }, py: 3, background: "#f8f6fc", minHeight: "100vh" }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Typography variant="h4" fontWeight={800} color="primary" mb={0.5} mt={1}>
            Hello, {seller?.fullName?.split(" ")[0] || seller?.email || "Seller"}
          </Typography>
          <ThoughtBanner />
        </motion.div>

        <Box mb={3} display="flex" gap={2} flexWrap="wrap">
          <Button
            onClick={fetchLiveStats}
            variant="contained"
            sx={{
              bgcolor: "#5c27fe",
              color: "#fff",
              fontWeight: 700,
              fontSize: 17,
              px: 4,
              py: 1.1,
              borderRadius: 3,
              boxShadow: 2,
            }}
            startIcon={<BarChart />}
          >
            Refresh Dashboard
          </Button>

          <Button
            onClick={() => setShowNotifDialog(true)}
            variant="contained"
            sx={{
              bgcolor: "#FFCC00",
              color: "#000",
              fontWeight: 700,
              fontSize: 17,
              px: 4,
              py: 1.1,
              borderRadius: 3,
              boxShadow: 2,
              "&:hover": { bgcolor: "#e6b800" },
            }}
            startIcon={<NotificationsActive />}
          >
            Send Notification
          </Button>
        </Box>

        <Grid container spacing={4} my={2}>
          {loading ? (
            <Grid size={{ xs: 12 }}>
              <Box display="flex" justifyContent="center" alignItems="center" py={5}>
                <CircularProgress color="primary" size={60} />
                <Typography ml={3} color="primary">
                  Loading dashboard...
                </Typography>
              </Box>
            </Grid>
          ) : (
            <>
              <Grid size={{ xs: 12, md: 4 }} sx={{ display: "flex" }}>
                <StatCard icon={<EmojiEvents sx={{ fontSize: 44 }} />} label="Earnings" value={`₹${Number(stats.grossEarnings || 0).toLocaleString("en-IN")}`} color="#5c27fe" />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }} sx={{ display: "flex" }}>
                <StatCard icon={<ShoppingCart sx={{ fontSize: 44 }} />} label="Products" value={stats.products || 0} color="#FFCC00" />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }} sx={{ display: "flex" }}>
                <StatCard icon={<Assessment sx={{ fontSize: 44 }} />} label="Sold Units" value={stats.soldUnits || 0} color="#F43F5E" />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }} sx={{ display: "flex" }}>
                <StatCard icon={<LocalShipping sx={{ fontSize: 44 }} />} label="Pending Orders" value={stats.pendingOrders || 0} color="#0ea5e9" />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }} sx={{ display: "flex" }}>
                <StatCard icon={<Inventory2 sx={{ fontSize: 44 }} />} label="Low / Out Stock" value={`${stats.lowStockProducts || 0}/${stats.outOfStockProducts || 0}`} color="#f59e0b" />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }} sx={{ display: "flex" }}>
                <StatCard icon={<NotificationsActive sx={{ fontSize: 44 }} />} label="Notify Requests" value={stockSummary.activeRequests || stats.stockRequestCount || 0} color="#10b981" />
              </Grid>
            </>
          )}
        </Grid>

        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}>
          <Grid container spacing={3} mb={4} mt={5} alignItems="stretch">
            <Grid size={{ xs: 12, md: 2.4 }}>
              <motion.div whileHover={{ scale: 1.06, y: -5 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  href="/seller/products"
                  sx={{ color: "#FFCC00", borderColor: "#FFCC00", fontWeight: 700, py: 2, borderRadius: 2, fontSize: 16 }}
                  startIcon={<ShoppingCart />}
                >
                  Products
                </Button>
              </motion.div>
            </Grid>
            <Grid size={{ xs: 12, md: 2.4 }}>
              <motion.div whileHover={{ scale: 1.06, y: -5 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  href="/seller/add-product"
                  sx={{ color: "#F43F5E", borderColor: "#F43F5E", fontWeight: 700, py: 2, borderRadius: 2, fontSize: 16 }}
                  startIcon={<BarChart />}
                >
                  Add Product
                </Button>
              </motion.div>
            </Grid>
            <Grid size={{ xs: 12, md: 2.4 }}>
              <motion.div whileHover={{ scale: 1.06, y: -5 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  href="/seller/stock-requests"
                  sx={{ color: "#10b981", borderColor: "#10b981", fontWeight: 700, py: 2, borderRadius: 2, fontSize: 16 }}
                  startIcon={<NotificationsActive />}
                >
                  Stock Requests
                </Button>
              </motion.div>
            </Grid>
            <Grid size={{ xs: 12, md: 2.4 }}>
              <motion.div whileHover={{ scale: 1.06, y: -5 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  href="/seller/earnings"
                  sx={{ color: "#5c27fe", borderColor: "#5c27fe", fontWeight: 700, py: 2, borderRadius: 2, fontSize: 16 }}
                  startIcon={<EmojiEvents />}
                >
                  Earnings
                </Button>
              </motion.div>
            </Grid>
            <Grid size={{ xs: 12, md: 2.4 }}>
              <motion.div whileHover={{ scale: 1.06, y: -5 }}>
                <Button
                  variant="contained"
                  fullWidth
                  href="/seller/orders/manage"
                  sx={{
                    bgcolor: "#5c27fe",
                    color: "#fff",
                    fontWeight: 700,
                    borderRadius: 2,
                    py: 2,
                    fontSize: 16,
                    textTransform: "none",
                    boxShadow: 3,
                    "&:hover": { bgcolor: "#43208a", boxShadow: 5 },
                  }}
                  startIcon={<LocalShipping />}
                >
                  Order Manager
                </Button>
              </motion.div>
            </Grid>
          </Grid>
        </motion.div>

        <Grid container spacing={4}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
              <Card
                sx={{
                  borderRadius: 3,
                  mb: 4,
                  p: 2,
                  backdropFilter: "blur(3px)",
                  background: "rgba(255,255,255,.75)",
                  height: 320,
                }}
              >
                <CardContent>
                  <Typography variant="h6" mb={2} color="primary">
                    Monthly Earnings
                  </Typography>
                  {salesChart.length === 0 ? (
                    <Typography color="text.secondary" fontStyle="italic">
                      No sales data available yet.
                    </Typography>
                  ) : (
                    <Box sx={{ height: 240 }}>
                      <Bar key={salesChart.map((item) => item.month).join(",")} data={chartData} options={chartOptions} />
                    </Box>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <Card sx={{ borderRadius: 3, p: 2, background: "rgba(255,255,255,.92)" }}>
              <CardContent>
                <Typography variant="h6" color="primary" mb={2}>
                  Operational Snapshot
                </Typography>
                <Box display="flex" flexDirection="column" gap={1.5}>
                  <Chip label={`Active return requests: ${stats.activeReturnRequests || 0}`} color="warning" variant="outlined" />
                  <Chip label={`Notify requests waiting: ${stockSummary.activeRequests || 0}`} color="success" variant="outlined" />
                  <Chip label={`Low stock products: ${stats.lowStockProducts || 0}`} color="info" variant="outlined" />
                  <Chip label={`Out of stock products: ${stats.outOfStockProducts || 0}`} color="error" variant="outlined" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Dialog
        open={showNotifDialog}
        onClose={() => {
          setShowNotifDialog(false);
          setNotifStatus("");
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: "#5c27fe", color: "#fff", fontWeight: 700 }}>
          Send Notification to Users
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            label="Notification Title"
            fullWidth
            variant="outlined"
            value={notifTitle}
            onChange={(e) => setNotifTitle(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
            placeholder="e.g. Special Offer, New Product Launch"
          />
          <TextField
            label="Message"
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            value={notifMessage}
            onChange={(e) => setNotifMessage(e.target.value)}
            placeholder="Type your message for users..."
          />
          {notifStatus ? (
            <Typography
              variant="body2"
              sx={{
                mt: 2,
                color: notifStatus.toLowerCase().includes("success") ? "green" : "#5c27fe",
                fontWeight: 600,
              }}
            >
              {notifStatus}
            </Typography>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => {
              setShowNotifDialog(false);
              setNotifStatus("");
              setNotifTitle("");
              setNotifMessage("");
            }}
            sx={{ color: "#666" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSendNotification}
            variant="contained"
            sx={{
              bgcolor: "#5c27fe",
              fontWeight: 700,
              "&:hover": { bgcolor: "#43208a" },
            }}
          >
            Send
          </Button>
        </DialogActions>
      </Dialog>

      <SellerFooter />
    </>
  );
}
