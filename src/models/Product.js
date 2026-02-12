import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const variantSchema = new mongoose.Schema({
  color: { type: String, required: true },
  size: { type: String, required: true },
  stock: { type: Number, default: 0 },  // stock per variant
  price: { type: Number, required: true },
  images: { type: [String], default: [] }, // variant-specific images
});


const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    category: String,
    subCategory: String,
    images: { type: [String], default: [] }, // general product images
    price: { type: Number, required: true }, // fallback price if no variants
    variants: [variantSchema],
    reviews: [reviewSchema],
    averageRating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Add indexes for performance optimization
productSchema.index({ name: 'text', category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });

export default mongoose.models.Product || mongoose.model("Product", productSchema);
