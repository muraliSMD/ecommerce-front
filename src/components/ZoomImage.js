"use client";
import { useState } from "react";
import Image from "next/image";

export default function ZoomImage({ src, zoomAmount = 200, height = 450 }) {
  const [backgroundPos, setBackgroundPos] = useState("center");
  const [isZoomed, setIsZoomed] = useState(false);

  if (!src) return null; // Prevent empty string warnings

  return (
    <div
      className="relative w-full h-full cursor-zoom-in"
      style={{
        cursor: isZoomed ? "zoom-out" : "zoom-in",
      }}
      onMouseMove={(e) => {
        if (!isZoomed) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setBackgroundPos(`${x}% ${y}%`);
      }}
      onMouseEnter={() => setIsZoomed(true)}
      onMouseLeave={() => {
        setIsZoomed(false);
        setBackgroundPos("center");
      }}
    >
      {/* Main image */}
      <Image
        src={src}
        alt="Product Zoom"
        fill
        className="object-contain transition-transform duration-300"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />

      {/* Zoom overlay */}
      {isZoomed && (
        <div
          className="absolute inset-0 z-10 bg-white" // Added z-10 and bg-white
          style={{
            backgroundImage: `url(${src})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: `${zoomAmount}%`,
            backgroundPosition: backgroundPos,
            transition: "background-position 0.05s ease-out",
          }}
        />
      )}
    </div>
  );
}
