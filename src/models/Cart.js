// models/Cart.js
import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true },
  // store chosen variant info right in the item:
  variant: {
    color: String,
    size: String,
    length: String,
    age: String,
    nSize: String,
    withBlouse: String,
    blouseMeter: String,
    silkType: String,
    price: Number, // variant-specific price
  },
});

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items: [cartItemSchema],
});

export default mongoose.models.Cart || mongoose.model("Cart", cartSchema);
