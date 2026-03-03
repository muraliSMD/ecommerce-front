import mongoose from "mongoose";

const gallerySchema = new mongoose.Schema(
  {
    imageUrl: { 
      type: String, 
      required: true 
    },
    publicId: { 
      type: String 
    },
    category: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "GalleryCategory",
      required: true
    },
    caption: { 
      type: String, 
      trim: true 
    },
    order: { 
      type: Number, 
      default: 0 
    },
    isActive: { 
      type: Boolean, 
      default: true 
    }
  },
  { timestamps: true }
);

export default mongoose.models.Gallery || mongoose.model("Gallery", gallerySchema);
