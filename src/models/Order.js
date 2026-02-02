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
    paymentMothod: {type: String, enum:["COD","Stripe", "Razorpay"], default: "COD"},
    pymentStatus: {type: String, enum:["pending", "Paid", "Failed"], required: true},
    orderStatus:{
        type: String,
        enum: ["Pending","Paid", "Shipped","Delivered", "Cancelled"],
        default: "pending",
    },
    shippingAddress:{
        street: String,
        city:String,
        state: String,
        zip: String,
        country: String,
    },
    createdAt: {type: Date, default: Date.now},
    updatedAt:{type: Date, default: Date.now},
});

export default mongoose.models.Order || mongoose.model("Order", orderSchema);