"use client";

import { motion } from "framer-motion";

export const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
);

export const ProductCardSkeleton = () => (
  <div className="p-2 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/50 overflow-hidden space-y-4">
    <Skeleton className="aspect-square rounded-xl" />
    <div className="p-2.5 space-y-3">
      <div className="flex justify-between items-start gap-2">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-2 w-1/3" />
          <Skeleton className="h-4 w-full" />
        </div>
        <Skeleton className="h-4 w-12" />
      </div>
      <Skeleton className="h-8 w-full rounded-lg" />
    </div>
  </div>
);

export const ReviewSkeleton = () => (
  <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-4">
    <div className="flex justify-between items-start">
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-4 w-20" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  </div>
);

export const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.4, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);
