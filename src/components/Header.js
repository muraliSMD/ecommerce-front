
"use client";

import { useSettingsStore } from "@/store/settingsStore";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { useUserStore } from "@/store/userStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { FiSearch, FiShoppingBag, FiUser, FiMenu, FiX, FiHeart, FiLogOut, FiChevronDown, FiChevronRight, FiGrid } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import NotificationBell from "./NotificationBell";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null); // For desktop mega menu

  const pathname = usePathname();
  const router = useRouter();
  
  const cartItems = useCartStore((state) => state.items);
  const { userInfo: user, logout, setAuthModalOpen } = useUserStore();
  const wishlistItems = useWishlistStore((state) => state.items);
  const settings = useSettingsStore((state) => state.settings);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlistItems.length;

  // Build Category Tree
  const buildCategoryTree = (categories) => {
      if (!categories) return [];
      const categoryMap = {};
      const tree = [];
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

  // Fetch Categories for Mega Menu
  const { data: categoriesRaw } = useQuery({
    queryKey: ["categories-menu"],
    queryFn: async () => {
      const { data } = await api.get("/categories");
      // Filter only active categories. 
      // Note: If a parent is inactive, we should ideally exclude all its descendants.
      // Since we fetch a flat list, we can filter by isActive first.
      const activeCategories = data.filter(cat => cat.isActive !== false);
      return activeCategories;
    },
    staleTime: 60 * 60 * 1000, // Cache categories for 1 hour
  });

  const categories = buildCategoryTree(categoriesRaw);

  // Debounce Search Input
  useEffect(() => {
    const timer = setTimeout(() => {
        setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch Search Results
  const { data: searchResults, isLoading: isLoadingSearch } = useQuery({
      queryKey: ["search-preview", debouncedSearch],
      queryFn: async () => {
          if (debouncedSearch.length < 3) return [];
          const { data } = await api.get(`/products?search=${debouncedSearch}&limit=5`);
          return data;
      },
      enabled: debouncedSearch.length > 2,
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    
    // Cleanup on unmount
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

  // Close mobile menu on resize > lg
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) { // lg breakpoint
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false); // New state for mobile search

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setIsMobileMenuOpen(false);
      setIsMobileSearchOpen(false); // Close mobile search on submit
    }
  };

  const logoColor = "text-gray-900";
  const iconColor = "text-gray-600";

  return (
    <>
    <header 
      onMouseLeave={() => setActiveCategory(null)}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white shadow-sm border-b border-gray-100 ${
        isScrolled ? "py-1" : "py-2"
      }`}
    >
      <div className="container mx-auto px-4 md:px-8">
        {/* Top Section */}
        <div className="flex items-center gap-4 lg:gap-12 py-2">
          
          {/* Logo */}
          <Link href="/" className="relative z-50 flex-shrink-0">
            {settings?.logo ? (
                <div className="relative h-16 w-44 lg:h-24 lg:w-64">
                    <Image 
                        src={settings.logo} 
                        alt={settings.siteName || "Logo"} 
                        fill 
                        sizes="(max-width: 1024px) 176px, 256px"
                        priority
                        className="object-cover object-left w-[75%] !w-[75%]" 
                    />
                </div>
            ) : (
             <span className={`font-display font-bold text-3xl lg:text-5xl tracking-tighter ${logoColor}`}>
                {settings?.siteName || "GRABSZY"}
                <span className="text-primary">.</span>
             </span>
            )}
          </Link>

          {/* Desktop Search Bar (Large) */}
          <div className="hidden lg:flex flex-1 max-w-2xl relative group">
            <form onSubmit={handleSearch} className="relative w-full">
              <div className="relative flex items-center w-full">
                <FiSearch size={20} className="absolute left-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Try Saree, Kurti or Search by Product Code"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setTimeout(() => setIsInputFocused(false), 200)}
                  className="w-full pl-12 pr-4 py-2.5 rounded-md border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-primary/30 transition-all text-sm"
                />
              </div>
            </form>

            <AnimatePresence>
                {isInputFocused && searchQuery.length > 2 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 w-full bg-white rounded-b-md shadow-xl border border-gray-100 mt-0 overflow-hidden z-[60]"
                    >
                        {isLoadingSearch ? (
                            <div className="p-4 text-center text-gray-400 text-sm">Searching...</div>
                        ) : searchResults?.length > 0 ? (
                            <ul>
                                {searchResults.map((product) => product && (
                                    <li key={product._id}>
                                        <Link 
                                            href={`/product/${product.slug || product._id}`}
                                            className="flex items-center gap-4 p-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                                        >
                                            <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden relative flex-shrink-0">
                                                <Image 
                                                    src={product.images?.[0] || product.variants?.[0]?.images?.[0] || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2070"} 
                                                    alt={product.name} 
                                                    fill 
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-xs font-bold text-gray-900 truncate">{product.name}</h4>
                                                <p className="text-xs text-primary font-bold">{settings?.currency} {product.price}</p>
                                            </div>
                                        </Link>
                                    </li>
                                ))}
                                <li>
                                    <Link 
                                        href={`/shop?search=${encodeURIComponent(searchQuery)}`}
                                        className="block text-center py-2 text-xs font-bold text-primary hover:bg-gray-50 transition-colors"
                                    >
                                        View All Results
                                    </Link>
                                </li>
                            </ul>
                        ) : (
                            <div className="p-4 text-center text-gray-400 text-sm">
                                No products found.
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
          </div>

          {/* Desktop Actions (Labeled) */}
          <div className="hidden lg:flex items-center gap-10 ml-auto">
            {/* Notifications */}
            {user && (
              <div className="flex flex-col items-center group relative">
                <NotificationBell align="right" />
                <span className="text-[11px] font-medium text-gray-600 mt-1 uppercase tracking-wider group-hover:text-primary">Alerts</span>
              </div>
            )}
            
            {/* User Profile */}
            <div className="relative group flex flex-col items-center">
              {user ? (
                <>
                  <Link href={user.role === 'admin' ? '/admin' : '/account'} className="flex flex-col items-center group">
                    <FiUser size={20} className="text-gray-700 group-hover:text-primary transition-colors" />
                    <span className="text-[11px] font-medium text-gray-600 mt-1 uppercase tracking-wider group-hover:text-primary">Profile</span>
                  </Link>
                  <div className="absolute top-full right-0 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right z-50">
                      <div className="bg-white rounded shadow-xl border border-gray-100 p-2 w-48 overflow-hidden">
                          <div className="px-4 py-3 border-b border-gray-100 mb-2 text-center">
                              <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                              <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          </div>
                          <Link href="/account" className="flex items-center gap-2 px-4 py-2 text-xs text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors">
                              <FiGrid size={12} /> Dashboard
                          </Link>
                          <Link href="/account/profile" className="flex items-center gap-2 px-4 py-2 text-xs text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors">
                              <FiUser size={12} /> My Profile
                          </Link>
                          <Link href="/wishlist" className="flex items-center gap-2 px-4 py-2 text-xs text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors">
                              <FiHeart size={12} /> Wishlist ({wishlistCount})
                          </Link>
                          <button onClick={async () => { await logout(); router.refresh(); }} className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-500 hover:bg-red-50 transition-colors text-left mt-1 border-t border-gray-50">
                              <FiLogOut size={12} /> Logout
                          </button>
                      </div>
                  </div>
                </>
              ) : (
                <button 
                  onClick={() => setAuthModalOpen(true, "login")}
                  className="flex flex-col items-center group"
                >
                  <FiUser size={20} className="text-gray-700 group-hover:text-primary transition-colors" />
                  <span className="text-[11px] font-medium text-gray-600 mt-1 uppercase tracking-wider group-hover:text-primary">Profile</span>
                </button>
              )}
            </div>

            {/* Wishlist */}
            <Link href="/wishlist" className="flex flex-col items-center group relative">
              <div className="relative">
                <FiHeart size={20} className="text-gray-700 group-hover:text-primary transition-colors" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                    {wishlistCount}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-medium text-gray-600 mt-1 uppercase tracking-wider group-hover:text-primary">Wishlist</span>
            </Link>

            {/* Cart */}
            <Link href="/cart" className="flex flex-col items-center group relative">
              <div className="relative">
                <FiShoppingBag size={20} className="text-gray-700 group-hover:text-primary transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-medium text-gray-600 mt-1 uppercase tracking-wider group-hover:text-primary">Cart</span>
            </Link>
          </div>

          {/* Mobile Actions */}
          <div className="flex lg:hidden items-center gap-4 ml-auto">
            <button
                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                className="p-1 text-gray-700"
                aria-label="Search"
            >
                <FiSearch size={22} />
            </button>
            
            {user && (
                <div className="flex items-center justify-center -mx-1">
                    <NotificationBell align="right" />
                </div>
            )}

            <Link href="/wishlist" className="relative p-1" aria-label={`Wishlist with ${wishlistCount} items`}>
              <FiHeart size={22} className="text-gray-700" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link href="/cart" className="relative p-1" aria-label={`Cart with ${cartCount} items`}>
              <FiShoppingBag size={22} className="text-gray-700" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                  {cartCount}
                </span>
              )}
            </Link>

            <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-1 text-gray-700"
                aria-label="Open Menu"
            >
                <FiMenu size={24} />
            </button>
          </div>
        </div>

        {/* Bottom Section - Category Navigation */}
        <nav className="hidden lg:flex items-center justify-between border-t border-gray-50">
          <ul className="flex items-center gap-6 overflow-x-auto no-scrollbar py-2">
            <li className="flex-shrink-0">
               <Link href="/" className={`text-sm font-medium whitespace-nowrap text-gray-700 hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary pb-1`}>
                 All
               </Link>
            </li>
            {categories?.map((cat) => (
              <li 
                key={cat._id} 
                className="flex-shrink-0 relative group"
                onMouseEnter={() => setActiveCategory(cat._id)}
              >
                <Link 
                  href={`/shop?category=${cat.slug || cat.name}`}
                  className={`text-sm font-medium whitespace-nowrap text-gray-700 hover:text-primary transition-colors border-b-2 ${activeCategory === cat._id ? 'border-primary' : 'border-transparent'} hover:border-primary pb-1`}
                >
                  {cat.name}
                </Link>
              </li>
            ))}
            <li className="flex-shrink-0">
               <Link href="/shop" className="text-sm font-medium whitespace-nowrap text-gray-700 hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary pb-1">
                 New Arrivals
               </Link>
            </li>
          </ul>
        </nav>

        {/* Mobile Search Overlay */}
        <AnimatePresence>
            {isMobileSearchOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="lg:hidden absolute top-full left-0 w-full bg-white border-t border-gray-100 shadow-md z-40 overflow-hidden"
                >
                    <div className="p-4">
                        <form onSubmit={handleSearch} className="relative">
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-md outline-none focus:ring-1 focus:ring-primary/20 text-gray-900 text-sm"
                            />
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            <button 
                                type="button" 
                                onClick={() => setIsMobileSearchOpen(false)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 p-1"
                                aria-label="Close search"
                            >
                                <FiX size={18} />
                            </button>
                        </form>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Mega Menu Dropdown */}
        <AnimatePresence>
            {activeCategory && activeCategory !== 'shop' && (
                <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute top-full left-0 w-full bg-white border-t border-gray-100 shadow-2xl py-8 z-40"
                    onMouseEnter={() => setActiveCategory(activeCategory)}
                    onMouseLeave={() => setActiveCategory(null)}
                >
                    <div className="container mx-auto px-8">
                        <div className="grid grid-cols-5 gap-8">
                            {(() => {
                                const cat = categories?.find(c => c._id === activeCategory);
                                if (!cat) return null;
                                return (
                                    <>
                                        <div className="col-span-1">
                                            <h3 className="font-bold text-gray-900 mb-2 text-base">{cat.name}</h3>
                                            <p className="text-xs text-gray-500 mb-4">Discover our premium collection of {cat.name.toLowerCase()}</p>
                                            <Link href={`/shop?category=${cat.slug || cat.name}`} className="text-primary font-bold text-xs hover:underline flex items-center gap-1">
                                              View All <FiChevronRight />
                                            </Link>
                                        </div>
                                        {cat.children?.length > 0 ? (
                                            <div className="col-span-4 grid grid-cols-4 gap-6 border-l border-gray-50 pl-8">
                                                {cat.children.map(sub => (
                                                    <div key={sub._id}>
                                                        <Link 
                                                            href={`/shop?category=${sub.slug || sub.name}`} 
                                                            className="text-gray-800 font-bold text-xs uppercase tracking-wider hover:text-primary transition-colors mb-4 block"
                                                        >
                                                            {sub.name}
                                                        </Link>
                                                        {sub.children?.length > 0 && (
                                                            <ul className="space-y-2">
                                                                {sub.children.map(grandChild => (
                                                                    <li key={grandChild._id}>
                                                                        <Link href={`/shop?category=${grandChild.slug || grandChild.name}`} className="text-gray-500 hover:text-primary text-xs flex items-center gap-1 group">
                                                                            <span className="w-0 group-hover:w-1 h-0.5 bg-primary transition-all"></span> {grandChild.name}
                                                                        </Link>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="col-span-4 py-4 text-center text-gray-400 text-sm">
                                              No subcategories found for this category.
                                            </div>
                                        )}
                                    </>
                                )
                            })()}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

      </div>
    </header>

    {/* Mobile Drawer Navigation moved outside header to avoid stacking context issues */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[85%] max-w-sm bg-surface z-[70] shadow-2xl flex flex-col overflow-hidden"
            >
               <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                  <span className="font-display font-bold text-xl">GRABSZY.</span>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-full hover:bg-gray-100" aria-label="Close menu">
                     <FiX size={24} />
                  </button>
               </div>

               <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Reuse the mobile search component logic here if desired, but sticking to design, we can keep or remove the drawer search if the header search is the primary one now. 
                      However, keeping it as fallback or alternative is fine, or removing it to avoid duplication. 
                      Let's hiding it or keeping it doesn't hurt. But typically if we have header search, drawer search is redundant.
                      For now I'll leave it as is to avoid confusion, or user can decide to remove.
                  */}
                  <form onSubmit={handleSearch} className="mb-6">
                     <div className="relative">
                        <input
                           type="text"
                           placeholder="Search products..."
                           value={searchQuery}
                           onChange={(e) => setSearchQuery(e.target.value)}
                           className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                     </div>
                  </form>

                  <div className="space-y-2">
                     <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="block py-2.5 text-lg font-bold text-gray-900 hover:text-primary">Home</Link>
                     <div className="py-2.5">
                        <p className="text-lg font-bold text-gray-900 mb-2">Shop</p>
                        <div className="pl-4 space-y-3 border-l-2 border-gray-100">
                           <Link href="/shop" onClick={() => setIsMobileMenuOpen(false)} className="block text-gray-600">All Products</Link>
                           {categories?.map(cat => (
                               <div key={cat._id} className="space-y-1">
                                   <Link href={`/shop?category=${cat.slug || cat.name}`} onClick={() => setIsMobileMenuOpen(false)} className="block text-gray-800 font-medium flex items-center justify-between">
                                      {cat.name}
                                   </Link>
                                   {cat.children?.length > 0 && (
                                       <div className="pl-4 border-l border-gray-100 space-y-1">
                                           {cat.children.map(sub => (
                                               <Link key={sub._id} href={`/shop?category=${sub.slug || sub.name}`} onClick={() => setIsMobileMenuOpen(false)} className="block text-sm text-gray-500 hover:text-primary">
                                                  {sub.name}
                                               </Link>
                                           ))}
                                       </div>
                                   )}
                               </div>
                           ))}
                        </div>
                     </div>
                     <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="block py-2.5 text-lg font-bold text-gray-900 hover:text-primary">About</Link>
                     <Link href="/gallery" onClick={() => setIsMobileMenuOpen(false)} className="block py-2.5 text-lg font-bold text-gray-900 hover:text-primary">Gallery</Link>
                     <Link href="/blog" onClick={() => setIsMobileMenuOpen(false)} className="block py-2.5 text-lg font-bold text-gray-900 hover:text-primary">Blog</Link>
                     <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className="block py-2.5 text-lg font-bold text-gray-900 hover:text-primary">Contact</Link>
                  </div>
               </div>

               <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                  {user ? (
                     <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-4">
                           <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                              {user.name[0]}
                           </div>
                           <div>
                              <p className="font-bold text-gray-900">{user.name}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                           </div>
                        </div>
                        <Link href="/account/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-gray-600 p-2 hover:bg-white rounded-lg transition-colors">
                           <FiUser /> Profile
                        </Link>
                        <Link href="/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-gray-600 p-2 hover:bg-white rounded-lg transition-colors">
                           <FiHeart /> Wishlist ({wishlistCount})
                        </Link>
                        <button onClick={async () => { await logout(); setIsMobileMenuOpen(false); router.refresh(); }} className="flex items-center gap-3 text-red-500 p-2 hover:bg-white rounded-lg w-full transition-colors">
                           <FiLogOut /> Logout
                        </button>
                     </div>
                  ) : (
                     <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => { setIsMobileMenuOpen(false); setAuthModalOpen(true, "login"); }} className="flex items-center justify-center py-3 rounded-xl border border-gray-200 font-bold text-gray-900">Login</button>
                        <button onClick={() => { setIsMobileMenuOpen(false); setAuthModalOpen(true, "signup"); }} className="flex items-center justify-center py-3 rounded-xl bg-gray-900 text-white font-bold">Register</button>
                     </div>
                  )}
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

