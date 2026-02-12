import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  recipient: { 
    type: String, 
    required: true,
    index: true 
    // Can be a specific User ID or "admin" for all admins
  },
  type: { 
    type: String, 
    enum: ['order_new', 'order_status', 'system'], 
    default: 'system' 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: { type: String }, // e.g., "/admin/orders/123"
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.Notification || mongoose.model("Notification", notificationSchema);
