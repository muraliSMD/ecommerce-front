"use client";

import { useState, useEffect } from "react";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import Image from "next/image";
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
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

// Helper to separate render
const CategoryButton = ({ category, selectedCategory, setSelectedCategory, level = 0 }) => (
    <>
        <button
          onClick={() => setSelectedCategory(category.slug || category.name)}
          className={`w-full text-left px-4 py-2.5 rounded-lg transition-all text-sm font-medium flex items-center justify-between ${
            selectedCategory === (category.slug || category.name)
              ? "bg-primary text-white shadow-lg shadow-primary/20"
              : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          }`}
          style={{ paddingLeft: `${level * 1 + 1}rem` }}
        >
          {category.name}
          {selectedCategory === (category.slug || category.name) && <FiX className="ml-2" onClick={(e) => { e.stopPropagation(); setSelectedCategory("All"); }} />}
        </button>
        {category.children?.map(child => (
            <CategoryButton 
                key={child._id} 
                category={child} 
                level={level + 1}
                selectedCategory={selectedCategory} 
                setSelectedCategory={setSelectedCategory} 
            />
        ))}
    </>
);

const FilterContent = ({ 
    search, 
    setSearch, 
    categories, 
    selectedCategory, 
    setSelectedCategory, 
    priceRange, 
    setPriceRange 
  }) => (
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
        <div className="space-y-1 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
           <button
              onClick={() => setSelectedCategory("All")}
              className={`w-full text-left px-4 py-2.5 rounded-lg transition-all text-sm font-medium ${
                selectedCategory === "All"
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              All Categories
            </button>
          {categories?.map((cat) => (
             <CategoryButton 
                key={cat._id} 
                category={cat} 
                selectedCategory={selectedCategory} 
                setSelectedCategory={setSelectedCategory} 
             />
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
            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg outline-none focus:border-primary text-sm"
          />
          <input
            type="number"
            placeholder="Max"
            value={priceRange.max}
            onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg outline-none focus:border-primary text-sm"
          />
        </div>
      </div>
    </div>
  );

export default function ShopPage() {
  const searchParams = useSearchParams();
  const urlCategory = searchParams.get("category");

  // State
  const [viewMode, setViewMode] = useState("grid"); // grid | list
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // Filters
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(urlCategory || "All");
  const [sort, setSort] = useState("newest");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });

  // Sync with URL category if it changes
  useEffect(() => {
    if (urlCategory) {
      setSelectedCategory(urlCategory);
    } else {
      setSelectedCategory("All");
    }
  }, [urlCategory]);

  const addToCart = useCartStore((state) => state.addToCart);
  const formatPrice = useSettingsStore((state) => state.formatPrice);

  // Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Lock body scroll when filters open
  useEffect(() => {
    if (showMobileFilters) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [showMobileFilters]);

  // Build Category Tree Logic
  const buildCategoryTree = (categories) => {
      if (!categories) return [];
      const categoryMap = {};
      const tree = [];
      // Deep clone to avoid mutating original if needed, but here simple map is ok
      categories.forEach(cat => {
          categoryMap[cat._id] = { ...cat, children: [] };
      });
      categories.forEach(cat => {
          if (cat.parent) {
             const parentId = typeof cat.parent === 'object' ? cat.parent._id : cat.parent;
             if (categoryMap[parentId]) {
                 categoryMap[parentId].children.push(categoryMap[cat._id]);
             }
          } else {
             tree.push(categoryMap[cat._id]);
          }
      });
      return tree;
  };

  // Fetch Categories
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await api.get("/categories");
      return buildCategoryTree(data);
    },
  });

  // Fetch Products with Infinite Query
  const { 
    data, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage, 
    isLoading 
  } = useInfiniteQuery({
    queryKey: ["products", selectedCategory, sort, debouncedSearch, priceRange],
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams({
        sort,
        search: debouncedSearch,
        page: pageParam,
        limit: 20,
      });
      
      if (selectedCategory !== "All") params.append("category", selectedCategory);
      if (priceRange.min) params.append("minPrice", priceRange.min);
      if (priceRange.max) params.append("maxPrice", priceRange.max);

      const { data } = await api.get(`/products?${params.toString()}`);
      return data;
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage && lastPage.length === 20 ? allPages.length + 1 : undefined;
    },
  });

  const products = data?.pages.flatMap(page => page) || [];

  const handleAddToCart = (product, qty = 1, variant) => {
    addToCart(product, qty, variant);
    toast.success("Added to cart", {
        style: {
            borderRadius: '16px',
            background: '#333',
            color: '#fff',
        },
    });
  };

  return (
    <main className="bg-white min-h-screen pb-8 md:pb-12 pt-24 md:pt-28">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mb-4">
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
            className="lg:hidden flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200 font-bold shadow-sm text-gray-900"
            onClick={() => setShowMobileFilters(true)}
          >
            <span className="flex items-center gap-2"><FiFilter /> Filter & Sort</span>
            <span className="bg-black text-white px-2 py-0.5 rounded-full text-xs">{products?.length || 0}</span>
          </button>

          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
             <div className="sticky top-24">
                <FilterContent 
                    search={search}
                    setSearch={setSearch}
                    categories={categories}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    priceRange={priceRange}
                    setPriceRange={setPriceRange}
                />
             </div>
          </aside>

          {/* Mobile Filter Sidebar */}
          <AnimatePresence>
            {showMobileFilters && (
                <>
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    onClick={() => setShowMobileFilters(false)}
                    className="fixed inset-0 bg-black/50 z-50 lg:hidden backdrop-blur-sm"
                />
                <motion.aside 
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="fixed inset-y-0 right-0 z-50 w-full max-w-xs bg-surface p-6 shadow-2xl overflow-y-auto lg:hidden"
                >
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-xl font-bold font-display">Filters</h2>
                        <button onClick={() => setShowMobileFilters(false)} className="p-2 bg-gray-100 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors">
                            <FiX size={20}/>
                        </button>
                    </div>
                    <FilterContent 
                        search={search}
                        setSearch={setSearch}
                        categories={categories}
                        selectedCategory={selectedCategory}
                        setSelectedCategory={setSelectedCategory}
                        priceRange={priceRange}
                        setPriceRange={setPriceRange}
                    />
                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <button 
                            onClick={() => setShowMobileFilters(false)}
                            className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-secondary transition-colors"
                        >
                            Show Results
                        </button>
                    </div>
                </motion.aside>
                </>
            )}
          </AnimatePresence>


          {/* Product Grid */}
          <div className="flex-1 bg-[#dbeafe] rounded-[2.5rem] p-6 md:p-8 border border-blue-200 shadow-sm relative overflow-hidden">
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
              <p className="text-gray-900 font-medium hidden sm:block">
                Showing <span className="font-bold">{products?.length || 0}</span> results
              </p>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-48">
                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        className="w-full appearance-none px-4 py-2.5 bg-white/80 backdrop-blur-sm border border-white/50 rounded-xl outline-none focus:border-primary cursor-pointer text-sm font-medium shadow-sm"
                    >
                        <option value="newest">Newest Arrivals</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                        <option value="oldest">Oldest First</option>
                    </select>
                    <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>

                <div className="flex bg-white/80 backdrop-blur-sm rounded-xl border border-white/50 p-1 shadow-sm">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-gray-100 text-primary shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                  >
                    <FiGrid size={20} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-gray-100 text-primary shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                  >
                    <FiList size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="bg-white/50 rounded-[2rem] h-[400px] animate-pulse" />
                ))}
              </div>
            ) : products?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white/60 backdrop-blur-sm rounded-[2rem] border border-white/50 shadow-sm">
                 <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-gray-300 mb-6 font-display text-4xl shadow-sm">
                    <FiSearch />
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
                <>
                <div className={
                    viewMode === "grid" 
                    ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4"
                    : "space-y-4"
                }>
                    <AnimatePresence mode="popLayout">
                        {products?.map((product) => (
                        viewMode === "grid" ? (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.4 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                key={product._id}
                            >
                                <ProductCard 
                                    product={product} 
                                    onAddToCart={handleAddToCart}
                                />
                            </motion.div>
                        ) : (
                            <motion.div 
                                layout
                                key={product._id}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ duration: 0.4 }}
                                exit={{ opacity: 0 }}
                                className="bg-white p-4 rounded-[2rem] border border-gray-100 flex flex-col sm:flex-row gap-6 items-start sm:items-center group hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all"
                            >
                                 <Link href={`/product/${product._id}`} className="block w-full sm:w-48 h-48 sm:h-32 flex-shrink-0 bg-surface rounded-2xl overflow-hidden relative">
                                    <Image 
                                        src={product.images?.[0] || product.variants?.[0]?.images?.[0] || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2070"} 
                                        alt={product.name}
                                        fill
                                        className="object-cover transition-transform group-hover:scale-110"
                                    />
                                 </Link>
                                 <div className="flex-1 w-full">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">
                                                {product.category?.name || (typeof product.category === 'string' && !product.category.match(/^[0-9a-fA-F]{24}$/) ? product.category : "Collection")}
                                            </p>
                                            <Link href={`/product/${product._id}`}>
                                                <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-primary transition-colors">{product.name}</h3>
                                            </Link>
                                        </div>
                                        <span className="text-xl font-bold text-gray-900">{formatPrice(product.price)}</span>
                                    </div>
                                    <p className="text-gray-500 line-clamp-2 mb-4 text-sm max-w-xl">{product.description}</p>
                                    <div className="flex items-center gap-3">
                                        {/* Logic similar to ProductCard: View Details if multiple variants, else Quick Add */}
                                        {product.variants && product.variants.length > 1 ? (
                                            <Link 
                                                href={`/product/${product._id}`} 
                                                className="bg-gray-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-primary transition-colors shadow-lg shadow-gray-900/10 active:scale-95 flex items-center gap-2"
                                            >
                                                Select Options
                                            </Link>
                                        ) : (() => {
                                            const isOutOfStock = product.stock <= 0 || (product.variants?.length === 1 && product.variants[0].stock <= 0);
                                            return (
                                            <button 
                                                disabled={isOutOfStock}
                                                onClick={() => {
                                                    const variant = product.variants?.length === 1 ? product.variants[0] : null;
                                                    handleAddToCart(product, 1, variant);
                                                }}
                                                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-gray-900/10 active:scale-95 ${
                                                    isOutOfStock
                                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                                                        : "bg-gray-900 text-white hover:bg-primary"
                                                }`}
                                            >
                                                {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                                            </button>
                                            );
                                        })()}
                                        <Link href={`/product/${product._id}`} className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                                            View Details
                                        </Link>
                                    </div>
                                 </div>
                            </motion.div>
                        )
                        ))}
                    </AnimatePresence>
                </div>
                
                {/* Load More Button */}
                {hasNextPage && (
                    <div className="mt-12 text-center">
                        <button
                            onClick={() => fetchNextPage()}
                            disabled={isFetchingNextPage}
                            className="bg-white border border-gray-200 text-gray-900 px-8 py-3 rounded-xl font-bold hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                            {isFetchingNextPage ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                                    Loading...
                                </span>
                            ) : (
                                "Load More Products"
                            )}
                        </button>
                    </div>
                )}
                </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
