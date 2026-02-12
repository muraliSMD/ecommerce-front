"use client";

import { FiStar, FiUser, FiMessageSquare } from "react-icons/fi";

export default function ReviewsSection({ productId, reviews }) {

  return (
    <div className="mt-20">
      <h2 className="text-3xl font-display font-bold mb-10 flex items-center gap-3">
        <FiMessageSquare className="text-primary" /> Customer Reviews 
        <span className="text-lg font-normal text-gray-500">({reviews.length})</span>
      </h2>

      <div className="grid grid-cols-1 gap-12">
        {/* Reviews List */}
        <div className="space-y-6">
          {reviews.length === 0 ? (
            <div className="bg-gray-50 rounded-2xl p-10 text-center border border-gray-100">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-gray-300 mx-auto mb-4 shadow-sm">
                    <FiMessageSquare size={24} />
                </div>
                <p className="text-gray-500 font-medium">No reviews yet.</p>
                <p className="text-sm text-gray-400 mt-1">Verified customers can write reviews from their orders page.</p>
            </div>
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
      </div>
    </div>
  );
}
