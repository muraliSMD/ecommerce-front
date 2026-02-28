
"use client";

import { FiStar, FiUser, FiCheckCircle, FiThumbsUp, FiPlay } from "react-icons/fi";
import { format } from "date-fns";
import Image from "next/image";
import toast from "react-hot-toast";
import { useUserStore } from "@/store/userStore";

export default function ReviewsSection({ product, refetch }) {
  const { userInfo, setAuthModalOpen } = useUserStore();

  const handleVote = async (reviewId) => {
    if (!userInfo) {
      setAuthModalOpen(true, "login");
      return;
    }

    try {
      const res = await fetch(`/api/products/${product._id}/reviews`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("Thanks for your feedback!");
        if (refetch) refetch();
      } else {
        toast.error(data.message || "Failed to register vote");
      }
    } catch (error) {
      toast.error("Network error");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="font-display font-bold text-3xl text-gray-900 mb-8 text-center">Customer Reviews</h2>

        <div className="flex justify-center mb-12">
            {/* Rating Summary */}
            <div className="w-full max-w-sm bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center h-fit">
                <div className="text-5xl font-bold text-gray-900 mb-2">{product.averageRating?.toFixed(1) || 0}</div>
                <div className="flex justify-center gap-1 text-yellow-400 mb-2">
                     {[...Array(5)].map((_, i) => (
                        <FiStar key={i} className={i < Math.round(product.averageRating || 0) ? "fill-current" : "text-gray-300"} />
                     ))}
                </div>
                <p className="text-gray-500 font-medium">{product.numReviews || 0} Reviews</p>
            </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
            {product.reviews?.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-3xl">
                    <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
                </div>
            ) : (
                [...product.reviews].reverse().map((review) => (
                    <div key={review._id} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                    <FiUser />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-gray-900">{review.name}</h4>
                                        {review.isVerified && (
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                                <FiCheckCircle /> Verified Purchase
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex gap-1 text-yellow-400 text-xs mt-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <FiStar key={i} className={i < review.rating ? "fill-current" : "text-gray-300"} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <span className="text-xs text-gray-400 font-medium">
                                {review.createdAt ? format(new Date(review.createdAt), 'MMM dd, yyyy') : ''}
                            </span>
                        </div>
                        
                        <p className="text-gray-600 leading-relaxed mb-4">{review.comment}</p>

                        {/* Review Media */}
                        {(review.images?.length > 0 || review.videos?.length > 0) && (
                            <div className="flex flex-wrap gap-3 mb-6">
                                {review.images?.map((img, idx) => (
                                    <div key={idx} className="relative w-24 h-24 rounded-2xl overflow-hidden border border-gray-100 cursor-pointer hover:opacity-90 transition-opacity">
                                        <Image src={img} alt="review" fill className="object-cover" />
                                    </div>
                                ))}
                                {review.videos?.map((vid, idx) => (
                                    <div key={idx} className="relative w-24 h-24 rounded-2xl overflow-hidden border border-gray-100 bg-black flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity">
                                        <FiPlay className="text-white text-2xl" />
                                        <video src={vid} className="hidden" />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Interaction Footer */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                            <button 
                                onClick={() => handleVote(review._id)}
                                className={`flex items-center gap-2 text-sm font-bold transition-colors ${
                                    review.votedUsers?.includes(userInfo?._id) 
                                    ? "text-primary" 
                                    : "text-gray-400 hover:text-gray-600"
                                }`}
                            >
                                <FiThumbsUp /> 
                                Helpful 
                                {review.helpfulVotes > 0 && <span>({review.helpfulVotes})</span>}
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
  );
}
