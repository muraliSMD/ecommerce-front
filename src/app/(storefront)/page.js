"use client";

import { useState, useRef } from "react";
import HeroSlider from "@/components/HeroSlider";
import ProductCard from "@/components/ProductCard";
import Image from "next/image";
import { useProducts } from "@/hooks/useProducts";
import { useCartStore } from "@/store/cartStore";
import { motion } from "framer-motion";
import Link from "next/link";
import { FiArrowRight, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function Home() {
  const addToCart = useCartStore((state) => state.addToCart);
  const categorySliderRef = useRef(null);

  const scrollCategories = (direction) => {
    if (categorySliderRef.current) {
      const { scrollLeft, clientWidth } = categorySliderRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - (clientWidth / 2) : scrollLeft + (clientWidth / 2);
      categorySliderRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  // Fetch Categories
  const { data: categories, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ["categories-home"],
    queryFn: async () => {
      const { data } = await api.get("/categories");
      return data;
    },
  });

  // Fetch Featured Products
  const { data: featuredProducts, isLoading: isFeaturedLoading } = useProducts({ isFeatured: true, limit: 10 });

  // Fetch New Arrivals
  const { data: newArrivals, isLoading: isNewArrivalsLoading } = useProducts({ sort: 'newest', limit: 10 });

  return (
    <main className="bg-surface min-h-screen pt-28 md:pt-32">
      <HeroSlider />

      {/* Categories Section */}
      <section className="container mx-auto py-6 md:py-10 px-4 md:px-8">
        <div className="bg-[#bfdbfe] rounded-[2.5rem] p-6 md:p-8 border border-blue-300 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-center mb-6 px-2">
            <h2 className="text-xl md:text-2xl font-display font-bold text-gray-900">
              Shop by Category
            </h2>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => scrollCategories('left')}
                className="w-10 h-10 bg-white text-gray-900 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors shadow-sm active:scale-95"
                title="Scroll Left"
              >
                <FiChevronLeft className="text-lg" />
              </button>
              <button 
                onClick={() => scrollCategories('right')}
                className="w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center hover:bg-primary transition-colors shadow-lg active:scale-95"
                title="Scroll Right"
              >
                <FiChevronRight className="text-lg" />
              </button>
            </div>
          </div>
          
          {isCategoriesLoading ? (
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 snap-x">
                 {[...Array(8)].map((_, i) => <div key={i} className="min-w-[96px] md:min-w-[128px] aspect-square bg-white/50 rounded-2xl animate-pulse"></div>)}
            </div>
          ) : (
            <div 
              ref={categorySliderRef}
              className="flex gap-4 md:gap-6 overflow-x-auto no-scrollbar pb-4 snap-x snap-mandatory"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
            {categories?.filter(c => c.level > 0).map((cat, i) => (
                <Link href={`/shop?category=${cat.slug || cat.name}`} key={cat._id} className="group w-[96px] sm:w-[112px] md:w-[128px] lg:w-[144px] flex-shrink-0 snap-start">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="space-y-3 w-full"
                >
                    <div className="relative w-full aspect-square rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all bg-white">
                        {cat.image ? (
                            <Image 
                            src={cat.image} 
                            alt={cat.name} 
                            fill
                            sizes="(max-width: 640px) 96px, (max-width: 768px) 128px, 144px"
                            className="object-cover transition-transform duration-700 group-hover:scale-110" 
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-white text-gray-400 font-bold text-lg text-center p-2">
                                {cat.name}
                            </div>
                        )}
                    </div>
                    <h3 title={cat.name} className="text-sm md:text-base font-bold text-gray-900 text-center truncate group-hover:text-primary transition-colors w-full">{cat.name}</h3>
                </motion.div>
                </Link>
            ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products Section */}
      {featuredProducts?.length > 0 && (
          <section className="bg-white py-6 md:py-10">
            <div className="container mx-auto px-4 md:px-8">
                <div className="text-center mb-8">
                    <span className="text-primary font-bold tracking-widest uppercase text-xs md:text-sm">Don&apos;t Miss Out</span>
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-2xl md:text-3xl font-display font-bold mt-2 text-gray-900"
                    >
                        Featured Products
                    </motion.h2>
                </div>
                
                
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                    {featuredProducts.map((p, i) => (
                        <motion.div
                            key={p._id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <ProductCard
                                product={p}
                    onAddToCart={(prod, qty = 1, variant) => addToCart(prod, qty, variant)}
                            />
                        </motion.div>
                    ))}
                </div>
            </div>
          </section>
      )}

      {/* New Arrivals (Fresh Drops) Section */}
      <section className="container mx-auto py-6 md:py-10 px-4 md:px-8">
        <div className="bg-[#dbeafe] rounded-[2.5rem] p-6 md:p-8 border border-blue-200 shadow-sm">
          <div className="flex justify-between items-center mb-6 px-2">
            <h2 className="text-xl md:text-2xl font-display font-bold text-gray-900">
              Fresh Drops
            </h2>
            <Link 
              href="/shop" 
              className="w-10 h-10 md:w-12 md:h-12 bg-gray-900 text-white rounded-full flex items-center justify-center hover:bg-primary transition-colors shadow-lg active:scale-95"
            >
              <FiArrowRight className="text-lg md:text-xl" />
            </Link>
          </div>

          {isNewArrivalsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white/50 h-[260px] rounded-[2rem]" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
              {newArrivals?.map((p, i) => (
                <motion.div
                  key={p._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <ProductCard
                    product={p}
                    onAddToCart={(prod) => addToCart(prod, 1)}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="container mx-auto py-6 md:py-10 px-4 md:px-8">
        <div className="bg-gray-900 rounded-[2.5rem] p-6 md:p-12 text-center text-white relative overflow-hidden shadow-2xl shadow-gray-900/30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/30 rounded-full blur-[100px] -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/30 rounded-full blur-[100px] -ml-48 -mb-48" />
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-6 md:space-y-8">
            <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-2xl md:text-3xl font-display font-bold leading-tight"
            >
                Join the GRABSZY Club
            </motion.h2>
            <p className="text-gray-400 text-base md:text-lg">Subscribe to receive updates, access to exclusive deals, and more.</p>
            
            <div className="flex flex-col md:flex-row gap-4 max-w-md mx-auto w-full">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-white/10 border border-white/20 rounded-xl md:rounded-2xl px-6 py-4 flex-grow focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder-gray-400"
              />
              <button className="bg-primary hover:bg-secondary text-white px-8 py-4 rounded-xl md:rounded-2xl font-bold transition-all active:scale-95 whitespace-nowrap shadow-lg shadow-primary/30">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
