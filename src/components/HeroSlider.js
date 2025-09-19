"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const slides = [
  { id: 1, image: "/images/slider-1.webp", text: "Elegant Gold Collection" },
  { id: 2, image: "/images/slider-2.webp", text: "Shine Bright with Diamonds" },
  { id: 3, image: "/images/slider-3.webp", text: "New Bridal Sets" },
];

export default function HeroSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-[70vh] overflow-hidden">
      {slides.map((slide, i) => (
        <motion.div
          key={slide.id}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: i === index ? 1 : 0 }}
          transition={{ duration: 0.8 }}
        >
          <img src={slide.image} alt={slide.text} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <h2 className="text-white text-4xl md:text-6xl font-bold">{slide.text}</h2>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
