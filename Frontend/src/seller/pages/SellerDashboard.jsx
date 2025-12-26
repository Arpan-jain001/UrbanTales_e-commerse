import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  AppBar,
  Toolbar,
  CircularProgress,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  BarChart,
  ShoppingCart,
  EmojiEvents,
  Assessment,
  AccessTime,
  LocalShipping,
  NotificationsActive,
} from "@mui/icons-material";
import { Bar } from "react-chartjs-2";
import { motion } from "framer-motion";
import axios from "axios";
import SellerFooter from "../components/SellerFooter.jsx";
import { useSellerAuth } from "../context/SellerAuthContext";

const API = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

// --- Live Clock ---
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
    "Success is not final; failure is not fatal. Keep moving forward!",
    "Every sale is a step to your big dream.",
    "Consistency builds empires — keep growing!",
    "Small steps lead to big achievements.",
    "Great things never come from comfort zones.",
  ];
  const [thought, setThought] = useState(thoughts[0]);
  useEffect(() => {
    setThought(thoughts[Math.floor(Math.random() * thoughts.length)]);
  }, []);
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
      whileHover={{ scale: 1.045, boxShadow: "0 8px 24px #5c27fe22" }}
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
            <Typography variant="h5" fontWeight={500} color="text.secondary">
              {label}
            </Typography>
            <Typography variant="h3" fontWeight={900} color={color}>
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
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [salesChart, setSalesChart] = useState([]);
  const [loading, setLoading] = useState(true);

  // Notification sender state
  const [showNotifDialog, setShowNotifDialog] = useState(false);
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMessage, setNotifMessage] = useState("");
  const [notifStatus, setNotifStatus] = useState("");

  const fetchLiveStats = () => {
    setLoading(true);
    let gotProducts = false,
      gotOrders = false;
    axios
      .get(`${API}/api/sellers/products`, { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => {
        setProducts(data || []);
        gotProducts = true;
        if (gotOrders) setLoading(false);
      })
      .catch(() => setLoading(false));
    axios
      .get(`${API}/api/sellers/orders`, { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => {
        setOrders((data && data.orders) || []);
        gotOrders = true;
        if (gotProducts) setLoading(false);
      })
      .catch(() => setLoading(false));
    axios
      .get(`${API}/api/sellers/analytics/salesChart`, { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => setSalesChart(data || []))
      .catch(() => setSalesChart([]));
  };

  useEffect(() => {
    if (token) fetchLiveStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // LIVE Stats logic
  let sold = 0,
    earnings = 0;
  orders.forEach((order) => {
    (order.items || []).forEach((item) => {
      const isSold =
        (order.paymentMethod !== "COD" && order.paymentStatus === "Successful") ||
        (order.paymentMethod === "COD" && item.status === "Delivered");
      if (isSold) {
        sold += item.qty;
        earnings += item.price * item.qty;
      }
    });
  });

  // Chart Data
  const chartData = {
    labels: salesChart.map((item) => item.month),
    datasets: [
      {
        label: "Earnings",
        data: salesChart.map((item) => item.earnings),
        backgroundColor: "#5c27fe",
      },
    ],
  };
  const chartOptions = {
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { display: false }, beginAtZero: true },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  // Send notification handler
  const handleSendNotification = async () => {
    if (!notifTitle.trim() || !notifMessage.trim()) {
      setNotifStatus("Title and message are required!");
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
        setNotifStatus("✅ Notification sent successfully!");
        setNotifTitle("");
        setNotifMessage("");
        setTimeout(() => {
          setShowNotifDialog(false);
          setNotifStatus("");
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      setNotifStatus("❌ Failed to send notification.");
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
            Hello, {seller?.fullName?.split(" ")[0] || seller?.email || "Seller"} 👋
          </Typography>
          <ThoughtBanner />
        </motion.div>

        {/* Action buttons row */}
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
            <Grid item xs={12}>
              <Box display="flex" justifyContent="center" alignItems="center" py={5}>
                <CircularProgress color="primary" size={60} />
                <Typography ml={3} color="primary">
                  Loading dashboard...
                </Typography>
              </Box>
            </Grid>
          ) : (
            <>
              <Grid item xs={12} md={4} sx={{ display: "flex" }}>
                <StatCard icon={<EmojiEvents sx={{ fontSize: 44 }} />} label="Earnings" value={"₹" + earnings} color="#5c27fe" />
              </Grid>
              <Grid item xs={12} md={4} sx={{ display: "flex" }}>
                <StatCard icon={<ShoppingCart sx={{ fontSize: 44 }} />} label="Products" value={products.length} color="#FFCC00" />
              </Grid>
              <Grid item xs={12} md={4} sx={{ display: "flex" }}>
                <StatCard icon={<Assessment sx={{ fontSize: 44 }} />} label="Sold" value={sold} color="#F43F5E" />
              </Grid>
            </>
          )}
        </Grid>

        {/* Quick Action Buttons */}
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}>
          <Grid container spacing={3} mb={4} mt={5} alignItems="stretch">
            <Grid item xs={12} md={3}>
              <motion.div whileHover={{ scale: 1.08, y: -5, boxShadow: "0 10px 42px #ffcc0030" }}>
                <Button
                  variant="outlined"
                  fullWidth
                  href="/seller/products"
                  sx={{ color: "#FFCC00", borderColor: "#FFCC00", fontWeight: 700, py: 2, borderRadius: 2, fontSize: 17 }}
                  startIcon={<ShoppingCart />}
                >
                  Products
                </Button>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={3}>
              <motion.div whileHover={{ scale: 1.08, y: -5, boxShadow: "0 10px 42px #f43f5e15" }}>
                <Button
                  variant="outlined"
                  fullWidth
                  href="/seller/add-product"
                  sx={{ color: "#F43F5E", borderColor: "#F43F5E", fontWeight: 700, py: 2, borderRadius: 2, fontSize: 17 }}
                  startIcon={<BarChart />}
                >
                  Add Product
                </Button>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={2.5}>
              <motion.div whileHover={{ scale: 1.08, y: -5, boxShadow: "0 10px 42px #5c27fe18" }}>
                <Button
                  variant="outlined"
                  fullWidth
                  href="/seller/earnings"
                  sx={{ color: "#5c27fe", borderColor: "#5c27fe", fontWeight: 700, py: 2, borderRadius: 2, fontSize: 17 }}
                  startIcon={<EmojiEvents />}
                >
                  Earnings
                </Button>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={2.5}>
              <motion.div whileHover={{ scale: 1.08, y: -5, boxShadow: "0 10px 42px #44C77629" }}>
                <Button
                  variant="outlined"
                  fullWidth
                  href="/seller/profile"
                  sx={{ color: "#44C776", borderColor: "#44C776", fontWeight: 700, py: 2, borderRadius: 2, fontSize: 17 }}
                >
                  Profile
                </Button>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={4}>
              <motion.div whileHover={{ scale: 1.08, y: -5, boxShadow: "0 10px 42px #5c27fe15" }}>
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
                    fontSize: 17,
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

        {/* Earnings Chart */}
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
                  No sales data available!
                </Typography>
              ) : (
                <Box sx={{ height: 240 }}>
                  <Bar data={chartData} options={chartOptions} />
                </Box>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </Box>

      {/* Notification Dialog */}
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
          📢 Send Notification to Users
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            label="Notification Title"
            fullWidth
            variant="outlined"
            value={notifTitle}
            onChange={(e) => setNotifTitle(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
            placeholder="e.g., Special Offer, New Product Launch"
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
          {notifStatus && (
            <Typography
              variant="body2"
              sx={{
                mt: 2,
                color: notifStatus.includes("✅") ? "green" : "red",
                fontWeight: 600,
              }}
            >
              {notifStatus}
            </Typography>
          )}
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
  
