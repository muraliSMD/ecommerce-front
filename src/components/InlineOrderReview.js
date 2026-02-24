"use client";

import { useState } from "react";
import { FiStar } from "react-icons/fi";
import { useUserStore } from "@/store/userStore";
import toast from "react-hot-toast";

export default function InlineOrderReview({ product, onReviewSubmitted }) {
  const { userInfo } = useUserStore();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Safely find if user already reviewed
  const existingReview = product?.reviews?.find(
    (r) => 
      r.user === userInfo?._id || 
      (r.user && r.user._id && r.user._id === userInfo?._id)
  );

  if (existingReview) {
    return (
      <div className="bg-gray-50 rounded-2xl p-5 mt-4 border border-gray-100">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-sm font-bold text-gray-900">Your Review</span>
          <div className="flex gap-1 text-yellow-400 text-sm">
            {[...Array(5)].map((_, i) => (
              <FiStar
                key={i}
                className={i < existingReview.rating ? "fill-current" : "text-gray-300"}
              />
            ))}
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-1">&quot;{existingReview.comment}&quot;</p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInfo) {
      toast.error("Please login to write a review");
      return;
    }
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/products/${product._id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("Review submitted successfully!");
        setRating(0);
        setComment("");
        if (onReviewSubmitted) onReviewSubmitted();
      } else {
        toast.error(data.message || "Failed to submit review");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-50 rounded-2xl p-5 mt-4 border border-gray-100 transition-all"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">
            Rate this product
          </label>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="text-2xl focus:outline-none transition-transform hover:scale-110"
              >
                <FiStar
                  className={
                    (hoverRating || rating) >= star
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {rating > 0 && (
        <div className="mt-4 space-y-3 animate-fade-in-up">
          <textarea
            rows="2"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us what you liked or disliked..."
            className="w-full bg-white border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 px-4 py-3 text-sm rounded-xl outline-none transition-all resize-none"
            required
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-primary hover:bg-secondary text-white text-sm rounded-xl font-bold transition-all disabled:opacity-70 shadow-md shadow-primary/20 active:scale-95"
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      )}
    </form>
  );
}
