"use client";

import { useState } from "react";
import Image from "next/image";
import { FiStar, FiX } from "react-icons/fi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

export default function ReviewModal({ isOpen, onClose, productId, productName, productImage, onItemReviewed }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (newReview) => {
      const res = await api.post(`/products/${productId}/reviews`, newReview);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Review submitted successfully!");
      setComment("");
      setRating(5);
      queryClient.invalidateQueries(["product", productId]);
      if (onItemReviewed) onItemReviewed();
      onClose();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || err.message || "Failed to submit review");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({ rating, comment });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl animate-in slide-in-from-bottom-10 fade-in duration-300 relative overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="text-xl font-bold font-display">Write a Review</h3>
            <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
                <FiX size={24} className="text-gray-500" />
            </button>
        </div>

        <div className="p-8">
            {/* Product Info */}
            <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden relative border border-gray-200">
                    {productImage ? (
                        <Image 
                            src={productImage} 
                            alt={productName} 
                            width={64}
                            height={64}
                            className="object-cover w-full h-full"
                            unoptimized
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Img</div>
                    )}
                </div>
                <div>
                    <p className="text-sm text-gray-500 mb-1">Reviewing</p>
                    <h4 className="font-bold text-gray-900 line-clamp-1">{productName}</h4>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-bold text-gray-500 mb-3">Rating</label>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className={`text-3xl transition-all transform hover:scale-110 ${
                            star <= rating ? "text-yellow-400" : "text-gray-200"
                            }`}
                        >
                            <FiStar className={star <= rating ? "fill-current" : ""} />
                        </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-gray-500 mb-3">Your Experience</label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        required
                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 min-h-[120px] resize-none transition-all placeholder:text-gray-400"
                        placeholder="What did you like or dislike about this product?"
                    />
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={mutation.isPending}
                        className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-primary transition-all disabled:opacity-50 shadow-lg shadow-gray-900/10 active:scale-95"
                    >
                        {mutation.isPending ? "Submitting..." : "Submit Review"}
                    </button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
}
