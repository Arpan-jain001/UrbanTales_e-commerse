import "./config/env.js"; // ✅ Load env FIRST

import http from "http";
import app from "./app.js";

const PORT = process.env.PORT || 3000;

// 🔹 Global Error Handlers (IMPORTANT for production)
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err.message);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err.message);
  process.exit(1);
});

// 🔹 Create Server
const server = http.createServer(app);

// 🔹 Start Server
server.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
});

// 🔹 Graceful Shutdown (for production servers like VPS / Docker)
process.on("SIGTERM", () => {
  console.log("👋 SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    console.log("💤 Process terminated");
  });
});