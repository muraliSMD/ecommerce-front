import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  excerpt: { type: String },
  coverImage: { type: String },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tags: [{ type: String }],
  isPublished: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Index for slug lookup// blogSchema.index({ slug: 1 }); // Removed to prevent Mongoose duplicate index warning

// Prevent model overwrite error in development
if (process.env.NODE_ENV === "development") {
  delete mongoose.models.Blog;
}

export default mongoose.models.Blog || mongoose.model("Blog", blogSchema);
