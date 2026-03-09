"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const VariantSlider = ({ children, title, orderClass = "", compact = false }) => {
  const scrollRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const checkScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 5);
    }
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [checkScroll, children]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className={`space-y-2 md:space-y-4 relative group/slider ${orderClass} ${compact ? 'flex flex-col' : ''}`}>
      {title && <p className="font-bold text-xs md:text-sm uppercase tracking-wider text-gray-400">{title}</p>}
      <div className="relative">
        {showLeftArrow && (
          <button 
            type="button"
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white/90 backdrop-blur-sm border border-gray-100 shadow-xl p-2 rounded-full text-gray-900 hover:bg-primary hover:text-white transition-all opacity-0 group-hover/slider:opacity-100 hidden md:flex"
          >
            <FiChevronLeft size={20} />
          </button>
        )}
        <div 
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-1.5 flex-nowrap overflow-x-auto pb-4 scrollbar-hide w-max max-w-full cursor-grab active:cursor-grabbing snap-x"
        >
          {children}
        </div>
        {showRightArrow && (
          <button 
            type="button"
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white/90 backdrop-blur-sm border border-gray-100 shadow-xl p-2 rounded-full text-gray-900 hover:bg-primary hover:text-white transition-all opacity-0 group-hover/slider:opacity-100 hidden md:flex"
          >
            <FiChevronRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default VariantSlider;
