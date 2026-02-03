import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    items: [
        {
            product: {type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true},
            quantity: {type: Number, required: true},
            variants: {
                color: String,
                size: String,
            },
            price: Number,
        },
    ],
    totalAmount: { type: Number, required: true},
    discountAmount: { type: Number, default: 0 },
    couponCode: { type: String },
    paymentMethod: {type: String, enum:["COD","Stripe", "Razorpay"], default: "COD"},
    paymentStatus: {type: String, enum:["pending", "Paid", "Failed"], required: true},
    orderStatus:{
        type: String,
        enum: ["Pending", "Processing", "Paid", "Shipped", "Delivered", "Cancelled"],
        default: "Pending",
    },
    shippingAddress:{
        name: String,
        address: String,
        phone: String,
    },
    createdAt: {type: Date, default: Date.now},
    updatedAt:{type: Date, default: Date.now},
});

// Add indexes for performance optimization
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });

export default mongoose.models.Order || mongoose.model("Order", orderSchema);