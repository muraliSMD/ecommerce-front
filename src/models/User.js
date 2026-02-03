import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name : {type: String, required: true},
    email : {type: String, required: true, unique: true},
    password: {type: String, required: true},
    role: {type: String, enum:["admin", "customer"], default: "customer"},
    address: [
        {
            name: String,
            address: String,
            phone: String,
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
});

export default mongoose.models.User || mongoose.model("User", userSchema);

// Add indexes if not already applied by the DB automatically (Mongoose schema level definition usually handles this via 'index' method but defining it explicitly ensures it)
userSchema.index({ createdAt: -1 });
userSchema.index({ role: 1 });
userSchema.index({ isBanned: 1 });

     