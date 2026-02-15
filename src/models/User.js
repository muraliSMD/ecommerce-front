import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name : {type: String, required: true},
    email : {type: String, required: true, unique: true},
    password: {type: String, required: true},
    role: {type: String, enum:["admin", "customer"], default: "customer"},
    image: {type: String, default: ""},
    address: [
        {
            name: String,
            address: String, // Keep for backward compatibility
            email: {type: String, default: ""},
            phone: String,
            address1: {type: String, default: ""},
            address2: {type: String, default: ""},
            address3: {type: String, default: ""},
            city: {type: String, default: ""},
            state: {type: String, default: ""},
            pincode: {type: String, default: ""},
            landmark: {type: String, default: ""},
            label: {type: String, default: ""},
            isDefault: {type: Boolean, default: false},
        },
    ],
    savedCards: [
        {
            last4: String,
            brand: String,
            expMonth: Number,
            expYear: Number,
        }
    ],
    createdAt: {type: Date, default: Date.now},
    isBanned: {type: Boolean, default: false},
    isVerified: { type: Boolean, default: false },
    verificationToken: String,
    verificationTokenExpire: Date,
    pushSubscriptions: [
        {
            endpoint: { type: String, required: true },
            expirationTime: { type: Number, default: null },
            keys: {
                p256dh: { type: String, required: true },
                auth: { type: String, required: true }
            }
        }
    ],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    cart: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
            quantity: { type: Number, default: 1 },
            variant: { 
                color: String, 
                size: String 
            }
        }
    ],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
});

export default mongoose.models.User || mongoose.model("User", userSchema);

// Add indexes if not already applied by the DB automatically (Mongoose schema level definition usually handles this via 'index' method but defining it explicitly ensures it)
userSchema.index({ createdAt: -1 });
userSchema.index({ role: 1 });
userSchema.index({ isBanned: 1 });

     