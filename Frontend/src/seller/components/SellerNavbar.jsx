import React, { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { useSellerAuth } from "../context/SellerAuthContext";
import logo from "../../assets/UrbanTales.png";
import {
  AppBar,
  Toolbar,
  Button,
  Avatar,
  Chip,
  Box,
  Menu,
  MenuItem,
  Tooltip,
  useMediaQuery,
  Badge,
} from "@mui/material";
import { Logout, AccountCircle, Menu as MenuIcon } from "@mui/icons-material";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import { motion } from "framer-motion";

const API = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

const NAV = [
  { label: "Dashboard", href: "/seller/dashboard" },
  { label: "Products", href: "/seller/products" },
  { label: "Add Product", href: "/seller/add-product" },
  { label: "Orders", href: "/seller/orders" },
  { label: "Earnings", href: "/seller/earnings" },
  { label: "Profile", href: "/seller/profile" },
];

export default function SellerNavbar() {
  const { seller, logout, token } = useSellerAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const isMobile = useMediaQuery("(max-width:900px)");

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleSellerLogout = () => {
    logout();
    navigate("/sellerlogin");
  };

  // Fetch seller unread notifications count
  useEffect(() => {
    if (!token) return;

    const fetchCount = async () => {
      try {
        const res = await fetch(`${API}/api/sellers/notifications/unread-count`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setNotifCount(data.count || 0);
        }
      } catch {}
    };

    fetchCount();
    const id = setInterval(fetchCount, 30000); // 30s interval
    return () => clearInterval(id);
  }, [token]);

  return (
    <>
      <AppBar
        position="sticky"
        elevation={5}
        sx={{
          background: "linear-gradient(90deg,#f8f6fc 40%, #e2e2fa 100%)",
          borderBottom: "1px solid #e2e2fa",
        }}
      >
        <Toolbar
          sx={{
            minHeight: 64,
            px: { xs: 2, sm: 7 },
            display: "flex",
            alignItems: "center",
            backdropFilter: "blur(10px)",
          }}
        >
          {/* Logo */}
          <img
            src={logo}
            alt="UrbanTales"
            className="h-12 cursor-pointer"
            style={{ height: 48, marginRight: 18 }}
            onClick={() => navigate("/seller/dashboard")}
          />

          {/* Hamburger menu (mobile) */}
          {isMobile && (
            <>
              <Button sx={{ ml: 1, minWidth: 0 }} onClick={() => setMobileNavOpen((v) => !v)}>
                <MenuIcon sx={{ color: "#5c27fe" }} fontSize="large" />
              </Button>
              {mobileNavOpen && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 64,
                    left: 0,
                    right: 0,
                    bgcolor: "#fff",
                    zIndex: 999,
                    boxShadow: 2,
                    borderBottomLeftRadius: 8,
                    borderBottomRightRadius: 8,
                  }}
                >
                  {NAV.map(({ label, href }) => (
                    <NavLink
                      key={label}
                      to={href}
                      style={({ isActive }) => ({
                        display: "block",
                        color: isActive ? "#5c27fe" : "#440077",
                        background: isActive ? "#FFCC00" : "transparent",
                        fontWeight: 600,
                        padding: "14px 18px",
                        textDecoration: "none",
                        transition: "all .2s",
                        fontSize: 18,
                      })}
                      onClick={() => setMobileNavOpen(false)}
                    >
                      {label}
                    </NavLink>
                  ))}
                </Box>
              )}
            </>
          )}

          {/* Desktop NAV links */}
          <Box
            sx={{
              flexGrow: 1,
              display: isMobile ? "none" : "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            {NAV.map(({ label, href }) => (
              <NavLink
                key={label}
                to={href}
                style={({ isActive }) => ({
                  color: isActive ? "#5c27fe" : "#440077",
                  background: isActive ? "#FFCC00" : "transparent",
                  borderRadius: 6,
                  fontWeight: 600,
                  padding: "7px 19px",
                  textDecoration: "none",
                  fontSize: 16,
                  transition: "all .22s cubic-bezier(.61,1.42,.48,.89)",
                  boxShadow: isActive ? "0 0 16px #ffcc0044" : "",
                })}
              >
                {label}
              </NavLink>
            ))}
          </Box>

          {/* Bell + Badge */}
          <Box sx={{ ml: 1, display: "flex", alignItems: "center" }}>
            <motion.div
              whileHover={{ scale: 1.13 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 360, damping: 15 }}
              style={{ position: "relative", cursor: "pointer" }}
              onClick={() => navigate("/seller/notifications")}
            >
              <Badge
                badgeContent={notifCount}
                color="error"
                sx={{
                  "& .MuiBadge-badge": {
                    fontSize: 11,
                    fontWeight: 700,
                    minWidth: 18,
                    height: 18,
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    background: "#fff",
                    borderRadius: "50%",
                    width: 40,
                    height: 40,
                    justifyContent: "center",
                    boxShadow: "0 2px 12px #f8e2fa44",
                  }}
                >
                  <NotificationsNoneIcon sx={{ color: "#FFD600", fontSize: 23 }} />
                </Box>
              </Badge>
            </motion.div>
          </Box>

                    {/* Seller Info & Profile Menu */}
          {seller && (
            <>
              <Tooltip title={seller.fullName || seller.email}>
                <Avatar
                  sx={{ bgcolor: "#5c27fe", color: "#fff", ml: 1, mr: 1, cursor: "pointer" }}
                  onClick={handleMenu}
                  src={seller.avatar || ""}
                >
                  {seller.fullName ? seller.fullName.charAt(0) : "S"}
                </Avatar>
              </Tooltip>
              <Chip
                label={seller.fullName?.split(" ")[0] || seller.email}
                sx={{ bgcolor: "#FFCC00", color: "#440077", fontWeight: 700, fontSize: 15, ml: 1 }}
              />
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose} sx={{ mt: 2 }}>
                <MenuItem
                  onClick={() => {
                    navigate("/seller/profile");
                    handleClose();
                  }}
                >
                  <AccountCircle sx={{ mr: 1 }} /> Profile
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleSellerLogout();
                    handleClose();
                  }}
                >
                  <Logout sx={{ mr: 1 }} /> Logout
                </MenuItem>
              </Menu>
            </>
          )}

          {/* Logout Button (Desktop) */}
          {!Boolean(anchorEl) && (
            <Button
              onClick={handleSellerLogout}
              startIcon={<Logout />}
              sx={{
                ml: 1,
                bgcolor: "#F43F5E",
                color: "#fff",
                borderRadius: 2,
                fontWeight: 700,
                display: isMobile ? "none" : "flex",
                "&:hover": { bgcolor: "#FFCC00", color: "#440077" },
              }}
            >
              Logout
            </Button>
          )}
        </Toolbar>
      </AppBar>
    </>
  );
}

