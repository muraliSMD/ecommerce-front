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
  size: { type: String },
  length: { type: String },
  stock: { type: Number, default: 0 },  // stock per variant
  price: { type: Number, required: true },
  mrp: { type: Number }, // Base price / Original price
  discount: { type: Number }, // Discount percentage
  images: { type: [String], default: [] }, // variant-specific images
});


const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true },
    sku: { type: String, unique: true, sparse: true },
    description: String,
    manufacturerInfo: String,
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    // subCategory field is deprecated, using recursive category structure instead
    images: { type: [String], default: [] }, // general product images
    price: { type: Number, required: true }, // fallback price if no variants
    mrp: { type: Number }, // fallback base price
    discount: { type: Number }, // fallback discount
    hasVariants: { type: Boolean, default: false },
    stock: { type: Number, default: 0 }, // global stock for single products
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
