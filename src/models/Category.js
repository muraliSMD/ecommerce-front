import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    parent: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Category", 
      default: null 
    },
    ancestors: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Category" 
    }],
    image: { type: String },
    level: { type: Number, default: 0 },
    description: String,
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

// Ensure slugs are unique (maybe scoped to parent? for now global unique is safer/simpler)
// categorySchema.index({ slug: 1 }, { unique: true }); // Already defined in field

export default mongoose.models.Category || mongoose.model("Category", categorySchema);
