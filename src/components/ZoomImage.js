"use client";
import { useState } from "react";

export default function ZoomImage({ src, zoomAmount = 200, height = 450 }) {
  const [backgroundPos, setBackgroundPos] = useState("center");
  const [isZoomed, setIsZoomed] = useState(false);

  if (!src) return null; // Prevent empty string warnings

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl shadow-lg bg-white transition-transform duration-300 hover:scale-105 cursor-zoom-in"
      style={{
        height: `${height}px`,
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
      <img
        src={src}
        alt=""
        className="absolute inset-0 w-full h-full object-contain transition-transform duration-300"
      />

      {/* Zoom overlay */}
      {isZoomed && (
        <div
          className="absolute inset-0"
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
