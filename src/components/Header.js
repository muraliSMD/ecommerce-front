
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
      return data;
    },
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

  const isHome = pathname === "/";
  // Force scrolled styles on non-home pages so content is visible against light backgrounds
  const effectiveScrolled = isScrolled || !isHome;

  const textColor = effectiveScrolled ? "text-gray-600" : "text-white";
  const hoverColor = effectiveScrolled ? "hover:text-primary" : "hover:text-white/80";
  const logoColor = effectiveScrolled ? "text-gray-900" : "text-white";
  const iconColor = effectiveScrolled ? "text-gray-600" : "text-white";

  return (
    <>
    <header 
      onMouseLeave={() => setActiveCategory(null)}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        effectiveScrolled ? "bg-white/80 backdrop-blur-md shadow-sm py-4" : "bg-transparent py-6"
      }`}
    >
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="relative z-50 group">
            {settings?.logo ? (
                <div className="relative h-20 w-40">
                    <Image 
                        src={settings.logo} 
                        alt={settings.siteName || "Logo"} 
                        fill 
                        className="object-cover object-left"
                    />
                </div>
            ) : (
             <span className={`font-display font-bold text-2xl tracking-tighter ${logoColor}`}>
                {settings?.siteName || "GRABSZY"}
                <span className="text-primary">.</span>
             </span>
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link 
                href="/" 
                className={`text-sm font-medium ${textColor} ${hoverColor} transition-colors`}
                onMouseEnter={() => setActiveCategory(null)}
            >
                Home
            </Link>
            <div className="relative group">
                <Link 
                    href="/shop" 
                    className={`text-sm font-medium ${textColor} ${hoverColor} transition-colors flex items-center gap-1`}
                    onMouseEnter={() => setActiveCategory('shop')}
                >
                    Shop <FiChevronDown />
                </Link>
            </div>

            <Link href="/about" className={`text-sm font-medium ${textColor} ${hoverColor} transition-colors`}>About</Link>
            <Link href="/blog" className={`text-sm font-medium ${textColor} ${hoverColor} transition-colors`}>Blog</Link>
            <Link href="/contact" className={`text-sm font-medium ${textColor} ${hoverColor} transition-colors`}>Contact</Link>
          </nav>

          {/* Actions */}
          <div className="hidden lg:flex items-center gap-6">
            <div className="relative group">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setTimeout(() => setIsInputFocused(false), 200)} // Delay to allow clicking items
                  className="pl-4 pr-10 py-2 rounded-full bg-gray-100 border-transparent focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 w-40 focus:w-64 transition-all duration-300 outline-none text-sm"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary">
                  <FiSearch size={18} />
                </button>
              </form>

              {/* Live Search Dropdown */}
                <AnimatePresence>
                    {isInputFocused && searchQuery.length > 2 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute top-full right-0 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 mt-2 overflow-hidden z-[60]"
                        >
                            {isLoadingSearch ? (
                                <div className="p-4 text-center text-gray-400 text-sm">Searching...</div>
                            ) : searchResults?.length > 0 ? (
                                <ul>
                                    {searchResults.map((product) => (
                                        <li key={product._id}>
                                            <Link 
                                                href={`/product/${product._id}`}
                                                className="flex items-center gap-4 p-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                                            >
                                                <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden relative flex-shrink-0">
                                                    <Image 
                                                        src={product.images?.[0] || "/placeholder.jpg"} 
                                                        alt={product.name} 
                                                        fill 
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-bold text-gray-900 truncate">{product.name}</h4>
                                                    <p className="text-xs text-primary font-bold">{settings?.currency} {product.price}</p>
                                                </div>
                                            </Link>
                                        </li>
                                    ))}
                                    <li>
                                        <Link 
                                            href={`/shop?search=${encodeURIComponent(searchQuery)}`}
                                            className="block text-center py-3 text-xs font-bold text-primary hover:bg-gray-50 transition-colors uppercase tracking-wider"
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


            {/* User Actions */}
            
             {/* Notification Bell (Only if user is logged in) */}
             {user && <NotificationBell className={iconColor} />}

             <Link href="/wishlist" className="relative group">
               <FiHeart size={22} className={`${iconColor} ${hoverColor} transition-colors`} />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold shadow-sm">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link href="/cart" className="relative group">
              <FiShoppingBag size={22} className="text-gray-600 group-hover:text-primary transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>
            
            {user ? (
              <div className="relative group">
                <Link href={user.role === 'admin' ? '/admin' : '/account'} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border border-gray-200">
                    <FiUser size={16} className="text-gray-600" />
                  </div>
                </Link>
                <div className="absolute top-full right-0 pt-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right">
                    <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-2 w-48 overflow-hidden">
                        <div className="px-4 py-3 border-b border-gray-100 mb-2">
                            <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        <Link href="/account" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary rounded-lg transition-colors">
                            <FiGrid size={14} /> Dashboard
                        </Link>
                        <Link href="/account/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary rounded-lg transition-colors">
                            <FiUser size={14} /> Profile
                        </Link>
                        <Link href="/wishlist" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary rounded-lg transition-colors">
                            <FiHeart size={14} /> Wishlist
                        </Link>
                        <button onClick={logout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors text-left mt-1">
                            <FiLogOut size={14} /> Logout
                        </button>
                    </div>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setAuthModalOpen(true, "login")}
                className="px-6 py-2.5 rounded-full bg-gray-900 text-white text-sm font-bold hover:bg-primary transition-colors shadow-lg shadow-gray-900/10 active:scale-95"
              >
                Login
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          {/* Mobile Actions */}
          <div className="flex lg:hidden items-center gap-5">
            <button
                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                className="w-10 h-10 flex items-center justify-center text-gray-900"
            >
                <FiSearch size={22} className={iconColor} />
            </button>

            <Link href="/cart" className="relative">
              <FiShoppingBag size={24} className={iconColor} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>

            <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="w-10 h-10 flex items-center justify-center text-gray-900"
            >
                <FiMenu size={28} className={iconColor} />
            </button>
          </div>
        </div>

        {/* Mobile Search Bar Overlay */}
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
                                className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-gray-900"
                            />
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            <button 
                                type="button" 
                                onClick={() => setIsMobileSearchOpen(false)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 p-1"
                            >
                                <FiX size={18} />
                            </button>
                        </form>

                        {/* Mobile Live Results */}
                        {searchQuery.length > 2 && (
                             <div className="mt-4 max-h-[60vh] overflow-y-auto">
                                {isLoadingSearch ? (
                                    <div className="text-center text-gray-500 py-4">Searching...</div>
                                ) : searchResults?.length > 0 ? (
                                    <ul className="space-y-2">
                                        {searchResults.map((product) => (
                                            <li key={product._id}>
                                                <Link 
                                                    href={`/product/${product._id}`}
                                                    onClick={() => setIsMobileSearchOpen(false)}
                                                    className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
                                                >
                                                    <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 relative">
                                                        <Image 
                                                            src={product.images?.[0] || "/placeholder.jpg"} 
                                                            alt={product.name} 
                                                            fill 
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold text-gray-900 truncate">{product.name}</p>
                                                        <p className="text-xs text-primary font-bold">{settings?.currency} {product.price}</p>
                                                    </div>
                                                </Link>
                                            </li>
                                        ))}
                                        <li>
                                            <Link 
                                                href={`/shop?search=${encodeURIComponent(searchQuery)}`}
                                                onClick={() => setIsMobileSearchOpen(false)}
                                                className="block text-center py-3 text-xs font-bold text-primary hover:bg-gray-50 transition-colors uppercase tracking-wider border-t border-gray-100 mt-2"
                                            >
                                                View All Results
                                            </Link>
                                        </li>
                                    </ul>
                                ) : (
                                    <div className="text-center text-gray-500 py-4">No products found.</div>
                                )}
                             </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Mega Menu Dropdown */}
        <AnimatePresence>
            {activeCategory && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 w-full bg-white border-t border-gray-100 shadow-xl py-10 z-40"
                    onMouseEnter={() => setActiveCategory(activeCategory)}
                    onMouseLeave={() => setActiveCategory(null)}
                >
                    <div className="container mx-auto px-8">
                        {activeCategory === 'shop' ? (
                             <div className="grid grid-cols-4 gap-8">
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-4 uppercase tracking-wider text-xs">Shop All</h3>
                                    <ul className="space-y-3">
                                        <li><Link href="/shop" className="text-gray-500 hover:text-primary text-sm flex items-center gap-2 group"><span className="w-0 group-hover:w-2 h-0.5 bg-primary transition-all"></span> New Arrivals</Link></li>
                                        <li><Link href="/shop?sort=best_selling" className="text-gray-500 hover:text-primary text-sm flex items-center gap-2 group"><span className="w-0 group-hover:w-2 h-0.5 bg-primary transition-all"></span> Best Sellers</Link></li>
                                        <li><Link href="/shop?sort=price_asc" className="text-gray-500 hover:text-primary text-sm flex items-center gap-2 group"><span className="w-0 group-hover:w-2 h-0.5 bg-primary transition-all"></span> Sale</Link></li>
                                    </ul>
                                </div>
                                {categories?.slice(0, 3).map(cat => (
                                    <div key={cat._id}>
                                         <h3 className="font-bold text-gray-900 mb-4 uppercase tracking-wider text-xs">{cat.name}</h3>
                                         <ul className="space-y-3">
                                            {cat.children?.length > 0 ? (
                                                cat.children.map(sub => (
                                                    <li key={sub._id}>
                                                        <Link href={`/shop?category=${sub.slug || sub.name}`} className="text-gray-500 hover:text-primary text-sm flex items-center gap-2 group">
                                                            <span className="w-0 group-hover:w-2 h-0.5 bg-primary transition-all"></span> {sub.name}
                                                        </Link>
                                                    </li>
                                                ))
                                            ) : (
                                                <li><Link href={`/shop?category=${cat.slug || cat.name}`} className="text-gray-500 hover:text-primary text-sm flex items-center gap-2 group"><span className="w-0 group-hover:w-2 h-0.5 bg-primary transition-all"></span> View All</Link></li>
                                            )}
                                         </ul>
                                    </div>
                                ))}
                             </div>
                        ) : (
                            <div className="grid grid-cols-4 gap-8">
                                {(() => {
                                    const cat = categories?.find(c => c._id === activeCategory);
                                    if (!cat) return null;
                                    return (
                                        <>
                                            <div className="col-span-1">
                                                <h3 className="font-bold text-gray-900 mb-4 text-lg">{cat.name} collection</h3>
                                                <Link href={`/shop?category=${cat.slug || cat.name}`} className="text-primary font-bold text-sm hover:underline">View All Products</Link>
                                            </div>
                                            <div className="col-span-1">
                                                <h3 className="font-bold text-gray-900 mb-4 uppercase tracking-wider text-xs">Subcategories</h3>
                                                <ul className="space-y-3">
                                                    {cat.children?.map(sub => (
                                                        <li key={sub._id}>
                                                            <Link href={`/shop?category=${sub.slug || sub.name}`} className="text-gray-500 hover:text-primary text-sm flex items-center gap-2 group">
                                                                <span className="w-0 group-hover:w-2 h-0.5 bg-primary transition-all"></span> {sub.name}
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            {/* Could add featured images for category here if available */}
                                        </>
                                    )
                                })()}
                            </div>
                        )}
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
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-full hover:bg-gray-100">
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
                        <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="flex items-center gap-3 text-red-500 p-2 hover:bg-white rounded-lg w-full transition-colors">
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

