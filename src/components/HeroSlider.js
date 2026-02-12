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

  if (isLoading) return <div className="h-[65vh] md:h-[85vh] bg-gray-100 animate-pulse" />;
  if (!slides || slides.length === 0) return null;

  return (
    <div className="relative w-full h-[65vh] md:h-[85vh] overflow-hidden bg-surface">
      <AnimatePresence mode="wait">
        <motion.div
          key={slides[index]._id}
          className="relative w-full h-full cursor-grab active:cursor-grabbing"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          {...swipeHandlers}
        >
          <Image
            src={slides[index].image}
            alt={slides[index].title}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40 md:bg-black/30 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          
          <div className="absolute inset-0 flex items-center justify-center text-center px-6">
            <div className="max-w-4xl space-y-6 md:space-y-8">
              <motion.span
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="inline-block px-4 py-1.5 rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-md text-sm font-medium tracking-wider uppercase"
              >
                {slides[index].subtitle}
              </motion.span>
              
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-white leading-[1.1] md:leading-tight drop-shadow-lg"
              >
                {slides[index].title}
              </motion.h1>
              
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <Link
                  href={slides[index].link}
                  className="group inline-flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:bg-primary hover:text-white transition-all duration-300 shadow-2xl active:scale-95"
                >
                  Shop Collection
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Pagination Dots */}
      <div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 flex gap-2 md:gap-3 z-20">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === index ? "w-8 md:w-12 bg-white" : "w-2 md:w-3 bg-white/40 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
