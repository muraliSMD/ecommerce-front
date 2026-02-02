"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";

const slides = [
  { 
    id: 1, 
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070", 
    title: "Eco-Friendly Threads", 
    subtitle: "Sustainable fashion for the conscious mind",
    color: "from-emerald-500/20"
  },
  { 
    id: 2, 
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071", 
    title: "Summer Collection '26", 
    subtitle: "Lightweight fabrics for golden hours",
    color: "from-orange-500/20"
  },
  { 
    id: 3, 
    image: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070", 
    title: "Street Style Redefined", 
    subtitle: "Bold patterns and oversized comfort",
    color: "from-indigo-500/20"
  },
];

export default function HeroSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-[85vh] overflow-hidden bg-surface">
      <AnimatePresence mode="wait">
        <motion.div
          key={slides[index].id}
          className="relative w-full h-full"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <img 
            src={slides[index].image} 
            alt={slides[index].title} 
            className="w-full h-full object-cover" 
          />
          <div className={`absolute inset-0 bg-gradient-to-r ${slides[index].color} to-black/60 flex items-center`}>
            <div className="container mx-auto px-8 md:px-16">
              <div className="max-w-2xl space-y-6">
                <motion.span
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium tracking-wider uppercase"
                >
                  New Arrival
                </motion.span>
                
                <motion.h2 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-5xl md:text-8xl font-display font-bold text-white leading-tight"
                >
                  {slides[index].title}
                </motion.h2>
                
                <motion.p
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="text-xl text-white/80 font-light max-w-lg"
                >
                  {slides[index].subtitle}
                </motion.p>
                
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="flex gap-4 pt-4"
                >
                  <Link 
                    href="/storeFront" 
                    className="bg-white text-black px-8 py-4 rounded-2xl font-bold hover:bg-primary hover:text-white transition-all shadow-xl shadow-black/20 active:scale-95"
                  >
                    Shop Now
                  </Link>
                  <button className="bg-white/10 backdrop-blur-md border border-white/30 text-white px-8 py-4 rounded-2xl font-bold hover:bg-white/20 transition-all active:scale-95">
                    View Lookbook
                  </button>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === index ? "w-12 bg-white" : "w-3 bg-white/40 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

