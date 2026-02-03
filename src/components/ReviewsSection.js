"use client";

import { useState } from "react";
import { FiStar, FiUser, FiMessageSquare } from "react-icons/fi";
import { useUserStore } from "@/store/userStore";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export default function ReviewsSection({ productId, reviews }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const { userInfo, setAuthModalOpen } = useUserStore();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (newReview) => {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReview),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data;
    },
    onSuccess: () => {
      toast.success("Review submitted!");
      setComment("");
      setRating(5);
      queryClient.invalidateQueries(["product", productId]);
       // Since reviews are typically passed as props from the page server-side or parent,
       // we might need to reload the page or rely on parent refetch using queryClient if parent uses React Query.
       // For this setup assuming parent page might need reload if it's strictly server component without hydration sync
       // But typically we want immediate feedback.
       window.location.reload(); 
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userInfo) {
      setAuthModalOpen(true, "login");
      return;
    }
    mutation.mutate({ rating, comment });
  };

  return (
    <div className="mt-20">
      <h2 className="text-3xl font-display font-bold mb-10 flex items-center gap-3">
        <FiMessageSquare className="text-primary" /> Customer Reviews 
        <span className="text-lg font-normal text-gray-500">({reviews.length})</span>
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Reviews List */}
        <div className="space-y-6">
          {reviews.length === 0 ? (
            <p className="text-gray-500 italic">No reviews yet. Be the first to write one!</p>
          ) : (
            reviews.map((review, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                      <FiUser />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{review.name}</p>
                      <div className="flex text-yellow-400 text-sm">
                        {[...Array(5)].map((_, i) => (
                          <FiStar key={i} className={i < review.rating ? "fill-current" : "text-gray-200"} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">
                    {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : "Recent"}
                  </span>
                </div>
                <p className="text-gray-600 leading-relaxed">{review.comment}</p>
              </div>
            ))
          )}
        </div>

        {/* Write Review Form */}
        <div className="bg-surface rounded-[2.5rem] p-8 md:p-10 h-fit">
          <h3 className="text-xl font-bold mb-6">Write a Review</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-500 mb-2">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-2xl transition-colors ${
                      star <= rating ? "text-yellow-400" : "text-gray-300"
                    }`}
                  >
                    <FiStar className={star <= rating ? "fill-current" : ""} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-500 mb-2">Review</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                className="w-full bg-white border border-gray-200 rounded-2xl p-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 min-h-[120px]"
                placeholder="Share your thoughts about this product..."
              />
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-all disabled:opacity-50"
            >
              {mutation.isPending ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
