import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    items: [
        {
            product: {type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true},
            quantity: {type: Number, required: true},
            variant: {
                color: String,
                size: String,
                length: String,
            },
            price: Number,
        },
    ],
    totalAmount: { type: Number, required: true},
    discountAmount: { type: Number, default: 0 },
    couponCode: { type: String },
    paymentMethod: {type: String, enum:["COD","Stripe", "Razorpay", "Online"], default: "COD"},
    paymentStatus: {type: String, enum:["pending", "Paid", "Failed"], required: true},
    orderStatus:{
        type: String,
        enum: ["Pending", "Processing", "Paid", "Shipped", "Delivered", "Cancelled", "Return Requested", "Returned", "Cancellation Requested"],
        default: "Pending",
    },
    cancellationReason: { type: String },
    returnReason: { type: String },
    rejectionReason: { type: String },
    adminNotes: { type: String, default: "" },
    shippingAddress:{
        name: String,
        address: String, // Keep for backward compatibility
        email: String,
        phone: String,
        address1: String,
        address2: String,
        address3: String,
        city: String,
        state: String,
        pincode: String,
        landmark: String,
        label: String,
    },
    createdAt: {type: Date, default: Date.now},
    updatedAt:{type: Date, default: Date.now},
});

// Add indexes for performance optimization
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ paymentMethod: 1 });

// Prevent model overwrite error in development
if (process.env.NODE_ENV === "development") {
  delete mongoose.models.Order;
}

export default mongoose.models.Order || mongoose.model("Order", orderSchema);