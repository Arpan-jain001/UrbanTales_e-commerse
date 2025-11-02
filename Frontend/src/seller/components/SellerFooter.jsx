import React from "react";
import { Box, Typography } from "@mui/material";
import StorefrontIcon from "@mui/icons-material/Storefront";

export default function SellerFooter() {
  return (
    <Box
      component="footer"
      sx={{
        width: "100%",
        backdropFilter: "blur(7px)",
        background: "linear-gradient(90deg,rgba(68,0,119,.88),rgba(68,0,119,.68))",
        boxShadow: "0 -8px 32px #2d005566",
        color: "#FFD600",
        textAlign: "center",
        py: 3.5,
        mt: 12,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        fontSize: { xs: 14, sm: 17 },
        letterSpacing: 0.7,
        position: "relative",
        zIndex: 10,
        overflow: "hidden"
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
        <StorefrontIcon sx={{ color: "#FFD600", fontSize: 28, mb: "2px", opacity: 0.9 }} />
        <Typography component="span" fontWeight={700} sx={{ color: "#FFD600" }}>
          &copy; {new Date().getFullYear()} UrbanTales Seller Panel
        </Typography>
      </Box>
      <Typography
        sx={{
          mt: 1,
          fontSize: 14,
          color: "#FFF9C4",
          letterSpacing: 1,
          opacity: 0.75,
          fontWeight: 500
        }}
      >
        Powered by <span style={{ color: "#fff", fontWeight: 700, opacity: 0.93 }}>UrbanTales E-commerce</span>
      </Typography>
    </Box>
  );
}
