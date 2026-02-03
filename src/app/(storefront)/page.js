"use client";

import HeroSlider from "@/components/HeroSlider";
import ProductCard from "@/components/ProductCard";
import Image from "next/image";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import { motion } from "framer-motion";

const categories = [
  { name: "Outerwear", image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?q=80&w=2070" },
  { name: "Denim", image: "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=2070" },
  { name: "Accessories", image: "https://images.unsplash.com/photo-1576053139778-7e32f2ae3cfd?q=80&w=2070" },
  { name: "Footwear", image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=2070" },
];

export default function Home() {
  const { data: products, isLoading, isError } = useProducts();
  const { addToCart } = useCart();

  return (
    <main className="bg-surface">
      <HeroSlider />

      {/* Categories Section */}
      <section className="container mx-auto py-20 px-4">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-display font-bold mb-2">Shop by Category</h2>
            <p className="text-gray-500">Discover our curated collections for every occasion.</p>
          </div>
          <button className="text-primary font-bold flex items-center gap-2 hover:gap-3 transition-all">
            View All Categories <span>&rarr;</span>
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative h-80 rounded-[2rem] overflow-hidden cursor-pointer"
            >
              <Image 
                src={cat.image} 
                alt={cat.name} 
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
              <div className="absolute bottom-6 left-6">
                <h3 className="text-2xl font-bold text-white mb-1">{cat.name}</h3>
                <p className="text-white/80 text-sm">Explore Collection</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Products Section */}
      <section className="bg-white/30 backdrop-blur-xl py-20 border-y border-white/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-primary font-bold tracking-widest uppercase text-sm">Our Favorites</span>
            <h2 className="text-5xl font-display font-bold mt-2">New Arrivals</h2>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="animate-pulse bg-surface h-96 rounded-[2rem]" />
              ))}
            </div>
          ) : isError ? (
            <p className="text-center text-red-500">Failed to load products.</p>
          ) : products?.length === 0 ? (
            <p className="text-center text-gray-500">No products added yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {products?.map((p, i) => (
                <motion.div
                  key={p._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <ProductCard
                    product={p}
                    onAddToCart={(prod) => addToCart({ product: prod, quantity: 1 })}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="container mx-auto py-24 px-4">
        <div className="bg-primary-900 bg-gray-900 rounded-[3rem] p-12 md:p-24 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/20 rounded-full blur-[100px] -ml-48 -mb-48" />
          
          <div className="relative z-10 max-w-2xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-6xl font-display font-bold">Join the GRABSZY Club</h2>
            <p className="text-gray-400 text-lg">Subscribe to receive updates, access to exclusive deals, and more.</p>
            
            <div className="flex flex-col md:flex-row gap-4">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-white/10 border border-white/20 rounded-2xl px-6 py-4 flex-grow focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button className="bg-primary hover:bg-secondary text-white px-10 py-4 rounded-2xl font-bold transition-all active:scale-95 whitespace-nowrap">
                Subscribe Now
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
