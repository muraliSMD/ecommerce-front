import mongoose from "mongoose";

const collectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true },
    description: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

collectionSchema.index({ isActive: 1 });

export default mongoose.models.Collection || mongoose.model("Collection", collectionSchema);
