"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import Image from "next/image"; // Added Image import
import { useCartStore } from "@/store/cartStore";
import { useSettingsStore } from "@/store/settingsStore";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiSearch, 
  FiFilter, 
  FiX, 
  FiChevronDown, 
  FiGrid, 
  FiList 
} from "react-icons/fi";
import Link from "next/link";
import toast from "react-hot-toast";

export default function ShopPage() {
  // State
  const [viewMode, setViewMode] = useState("grid"); // grid | list
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // Filters
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sort, setSort] = useState("newest");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });

  const addToCart = useCartStore((state) => state.addToCart);
  const formatPrice = useSettingsStore((state) => state.formatPrice);

  // Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch Categories
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await api.get("/categories");
      return [{ _id: "all", name: "All" }, ...data];
    },
  });

  // Fetch Products
  const { data: products, isLoading } = useQuery({
    queryKey: ["products", selectedCategory, sort, debouncedSearch, priceRange],
    queryFn: async () => {
      const params = new URLSearchParams({
        sort,
        search: debouncedSearch,
      });
      
      if (selectedCategory !== "All") params.append("category", selectedCategory);
      if (priceRange.min) params.append("minPrice", priceRange.min);
      if (priceRange.max) params.append("maxPrice", priceRange.max);

      const { data } = await api.get(`/products?${params.toString()}`);
      return data;
    },
  });

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    toast.success("Added to cart");
  };

  return (
    <main className="bg-surface min-h-screen pb-20">
      <div className="container mx-auto px-4 md:px-8">
        <div className="py-6">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Shop", href: "/shop" },
            ]}
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Filter Toggle */}
          <button 
            className="lg:hidden flex items-center justify-center gap-2 bg-white p-4 rounded-xl border border-gray-200 font-bold shadow-sm"
            onClick={() => setShowMobileFilters(true)}
          >
            <FiFilter /> Filter & Sort
          </button>

          {/* Sidebar Filters */}
          <aside className={`fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:static lg:bg-transparent lg:z-auto lg:w-64 transition-opacity ${showMobileFilters ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none lg:opacity-100 lg:pointer-events-auto"}`}>
            <div className={`absolute inset-y-0 right-0 w-80 bg-white p-6 shadow-2xl lg:static lg:w-auto lg:bg-transparent lg:p-0 lg:shadow-none transition-transform duration-300 ${showMobileFilters ? "translate-x-0" : "translate-x-full lg:translate-x-0"}`}>
              
              <div className="flex justify-between items-center lg:hidden mb-6">
                <h2 className="text-xl font-bold font-display">Filters</h2>
                <button onClick={() => setShowMobileFilters(false)} className="p-2 bg-gray-100 rounded-full">
                  <FiX />
                </button>
              </div>

              <div className="space-y-8">
                {/* Search */}
                <div className="relative">
                  <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>

                {/* Categories */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-4">Categories</h3>
                  <div className="space-y-2">
                    {categories?.map((cat) => (
                      <button
                        key={cat._id}
                        onClick={() => setSelectedCategory(cat.name)}
                        className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
                          selectedCategory === cat.name
                            ? "bg-primary text-white font-bold shadow-lg shadow-primary/20"
                            : "text-gray-500 hover:bg-gray-100"
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-4">Price Range</h3>
                  <div className="flex gap-4">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                      className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-primary"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                      className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-primary"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Mobile Overlay Closer */}
            <div className="absolute inset-0 -z-10 lg:hidden" onClick={() => setShowMobileFilters(false)} />
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
              <p className="text-gray-500 font-medium">
                Showing <span className="text-gray-900 font-bold">{products?.length || 0}</span> results
              </p>

              <div className="flex items-center gap-4">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-primary cursor-pointer custom-select"
                >
                  <option value="newest">Newest Arrivals</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="oldest">Oldest First</option>
                </select>

                <div className="hidden sm:flex bg-white rounded-lg border border-gray-200 p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-md transition-all ${viewMode === "grid" ? "bg-gray-100 text-primary" : "text-gray-400"}`}
                  >
                    <FiGrid />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-md transition-all ${viewMode === "list" ? "bg-gray-100 text-primary" : "text-gray-400"}`}
                  >
                    <FiList />
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            {isLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-[2rem] h-[400px] animate-pulse" />
                ))}
              </div>
            ) : products?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                 <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-gray-300 mb-6">
                    <FiSearch size={40} />
                 </div>
                 <h3 className="text-2xl font-bold text-gray-900">No products found</h3>
                 <p className="text-gray-500 mt-2">Try adjusting your filters or search terms.</p>
                 <button 
                    onClick={() => {
                        setSearch("");
                        setSelectedCategory("All");
                        setDebouncedSearch("");
                    }}
                    className="mt-6 text-primary font-bold hover:underline"
                 >
                    Clear all filters
                 </button>
              </div>
            ) : (
                <div className={
                    viewMode === "grid" 
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "space-y-6"
                }>
                    {products?.map((product) => (
                    viewMode === "grid" ? (
                        <ProductCard 
                            key={product._id} 
                            product={product} 
                            onAddToCart={handleAddToCart}
                        />
                    ) : (
                        <motion.div 
                            key={product._id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-white p-4 rounded-[2rem] border border-gray-100 flex gap-6 items-center group hover:border-primary/20 transition-all"
                        >
                             <Link href={`/product/${product._id}`} className="block w-32 h-32 flex-shrink-0 bg-surface rounded-2xl overflow-hidden relative">
                                <Image 
                                    src={product.images?.[0] || '/placeholder.jpg'} 
                                    alt={product.name}
                                    fill
                                    className="object-cover transition-transform group-hover:scale-110"
                                />
                             </Link>
                             <div className="flex-1">
                                <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">{product.category}</p>
                                <Link href={`/product/${product._id}`}>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-primary transition-colors">{product.name}</h3>
                                </Link>
                                <p className="text-gray-500 line-clamp-2 mb-4 text-sm">{product.description}</p>
                                <div className="flex items-center justify-between">
                                    <span className="text-xl font-bold text-gray-900">{formatPrice(product.price)}</span>
                                    <button 
                                        onClick={() => handleAddToCart(product)}
                                        className="bg-gray-900 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-primary transition-colors"
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                             </div>
                        </motion.div>
                    )
                    ))}
                </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
