"use client";

import { useState, useRef, useEffect } from "react";
import { getColorValue, commonColors, getStandardColorName } from "@/lib/colors";
import { FiChevronDown, FiSearch, FiCheck } from "react-icons/fi";

export default function ColorSelect({ value, onChange, placeholder = "Select Color...", className = "", isInline = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const normalizedValue = getStandardColorName(value);

  // Filter colors based on search query
  const filteredColors = commonColors.filter((color) =>
    color.toLowerCase().includes(search.toLowerCase())
  );

  // Add the current value to list if it's a custom color not in commonColors
  const showCustomOption = normalizedValue && !commonColors.some(c => c.toLowerCase() === normalizedValue.toLowerCase());

  const handleSelect = (colorVal) => {
    onChange(colorVal);
    setIsOpen(false);
    setSearch("");
  };

  const resolvedBgColor = getColorValue(normalizedValue);

  if (isInline) {
    // Inline version for variant table
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors text-sm font-bold text-gray-900 focus:outline-none ${className}`}
        >
          <div 
            className="w-4 h-4 rounded-full border border-gray-200 shadow-sm flex-shrink-0" 
            style={{ backgroundColor: resolvedBgColor }}
          />
          <span className="truncate max-w-[80px]">
            {normalizedValue || "-"}
          </span>
          <FiChevronDown className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} size={12} />
        </button>

        {isOpen && (
          <div className="absolute left-0 mt-1 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 py-2 animate-in fade-in slide-in-from-top-1 duration-200">
            <div className="px-3 pb-2 pt-1 border-b border-gray-50 flex items-center gap-2">
              <FiSearch className="text-gray-400" size={14} />
              <input
                type="text"
                placeholder="Search color..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-xs focus:outline-none py-1 border-none outline-none ring-0 focus:ring-0"
              />
            </div>
            <div className="max-h-48 overflow-y-auto mt-1">
              <button
                type="button"
                onClick={() => handleSelect("")}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 text-xs font-bold text-gray-400 flex items-center justify-between"
              >
                <span>None</span>
                {!normalizedValue && <FiCheck className="text-primary" />}
              </button>

              {showCustomOption && (
                <button
                  type="button"
                  onClick={() => handleSelect(normalizedValue)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-xs font-bold text-gray-900 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3.5 h-3.5 rounded-full border border-gray-200 shadow-sm" 
                      style={{ backgroundColor: resolvedBgColor }}
                    />
                    <span>{normalizedValue} (Custom)</span>
                  </div>
                  <FiCheck className="text-primary" />
                </button>
              )}

              {filteredColors.map((color) => {
                const colorHex = getColorValue(color);
                const isSelected = normalizedValue?.toLowerCase() === color.toLowerCase();
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleSelect(color)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-xs font-bold text-gray-900 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3.5 h-3.5 rounded-full border border-gray-200 shadow-sm" 
                        style={{ backgroundColor: colorHex }}
                      />
                      <span>{color}</span>
                    </div>
                    {isSelected && <FiCheck className="text-primary" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full size version for add/edit product info form
  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between bg-white border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 px-6 py-4 rounded-2xl outline-none transition-all text-left text-sm font-bold text-gray-900 ${className}`}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-5 h-5 rounded-full border border-gray-200 shadow-sm flex-shrink-0" 
            style={{ backgroundColor: resolvedBgColor }}
          />
          <span className="truncate">
            {normalizedValue || placeholder}
          </span>
        </div>
        <FiChevronDown className={`text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} size={18} />
      </button>

      {isOpen && (
        <div className="absolute w-full mt-2 bg-white border border-gray-100 rounded-3xl shadow-2xl z-50 py-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-4 pb-3 pt-1 border-b border-gray-100 flex items-center gap-3">
            <FiSearch className="text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search color name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-sm focus:outline-none py-1 border-none outline-none ring-0 focus:ring-0 text-gray-900"
            />
          </div>
          <div className="max-h-64 overflow-y-auto mt-2">
            <button
              type="button"
              onClick={() => handleSelect("")}
              className="w-full text-left px-6 py-3 hover:bg-gray-50 text-sm font-bold text-gray-400 flex items-center justify-between"
            >
              <span>None / Transparent</span>
              {!normalizedValue && <FiCheck className="text-primary" size={16} />}
            </button>

            {showCustomOption && (
              <button
                type="button"
                onClick={() => handleSelect(normalizedValue)}
                className="w-full text-left px-6 py-3 hover:bg-gray-50 text-sm font-bold text-gray-900 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full border border-gray-200 shadow-sm" 
                    style={{ backgroundColor: resolvedBgColor }}
                  />
                  <span>{normalizedValue} (Custom)</span>
                </div>
                <FiCheck className="text-primary" size={16} />
              </button>
            )}

            {filteredColors.map((color) => {
              const colorHex = getColorValue(color);
              const isSelected = normalizedValue?.toLowerCase() === color.toLowerCase();
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleSelect(color)}
                  className="w-full text-left px-6 py-3 hover:bg-gray-50 text-sm font-bold text-gray-900 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full border border-gray-200 shadow-sm" 
                      style={{ backgroundColor: colorHex }}
                    />
                    <span>{color}</span>
                  </div>
                  {isSelected && <FiCheck className="text-primary" size={16} />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
