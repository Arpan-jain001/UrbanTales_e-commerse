// models/SellerNotification.js

import mongoose from "mongoose";

const SellerNotificationSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
  title: { type: String },
  message: { type: String },
  isRead: { type: Boolean, default: false },
  time: { type: Date, default: Date.now }
});

const SellerNotification = mongoose.models.SellerNotification || mongoose.model('SellerNotification', SellerNotificationSchema);
export default SellerNotification;
