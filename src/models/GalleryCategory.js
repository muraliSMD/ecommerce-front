import mongoose from "mongoose";

const galleryCategorySchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true 
    },
    slug: { 
      type: String, 
      required: true, 
      unique: true,
      trim: true 
    },
    order: { 
      type: Number, 
      default: 0 
    }
  },
  { timestamps: true }
);

export default mongoose.models.GalleryCategory || mongoose.model("GalleryCategory", galleryCategorySchema);
