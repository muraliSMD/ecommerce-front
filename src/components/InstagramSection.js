"use client";

import React, { useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiInstagram, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

const InstagramSection = () => {
  const scrollRef = useRef(null);

  // Fetch Gallery Items (assuming these are curated Instagram-style shots)
  const { data: galleryItems, isLoading } = useQuery({
    queryKey: ['gallery-instagram'],
    queryFn: async () => {
      const { data } = await api.get('/gallery?activeOnly=true');
      return data;
    }
  });

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - 300 : scrollLeft + 300;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  // Luxury Placeholder Feed if gallery is empty
  const placeholders = [
    "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070",
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=2070",
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2070",
    "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=2070",
    "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=2070"
  ];

  const displayItems = galleryItems?.length > 0 ? galleryItems : placeholders.map((url, i) => ({ _id: i, imageUrl: url }));

  return (
    <section className="py-16 md:py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <FiInstagram size={20} className="animate-pulse" />
              <span className="text-sm font-bold tracking-[0.2em] uppercase">Social Inspiration</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-gray-900 tracking-tight">
              Shop Our Instagram
            </h2>
            <p className="text-gray-500 text-lg max-w-xl">
              Tag <span className="text-primary font-bold">@grabszy</span> in your photos for a chance to be featured in our seasonal gallery.
            </p>
          </div>

          <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 mr-4">
                <button 
                    onClick={() => scroll('left')}
                    className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-all active:scale-90"
                >
                    <FiChevronLeft size={20} />
                </button>
                <button 
                    onClick={() => scroll('right')}
                    className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-all active:scale-90"
                >
                    <FiChevronRight size={20} />
                </button>
              </div>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-primary transition-all shadow-xl shadow-gray-900/10 active:scale-95 whitespace-nowrap"
              >
                <FiInstagram size={18} />
                Follow Us
              </a>
          </div>
        </div>

        {/* Scrollable Feed */}
        <div 
            ref={scrollRef}
            className="flex gap-4 md:gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-8 -mx-4 px-4 md:mx-0 md:px-0"
        >
          {displayItems.map((item, idx) => {
            const Content = (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
                className="min-w-[280px] md:min-w-[320px] aspect-square rounded-[2rem] overflow-hidden relative group cursor-pointer snap-start"
              >
                <Image 
                  src={item.imageUrl} 
                  alt={item.caption || "Instagram Post"} 
                  fill 
                  className="object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center text-white p-6 backdrop-blur-[2px]">
                  <div className="bg-white/20 p-4 rounded-full backdrop-blur-md mb-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <FiInstagram size={24} />
                  </div>
                  {item.caption && (
                      <p className="text-center text-sm font-medium line-clamp-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                          {item.caption}
                      </p>
                  )}
                  <span className="mt-6 text-xs font-bold uppercase tracking-widest bg-white/10 px-4 py-2 rounded-lg border border-white/20">
                    {item.externalLink ? "View on Instagram" : "View Post"}
                  </span>
                </div>
              </motion.div>
            );

            if (item.externalLink) {
                return (
                    <a key={item._id} href={item.externalLink} target="_blank" rel="noopener noreferrer">
                        {Content}
                    </a>
                );
            }

            return <React.Fragment key={item._id}>{Content}</React.Fragment>;
          })}
        </div>
      </div>
    </section>
  );
};

export default InstagramSection;
