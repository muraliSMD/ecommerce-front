
"use client";

import { useState } from "react";
import { FiStar } from "react-icons/fi";
import { useUserStore } from "@/store/userStore";
import toast from "react-hot-toast";

export default function ReviewForm({ productId, onReviewSubmitted }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const { userInfo, setAuthModalOpen } = useUserStore();

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
