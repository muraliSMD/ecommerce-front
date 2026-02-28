
"use client";

import { useState } from "react";
import { FiStar, FiUpload, FiX, FiPlus, FiImage, FiVideo, FiPlay } from "react-icons/fi";
import { useUserStore } from "@/store/userStore";
import toast from "react-hot-toast";
import imageCompression from "browser-image-compression";
import Image from "next/image";

export default function ReviewForm({ productId, onReviewSubmitted }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { userInfo, setAuthModalOpen } = useUserStore();

  const handleFileUpload = async (e, type = 'image') => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === 'image' && images.length >= 4) {
      toast.error("Max 4 images allowed");
      return;
    }
    if (type === 'video' && videos.length >= 1) {
      toast.error("Max 1 video allowed");
      return;
    }

    setUploading(true);
    const toastId = toast.loading(`Uploading ${type}...`);

    try {
      let fileToUpload = file;
      if (type === 'image') {
        const options = { maxSizeMB: 0.8, maxWidthOrHeight: 1200, useWebWorker: true };
        fileToUpload = await imageCompression(file, options);
      }

      const formData = new FormData();
      formData.append("file", fileToUpload);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (res.ok) {
        if (type === 'image') setImages([...images, data.url]);
        else setVideos([...videos, data.url]);
        toast.success(`${type} uploaded!`, { id: toastId });
      } else {
        toast.error("Upload failed", { id: toastId });
      }
    } catch (error) {
      toast.error("Upload error", { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  const removeMedia = (index, type = 'image') => {
    if (type === 'image') setImages(images.filter((_, i) => i !== index));
    else setVideos(videos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInfo) {
        setAuthModalOpen(true, "login");
        return;
    }
    if (rating === 0) {
        toast.error("Please select a rating");
        return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment, images, videos }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("Review submitted successfully!");
        setRating(0);
        setComment("");
        setImages([]);
        setVideos([]);
        if (onReviewSubmitted) onReviewSubmitted();
      } else {
        toast.error(data.message || "Failed to submit review");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8">
      <h3 className="font-display font-bold text-2xl text-gray-900 mb-6">Write a Review</h3>
      
      {!userInfo ? (
          <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Please login to write a review.</p>
              <button 
                onClick={() => setAuthModalOpen(true, "login")}
                className="px-6 py-2 bg-primary text-white rounded-full font-bold hover:bg-secondary transition-colors"
            >
                Login
            </button>
          </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Rating</label>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="text-2xl focus:outline-none transition-colors"
                        >
                            <FiStar 
                                className={`${(hoverRating || rating) >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} 
                            />
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Comment</label>
                <textarea
                    rows="4"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your thoughts about the product..."
                    className="w-full bg-gray-50 border border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 px-4 py-3 rounded-xl outline-none transition-all"
                    required
                ></textarea>
            </div>

            {/* Media Upload Section */}
            <div className="space-y-4">
                <label className="block text-sm font-bold text-gray-700">Add Photos or Video</label>
                <div className="flex flex-wrap gap-4">
                    {/* Image Previews */}
                    {images.map((img, idx) => (
                        <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-100 group">
                            <Image src={img} alt="review" fill className="object-cover" />
                            <button 
                                onClick={() => removeMedia(idx, 'image')}
                                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                            >
                                <FiX />
                            </button>
                        </div>
                    ))}
                    
                    {/* Video Preview */}
                    {videos.map((vid, idx) => (
                        <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-100 bg-black flex items-center justify-center group">
                            <FiPlay className="text-white" />
                            <button 
                                onClick={() => removeMedia(idx, 'video')}
                                className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                            >
                                <FiX />
                            </button>
                        </div>
                    ))}

                    {/* Upload Buttons */}
                    {images.length < 4 && (
                        <label className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all text-gray-400 hover:text-primary">
                            <FiImage size={20} />
                            <span className="text-[10px] font-bold mt-1">Photo</span>
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'image')} disabled={uploading} />
                        </label>
                    )}
                    
                    {videos.length < 1 && (
                        <label className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all text-gray-400 hover:text-primary">
                            <FiVideo size={20} />
                            <span className="text-[10px] font-bold mt-1">Video</span>
                            <input type="file" className="hidden" accept="video/*" onChange={(e) => handleFileUpload(e, 'video')} disabled={uploading} />
                        </label>
                    )}
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Max 4 photos, 1 video. Helps other shoppers!</p>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-primary hover:bg-secondary text-white rounded-xl font-bold transition-all shadow-lg shadow-primary/20 active:scale-[0.98] disabled:opacity-70"
            >
                {loading ? "Submitting..." : "Submit Review"}
            </button>
        </form>
      )}
    </div>
  );
}
