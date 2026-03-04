"use client";

import { getColorValue, getClosestColorName } from "@/lib/colors";
import { useEffect, useState } from "react";

export default function ColorPreview({ color }) {
  const [resolvedColor, setResolvedColor] = useState("transparent");
  const [colorName, setColorName] = useState("");

  useEffect(() => {
    if (!color) {
      setResolvedColor("transparent");
      setColorName("");
      return;
    }

    const value = getColorValue(color);
    setResolvedColor(value);

    // If it's a hex code, try to get a human-friendly name
    if (value.startsWith("#")) {
      const name = getClosestColorName(value);
      setColorName(name || value);
    } else {
      setColorName(value);
    }
  }, [color]);

  if (!color) return null;

  return (
    <div className="flex items-center gap-2 mt-2 p-2 bg-gray-50 rounded-xl border border-gray-100 w-fit animate-in fade-in slide-in-from-top-1 duration-300">
      <div 
        className="w-5 h-5 rounded-full border border-gray-200 shadow-sm" 
        style={{ backgroundColor: resolvedColor }}
      />
      <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
        {colorName}
      </span>
    </div>
  );
}
