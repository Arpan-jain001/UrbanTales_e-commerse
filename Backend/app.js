import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import fileUpload from "express-fileupload";
import connectDB from "./models/db.js";
import promotionRoutes from "./routes/promotionRoutes.js";
import userRoutes from "./routes/user.routs.js";
import productRoutes from "./routes/product.routes.js";
import sellerRoutes from "./routes/Seller.routes.js";
import authRoutes from "./routes/authRoutes.js";
import cartRoutes from "./routes/Cart.routes.js";
import orderRoutes from "./routes/order.routes.js";
import sellerAuthRoutes from "./routes/sellerAuthRoutes.js";
import sellerProductRoutes from "./routes/sellerProductRoutes.js";
import sellerOrderRoutes from "./routes/sellerOrderRoutes.js";
import sellerAnalyticsRoutes from "./routes/sellerAnalyticsRoutes.js";
import sellerNotificationRoutes from "./routes/sellerNotificationRoutes.js";
import razorpayRoutes from "./routes/razorpay.js";
import reviewRoutes from "./routes/review.routes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import productSearchRoutes from "./routes/productSearch.routes.js";
import userProfileRoutes from "./routes/userProfile.routes.js";
import adminAuthRoutes from "./routes/adminAuthRoutes.js";
import adminProductsRoutes from "./routes/adminProductsRoutes.js";
import adminStatsRoutes from "./routes/adminStatsRoutes.js";
import adminSellersRoutes from "./routes/adminSellersRoutes.js";
import adminUsersRoutes from "./routes/adminUsersRoutes.js";
import adminOrdersRoutes from "./routes/adminOrdersRoutes.js";
import adminNotificationsRoutes from "./routes/adminNotificationsRoutes.js";
import { startVerificationScheduler } from "./utils/verificationScheduler.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
    createParentPath: true,
  })
);

app.use("/api/upload", uploadRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productSearchRoutes);
app.use("/api/products", productRoutes);
app.use("/api/sellers", sellerRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/sellers/auth", sellerAuthRoutes);
app.use("/api/sellers/products", sellerProductRoutes);
app.use("/api/sellers/orders", sellerOrderRoutes);
app.use("/api/sellers/analytics", sellerAnalyticsRoutes);
app.use("/api/sellers/notifications", sellerNotificationRoutes);
app.use("/api/razorpay", razorpayRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", userProfileRoutes);
app.use("/api/admin", adminAuthRoutes);
app.use("/api/admin/products", adminProductsRoutes);
app.use("/api/admin/stats", adminStatsRoutes);
app.use("/api/admin/sellers", adminSellersRoutes);
app.use("/api/admin/users", adminUsersRoutes);
app.use("/api/admin/orders", adminOrdersRoutes);
app.use("/api/admin/notifications", adminNotificationsRoutes);
app.use("/api/promotions", promotionRoutes);

app.get("/", (req, res) => {
  res.send("UrbanTales backend is running");
});

connectDB().then(() => {
  startVerificationScheduler();
});

export default app;
