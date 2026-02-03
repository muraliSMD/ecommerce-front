"use client";

import { motion } from "framer-motion";

export const PageLoader = () => {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white/80 backdrop-blur-xl">
      <div className="relative">
        {/* Animated Brand Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="bg-primary w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-primary/20"
        >
          <span className="text-white font-bold text-4xl font-display">G</span>
        </motion.div>
        
        {/* Orbiting Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-4 border-2 border-primary/10 border-t-primary rounded-[2.5rem]"
        />
        
        <p className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-primary font-bold tracking-widest uppercase text-[10px] whitespace-nowrap">
          Grabszy is Loading
        </p>
      </div>
    </div>
  );
};

export const SectionLoader = ({ className = "" }) => {
  return (
    <div className={`flex flex-col items-center justify-center p-12 ${className}`}>
      <motion.div
        animate={{ 
          rotate: 360,
          borderRadius: ["20%", "50%", "20%"]
        }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-10 h-10 border-4 border-gray-100 border-t-primary"
      />
      <p className="mt-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Fetching Data</p>
    </div>
  );
};

export const Skeleton = ({ className = "" }) => {
  return (
    <div className={`animate-pulse bg-gray-100 rounded-2xl ${className}`} />
  );
};
