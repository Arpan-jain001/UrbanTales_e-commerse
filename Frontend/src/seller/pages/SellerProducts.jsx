import React, { useEffect, useState } from "react";
import SellerNavbar from "../components/SellerNavbar";
import SellerFooter from "../components/SellerFooter";
import { useSellerAuth } from "../context/SellerAuthContext";
import { useNavigate } from "react-router-dom";
import {
  Grid, Button, Typography, Box, CircularProgress, InputAdornment, TextField, Badge, Chip, Stack
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddBoxIcon from "@mui/icons-material/AddBox";
import StorefrontIcon from "@mui/icons-material/Storefront";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import { motion } from "framer-motion";
import axios from "axios";

const API = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

// ---- Premium Product Card ----
function ProductCard({ prod, onEdit, onDelete }) {
  return (
    <motion.div
      whileHover={{ y: -7, scale: 1.028, boxShadow: "0 16px 52px #44007733" }}
      transition={{ type: "spring", stiffness: 160, damping: 18 }}
      style={{
        background: "#fff",
        borderRadius: 22,
        minHeight: 400,
        boxShadow: "0 5px 32px #b2adfa19",
        display: "flex", flexDirection: "column", position: "relative", overflow: "hidden"
      }}
    >
      {/* IMAGE ZONE */}
      <Box
        sx={{
          position: "relative", width: "100%", height: 205, mb: 1,
          bgcolor: "#fbfaff", overflow: "hidden", display: "flex", justifyContent: "center", alignItems: "center"
        }}
      >
        <motion.img
          src={
            (prod.images && prod.images.length > 0 && prod.images[0]) ||
            prod.image ||
            "https://cdn-icons-png.flaticon.com/512/2577/2577048.png"
          }
          alt={prod.name}
          style={{
            width: "93%", height: "93%", objectFit: "contain",
            borderRadius: 14, background: "#ede9fe", boxShadow: "0 2px 18px #2222ff18"
          }}
        />
        {/* Price badge round */}
        <Chip
          label={`₹${prod.price}`}
          sx={{
            position: "absolute", left: 15, top: 16, fontWeight: 900,
            bgcolor: "#ffcc00", color: "#440077", fontSize: 17, px: 1.2,
            boxShadow: "0 1px 7px #ffcc0077"
          }}
        />
        {/* Category label */}
        {prod.category && (
          <Chip
            label={prod.category.charAt(0).toUpperCase() + prod.category.slice(1)}
            sx={{
              position: "absolute", right: 15, top: 16,
              bgcolor: "#440077", color: "#ffe066", fontWeight: 800,
              px: 1.1, fontSize: 14, boxShadow: "0 0px 6px #6700bf45"
            }}
          />
        )}
      </Box>
      {/* INFO */}
      <Box px={3} pb={2} flex={1} display="flex" flexDirection="column">
        {/* Name */}
        <Typography color="#070A52"
          fontWeight={800} fontSize={22} sx={{
            mt: 1, minHeight: 32, lineHeight: 1.1,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"
          }}>
          {prod.name}
        </Typography>
        {/* Desc */}
        <Typography color="text.secondary" fontSize={15} mt={1} mb={2.2} sx={{
          minHeight: 34, maxHeight: 38, lineHeight: 1.18,
          overflow: "hidden", textOverflow: "ellipsis", WebkitLineClamp: 2, display: "-webkit-box", WebkitBoxOrient: "vertical"
        }}>
          {prod.description ? prod.description : <span style={{ opacity: .5 }}>No Description</span>}
        </Typography>
        <Stack direction="row" spacing={2} mb={1} alignItems="center">
          {/* Stock */}
          <Chip
            label={`Stock: ${prod.stock ?? "?"}`}
            variant="outlined"
            color="success"
            sx={{ fontWeight: 700, color: "#098952", fontSize: 15, px: 1.1, bgcolor: "#e7fff1" }}
          />
          {/* Delivery */}
          {prod.delivery && (
            <Chip
              icon={<LocalShippingIcon style={{ fontSize: 18 }} />}
              label={`Delivery: ${prod.delivery}`}
              size="small"
              sx={{ bgcolor: '#faebc8', color: "#bd7100", fontWeight: 600, fontSize: 13, px: 1 }}
            />
          )}
        </Stack>
        <Box sx={{ mt: "auto", pt: 0.7, display: "flex", gap: 1.5 }}>
          <Button
            fullWidth
            onClick={() => onEdit(prod)}
            startIcon={<EditIcon />}
            sx={{
              bgcolor: "#e4dbff", color: "#440077", borderRadius: 2.1, px: 0, fontWeight: 700,
              "&:hover": { bgcolor: "#ffd254", color: "#440077" }
            }}
          >
            Edit
          </Button>
          <Button
            fullWidth
            onClick={() => onDelete(prod)}
            startIcon={<DeleteIcon />}
            sx={{
              bgcolor: "#ffeaea", color: "#ef3e58", borderRadius: 2.1, px: 0, fontWeight: 700,
              "&:hover": { bgcolor: "#ef3e58", color: "#fff" }
            }}
          >
            Delete
          </Button>
        </Box>
      </Box>
    </motion.div>
  );
}

export default function SellerProducts() {
  const { token, logout } = useSellerAuth();
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    axios.get(`${API}/api/sellers/products`, { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => {
        setProducts(data);
        setFiltered(data);
      })
      .catch(logout)
      .finally(() => setLoading(false));
  }, [token, logout]);

  useEffect(() => {
    const s = (search || "").toLowerCase();
    setFiltered(
      products.filter(
        p =>
          p.name.toLowerCase().includes(s) ||
          (p.category && p.category.toLowerCase().includes(s))
      )
    );
  }, [search, products]);

  const handleEdit = prod => navigate(`/seller/edit-product/${prod._id}`);
  const handleDelete = async prod => {
    if (!window.confirm("Delete this product?")) return;
    await axios.delete(`${API}/api/sellers/products/${prod._id}`, { headers: { Authorization: `Bearer ${token}` } });
    setProducts(arr => arr.filter(p => p._id !== prod._id));
  };

  return (
    <>
      <SellerNavbar />
      <Box sx={{ minHeight: "100vh", bgcolor: "#f8f6fc", px: { xs: 2, md: 6 }, py: 3 }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 4,
            flexWrap: "wrap"
          }}
        >
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }}>
            <Typography variant="h4" fontWeight={800} color="#440077" mb={2}>
              <Badge
                badgeContent={products.length}
                color="secondary"
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
              >
                <StorefrontIcon sx={{ fontSize: 38, mb: "-6px", mr: 1 }} color="warning" />
              </Badge>
              My Products
            </Typography>
          </motion.div>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <Button
              startIcon={<AddBoxIcon />}
              variant="contained"
              sx={{
                bgcolor: "#FFCC00", color: "#440077", fontWeight: 700,
                px: 4, py: 1.7, borderRadius: 3, boxShadow: 3,
                '&:hover': { bgcolor: "#440077", color: "#FFCC00" }
              }}
              onClick={() => navigate("/seller/add-product")}
            >
              Add Product
            </Button>
          </motion.div>
        </Box>
        {/* Search */}
        <Box sx={{ mb: 4, maxWidth: 380 }}>
          <TextField
            variant="outlined"
            fullWidth
            size="small"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Search by name or category"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              )
            }}
            sx={{ bgcolor: "#fff", borderRadius: 2, boxShadow: 0.5 }}
          />
        </Box>
        {/* Grid */}
        {loading ? (
          <Box display="flex" alignItems="center" justifyContent="center" py={8}>
            <CircularProgress color="primary" size={50} />
            <Typography ml={2} color="#440077" fontWeight={700}>Loading products...</Typography>
          </Box>
        ) : filtered.length === 0 ? (
          <Box textAlign="center" mt={7} mx="auto">
            <motion.img
              src="https://cdni.iconscout.com/illustration/premium/thumb/empty-store-3248302-2723355.png"
              alt="Empty"
              style={{ width: 160, height: 140, marginBottom: 14, opacity: 0.96 }}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            />
            <Typography color="gray" fontWeight={700} fontSize={22}>No products found</Typography>
            <Typography mt={2} color="text.secondary" fontSize={16}>Use the <b>Add Product</b> button to list your first item!</Typography>
          </Box>
        ) : (
          <Grid container spacing={3} alignItems="stretch">
            {filtered.map(prod => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={prod._id} display="flex">
                <ProductCard prod={prod} onEdit={handleEdit} onDelete={handleDelete} />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
      <SellerFooter />
    </>
  );
}
