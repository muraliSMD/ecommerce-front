
"use client";

import { FiStar, FiUser } from "react-icons/fi";
import { format } from "date-fns";

export default function ReviewsSection({ product, refetch }) {
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
                product.reviews?.map((review) => (
                    <div key={review._id} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                    <FiUser />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900">{review.name}</h4>
                                    <div className="flex gap-1 text-yellow-400 text-xs">
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
                        <p className="text-gray-600 leading-relaxed">{review.comment}</p>
                    </div>
                ))
            )}
        </div>
    </div>
  );
}
