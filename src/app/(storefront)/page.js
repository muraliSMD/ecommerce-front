"use client";

import HeroSlider from "@/components/HeroSlider";
import ProductCard from "@/components/ProductCard";
import Image from "next/image";
import { useProducts } from "@/hooks/useProducts";
import { useCartStore } from "@/store/cartStore";
import { motion } from "framer-motion";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function Home() {
  const addToCart = useCartStore((state) => state.addToCart);

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
    <main className="bg-surface min-h-screen">
      <HeroSlider />

      {/* Categories Section */}
      <section className="container mx-auto py-16 md:py-24 px-4 md:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-10 gap-4">
          <div className="text-center md:text-left">
            <span className="text-primary font-bold tracking-widest uppercase text-xs md:text-sm">Collections</span>
            <h2 className="text-3xl md:text-5xl font-display font-bold mt-2 text-gray-900">Shop by Category</h2>
          </div>
          <Link href="/shop" className="text-primary font-bold flex items-center gap-2 hover:gap-3 transition-all">
            View All Categories <FiArrowRight />
          </Link>
        </div>
        
        {isCategoriesLoading ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 md:gap-4">
                 {[...Array(16)].map((_, i) => <div key={i} className="aspect-square bg-gray-200 rounded-2xl animate-pulse"></div>)}
            </div>
        ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 md:gap-4">
            {categories?.slice(0, 16).map((cat, i) => (
                <Link href={`/shop?category=${cat.name}`} key={cat._id}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.03 }}
                    className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all bg-gray-100"
                >
                    {cat.image ? (
                        <Image 
                        src={cat.image} 
                        alt={cat.name} 
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110" 
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400 font-bold text-lg">
                            {cat.name}
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <h3 className="text-xl font-bold text-white text-center px-2 drop-shadow-md transform group-hover:scale-105 transition-transform">{cat.name}</h3>
                    </div>
                </motion.div>
                </Link>
            ))}
            </div>
        )}
      </section>

      {/* Featured Products Section */}
      {featuredProducts?.length > 0 && (
          <section className="bg-white py-16 md:py-24">
            <div className="container mx-auto px-4 md:px-8">
                <div className="text-center mb-16">
                    <span className="text-primary font-bold tracking-widest uppercase text-xs md:text-sm">Don&apos;t Miss Out</span>
                    <h2 className="text-3xl md:text-5xl font-display font-bold mt-2 text-gray-900">Featured Products</h2>
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

      {/* New Arrivals Section */}
      <section className="bg-white/30 backdrop-blur-xl py-16 md:py-24 border-y border-white/50">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <span className="text-primary font-bold tracking-widest uppercase text-xs md:text-sm">Fresh Drops</span>
            <h2 className="text-3xl md:text-5xl font-display font-bold mt-2 text-gray-900">New Arrivals</h2>
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
          
          <div className="mt-16 text-center">
             <Link href="/shop" className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-primary transition-colors shadow-xl shadow-gray-900/20 active:scale-95">
                View All Products <FiArrowRight />
             </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="container mx-auto py-16 md:py-24 px-4 md:px-8">
        <div className="bg-gray-900 rounded-[2.5rem] p-8 md:p-20 text-center text-white relative overflow-hidden shadow-2xl shadow-gray-900/30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/30 rounded-full blur-[100px] -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/30 rounded-full blur-[100px] -ml-48 -mb-48" />
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-6 md:space-y-8">
            <h2 className="text-3xl md:text-5xl font-display font-bold leading-tight">Join the GRABSZY Club</h2>
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
