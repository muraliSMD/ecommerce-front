import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name : {type: String, required: true},
    email : {type: String, required: true, unique: true},
    password: {type: String, required: true},
    role: {type: String, enum:["admin", "customer"], default: "customer"},
    address: [
        {
            street:String,
            city: String,
            state: String,
            zip: String,
            country: String,
            isDefault: {type: Boolean, default: false},
        },
    ],
    createdAt: {type: Date, default: Date.now},
});

export default mongoose.models.User || mongoose.model("User", userSchema);

     