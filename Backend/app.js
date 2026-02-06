import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './models/db.js';
import fileUpload from 'express-fileupload'; // ✅ must be near top
import promotionRoutes from './routes/promotionRoutes.js';
// ✅ Route Imports
import userRoutes from './routes/user.routs.js';
import productRoutes from './routes/product.routes.js';
import sellerRoutes from './routes/Seller.routes.js';
import authRoutes from './routes/authRoutes.js';
import cartRoutes from './routes/Cart.routes.js';
import orderRoutes from './routes/order.routes.js';
import sellerAuthRoutes from './routes/sellerAuthRoutes.js'; 
import sellerProductRoutes from './routes/sellerProductRoutes.js'; 
import sellerOrderRoutes from './routes/sellerOrderRoutes.js';
import sellerAnalyticsRoutes from './routes/sellerAnalyticsRoutes.js';
import sellerNotificationRoutes from './routes/sellerNotificationRoutes.js';
import razorpayRoutes from './routes/razorpay.js';
import reviewRoutes from './routes/review.routes.js';
import uploadRoutes from './routes/uploadRoutes.js'; // ✅ new
import notificationRoutes from "./routes/notificationRoutes.js";
import productSearchRoutes from "./routes/productSearch.routes.js";
import userProfileRoutes from "./routes/userProfile.routes.js";

// Admin panel
import adminAuthRoutes from "./routes/adminAuthRoutes.js";
import adminProductsRoutes from "./routes/adminProductsRoutes.js";
import adminStatsRoutes from "./routes/adminStatsRoutes.js";
import adminSellersRoutes from "./routes/adminSellersRoutes.js";
import adminUsersRoutes from "./routes/adminUsersRoutes.js";
import adminOrdersRoutes from "./routes/adminOrdersRoutes.js";
import adminNotificationsRoutes from "./routes/adminNotificationsRoutes.js";

dotenv.config();
const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Enable file upload before defining upload route
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/', // important for Render/Linux hosting
    createParentPath: true,
  })
);

// ✅ Cloudinary Upload route
app.use('/api/upload', uploadRoutes);

// ✅ Main API Routes
app.use('/api/users', userRoutes);
app.use("/api/products", productSearchRoutes); 
app.use('/api/products', productRoutes);
app.use('/api/sellers', sellerRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/sellers/auth', sellerAuthRoutes);
app.use('/api/sellers/products', sellerProductRoutes);
app.use('/api/sellers/orders', sellerOrderRoutes);
app.use('/api/sellers/analytics', sellerAnalyticsRoutes);
app.use('/api/sellers/notifications', sellerNotificationRoutes);
app.use('/api/razorpay', razorpayRoutes);
app.use('/api/reviews', reviewRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", userProfileRoutes);

// Admin panel
app.use("/api/admin", adminAuthRoutes);
app.use("/api/admin/products", adminProductsRoutes);
app.use("/api/admin/stats", adminStatsRoutes);
app.use("/api/admin/sellers", adminSellersRoutes);
app.use("/api/admin/users", adminUsersRoutes);
app.use("/api/admin/orders", adminOrdersRoutes);
app.use("/api/admin/notifications", adminNotificationsRoutes);
app.use('/api/promotions', promotionRoutes);

// ✅ Test route
app.get('/', (req, res) => {
  res.send('Hello duniyaa 🌍');
});

// ✅ DB Connection
connectDB();

export default app;
