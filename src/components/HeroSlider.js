"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function HeroSlider() {
  const [index, setIndex] = useState(0);

  const { data: slides, isLoading } = useQuery({
    queryKey: ["hero-slides"],
    queryFn: async () => {
      const { data } = await api.get("/hero-slides");
      return data;
    },
  });

  useEffect(() => {
    if (!slides || slides.length === 0) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides]);

  const swipeHandlers = {
    onDragEnd: (e, { offset, velocity }) => {
      const swipe = Math.abs(offset.x) * velocity.x;
      if (swipe < -10000) {
        setIndex((prev) => (prev + 1) % slides.length);
      } else if (swipe > 10000) {
        setIndex((prev) => (prev - 1 + slides.length) % slides.length);
      }
    },
  };

  if (isLoading) return <div className="container mx-auto px-4 md:px-8 mt-4"><div className="w-full h-[200px] md:h-[300px] lg:h-[400px] rounded-2xl bg-gray-100 animate-pulse" /></div>;
  if (!slides || slides.length === 0) return null;

  return (
    <div className="w-full bg-surface pt-2 md:pt-4 pb-2">
      <div className="container mx-auto px-4 md:px-8 relative">
        <div className="relative w-full h-[200px] md:h-[300px] lg:h-[400px] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden group">
          <AnimatePresence>
            <motion.div
              key={slides[index]._id}
              className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              {...swipeHandlers}
            >
              <Link href={slides[index].link || "#"} className="block w-full h-full relative">
                <Image
                  src={slides[index].image}
                  alt={slides[index].title || "Banner"}
                  fill
                  sizes="(max-width: 1024px) 100vw, 1200px"
                  className="block object-cover"
                  priority
                />
              </Link>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows (Optional, but standard for carousels) */}
          <div className="absolute inset-y-0 left-4 flex items-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <button 
              onClick={(e) => { e.preventDefault(); setIndex((prev) => (prev - 1 + slides.length) % slides.length); }}
              className="w-10 h-10 md:w-12 md:h-12 bg-white/80 hover:bg-white text-gray-900 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
          </div>
          <div className="absolute inset-y-0 right-4 flex items-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <button 
              onClick={(e) => { e.preventDefault(); setIndex((prev) => (prev + 1) % slides.length); }}
              className="w-10 h-10 md:w-12 md:h-12 bg-white/80 hover:bg-white text-gray-900 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center gap-2 mt-4">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index ? "w-8 bg-primary" : "w-3 bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
