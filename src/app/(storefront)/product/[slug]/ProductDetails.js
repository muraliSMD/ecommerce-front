"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useCartStore } from "@/store/cartStore";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import ZoomImage from "@/components/ZoomImage";
import toast from "react-hot-toast";
import { FiShoppingBag, FiHeart, FiShare2, FiMinus, FiPlus, FiStar, FiPlayCircle } from "react-icons/fi";
import Image from "next/image";
import { useSettingsStore } from "@/store/settingsStore";
import { motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import ReviewsSection from "@/components/ReviewsSection";
import { useWishlistStore } from "@/store/wishlistStore";

export default function ProductDetails({ initialProduct }) {
  const slug = initialProduct?.slug;
  const addToCart = useCartStore((state) => state.addToCart);
  const formatPrice = useSettingsStore((state) => state.formatPrice);
  const { addItem, removeItem, isInWishlist } = useWishlistStore();

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const { data: product, isLoading, refetch } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data } = await api.get(`/products/${slug}`);
      return data;
    },
    initialData: initialProduct,
  });

  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedLength, setSelectedLength] = useState("");
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const variants = useMemo(() => product?.variants || [], [product]);
  const allColors = useMemo(
    () => [...new Set(variants.map((v) => v.color).filter(Boolean))],
    [variants]
  );
  const allSizes = useMemo(
    () => [...new Set(variants.map((v) => v.size).filter(Boolean))],
    [variants]
  );
  const allLengths = useMemo(
    () => [...new Set(variants.map((v) => v.length).filter(Boolean))],
    [variants]
  );

  const availableSizesForColor = useMemo(() => {
    if (!selectedColor) return allSizes;
    return variants.filter((v) => v.color === selectedColor && v.size).map((v) => v.size);
  }, [variants, selectedColor, allSizes]);

  const availableLengthsForColor = useMemo(() => {
    if (!selectedColor) return allLengths;
    return variants.filter((v) => v.color === selectedColor && v.length).map((v) => v.length);
  }, [variants, selectedColor, allLengths]);

  useEffect(() => {
    let variant = variants.find(
      (v) => v.color === selectedColor && (v.size === selectedSize || v.length === selectedLength)
    );

    if (!variant && selectedColor) {
        variant = variants.find(v => v.color === selectedColor);
        if (variant) {
            if (variant.size) {
                setSelectedSize(variant.size);
                setSelectedLength("");
            } else if (variant.length) {
                setSelectedLength(variant.length);
                setSelectedSize("");
            }
        }
    }

    setSelectedVariant(variant || null);
    
    const variantVideos = variant?.videos?.filter(v => typeof v === 'string' && v.trim() !== '') || [];
    const validVideos = variantVideos.length > 0 ? variantVideos : (product?.videos?.filter(v => typeof v === 'string' && v.trim() !== '') || []);
    
    if (validVideos.length > 0) {
        setSelectedMedia({ url: validVideos[0], type: 'video' });
    } else {
        const img = variant?.images?.filter(i => typeof i === 'string' && i.trim() !== '')?.[0] || product?.images?.filter(i => typeof i === 'string' && i.trim() !== '')?.[0] || null;
        if (img) setSelectedMedia({ url: img, type: 'image' });
        else setSelectedMedia(null);
    }
    
    setQuantity(1);
  }, [selectedColor, selectedSize, selectedLength, variants, product]);

  useEffect(() => {
    if (variants.length) {
      const colorParam = searchParams.get('color');
      const sizeParam = searchParams.get('size');
      const lengthParam = searchParams.get('length');

      // 1. Prioritize URL parameters
      if (colorParam && allColors.includes(colorParam)) {
        setSelectedColor(colorParam);
        if (sizeParam && variants.some(v => v.color === colorParam && v.size === sizeParam)) {
            setSelectedSize(sizeParam);
            setSelectedLength("");
        } else if (lengthParam && variants.some(v => v.color === colorParam && v.length === lengthParam)) {
            setSelectedLength(lengthParam);
            setSelectedSize("");
        }
      } 
      // 2. Fallback to first variant if no VALID URL parameters
      else {
        setSelectedColor(variants[0].color);
        if (variants[0].size) setSelectedSize(variants[0].size);
        if (variants[0].length) setSelectedLength(variants[0].length);
      }

      setSelectedVariant(variants[0]);
      
      const variantVideos = variants[0].videos?.filter(v => typeof v === 'string' && v.trim() !== '') || [];
      const validVideos = variantVideos.length > 0 ? variantVideos : (product?.videos?.filter(v => typeof v === 'string' && v.trim() !== '') || []);
      
      if (validVideos.length > 0) {
          setSelectedMedia({ url: validVideos[0], type: 'video' });
      } else {
          const img = variants[0].images?.filter(i => typeof i === 'string' && i.trim() !== '')?.[0] || product?.images?.filter(i => typeof i === 'string' && i.trim() !== '')?.[0] || null;
          if (img) setSelectedMedia({ url: img, type: 'image' });
      }
    } else {
      const validVideos = product?.videos?.filter(v => typeof v === 'string' && v.trim() !== '') || [];
      if (validVideos.length > 0) {
          setSelectedMedia({ url: validVideos[0], type: 'video' });
      } else if (product?.images?.filter(i => typeof i === 'string' && i.trim() !== '')?.length) {
          setSelectedMedia({ url: product.images.filter(i => typeof i === 'string' && i.trim() !== '')[0], type: 'image' });
      }
    }
  }, [product, variants, allColors]); // Remove searchParams from dependencies to avoid loop if using router.replace

  // No need for separate mount effect if merged above

  // Update URL params when selections change
  useEffect(() => {
    if (!mounted) return;

    const params = new URLSearchParams(searchParams.toString());
    
    if (selectedColor) params.set('color', selectedColor);
    else params.delete('color');

    if (selectedSize) {
      params.set('size', selectedSize);
      params.delete('length');
    } else if (selectedLength) {
      params.set('length', selectedLength);
      params.delete('size');
    } else {
      params.delete('size');
      params.delete('length');
    }

    const queryString = params.toString();
    const newPath = queryString ? `${pathname}?${queryString}` : pathname;
    
    // Use replace to avoid polluting history on every click, or push if you want it trackable
    router.replace(newPath, { scroll: false });
  }, [selectedColor, selectedSize, selectedLength, pathname, router, mounted]);

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    
    // Always copy to clipboard as requested
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    } catch (err) {
      console.error('Failed to copy: ', err);
    }

    if (navigator.share) {
      try {
        const shareText = `Check out ${product.name}${selectedColor ? ` in ${selectedColor}` : ''}${selectedSize ? ` (Size: ${selectedSize})` : ''}${selectedLength ? ` (Length: ${selectedLength})` : ''}!`;
        await navigator.share({
          title: product.name,
          text: shareText,
          url: url,
        });
      } catch (error) {
        if (error.name !== "AbortError") {
          // Already copied above
        }
      }
    }
  };

  if (isLoading && !product) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
    </div>
  );
  if (!product) return <p className="text-center mt-20 text-2xl font-display">Product not found</p>;

  const hasVariants = variants.length > 0;
  const isOutOfStock = hasVariants 
    ? (!selectedVariant || selectedVariant.stock === 0)
    : (product.stock === 0);
  
  const stock = hasVariants ? (selectedVariant?.stock ?? 0) : (product.stock ?? 0);
  const canAdd = !isOutOfStock && quantity > 0 && quantity <= stock;

  const validVariantVideos = selectedVariant && selectedVariant.videos?.filter(v => typeof v === 'string' && v.trim() !== '');
  const variantHasVideos = validVariantVideos && validVariantVideos.length > 0;
  
  const gallery = [
    ...(variantHasVideos 
      ? validVariantVideos.map(v => ({ url: v, type: 'video' }))
      : (product.videos?.filter(v => typeof v === 'string' && v.trim() !== '').map(v => ({ url: v, type: 'video' })) || [])),
    ...((selectedVariant && selectedVariant.images?.filter(i => typeof i === 'string' && i.trim() !== '').length > 0
      ? selectedVariant.images.filter(i => typeof i === 'string' && i.trim() !== '')
      : product.images?.filter(i => typeof i === 'string' && i.trim() !== '')) || []).map(img => ({ url: img, type: 'image' }))
  ];

  return (
    <main className="bg-surface min-h-screen pb-8 md:pb-12 pt-24 md:pt-28">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mb-4">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Store", href: "/shop" },
              { label: product.category?.name || "Shop", href: `/shop?category=${product.category?.slug || product.category?.name || ""}` },
              { label: product.name, href: `/product/${slug}` },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
          {/* Gallery Sidebar */}
          <div className="lg:col-span-1 hidden lg:flex flex-col gap-4">
            {gallery.map((media, i) => (
              <button
                key={i}
                onClick={() => setSelectedMedia(media)}
                className={`aspect-square bg-gray-50 rounded-2xl overflow-hidden border-2 transition-all relative flex items-center justify-center ${
                  selectedMedia?.url === media.url ? "border-primary shadow-lg scale-105" : "border-transparent hover:border-gray-200"
                }`}
              >
                {media.type === 'video' ? (
                   <>
                      <video src={media.url} className="object-cover w-full h-full opacity-60" />
                      <FiPlayCircle className="absolute text-4xl text-gray-900 bg-white/50 backdrop-blur-sm rounded-full p-1" />
                   </>
                ) : (
                  <Image 
                      src={media.url} 
                      alt="" 
                      fill
                      className="object-cover" 
                  />
                )}
              </button>
            ))}
          </div>

          {/* Main Image */}
          <div className="lg:col-span-6 relative">
            <motion.div 
              key={selectedMedia?.url}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="aspect-square rounded-[2rem] md:rounded-[3rem] overflow-hidden bg-white shadow-xl shadow-black/5 relative border border-gray-100 flex items-center justify-center"
            >
              {selectedMedia?.type === 'video' ? (
                  <video 
                    src={selectedMedia.url} 
                    autoPlay 
                    muted 
                    loop 
                    playsInline
                    className="w-full h-full object-cover" 
                  />
              ) : (
                  <ZoomImage src={selectedMedia?.url} zoomAmount={250} height={600} />
              )}
            </motion.div>
            
            {/* Mobile Thumbnails */}
            <div className="flex lg:hidden gap-3 mt-4 overflow-x-auto pb-2 px-2 snap-x snap-mandatory">
              {gallery.map((media, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedMedia(media)}
                  className={`flex-shrink-0 w-20 h-20 bg-gray-50 rounded-2xl overflow-hidden relative border-2 snap-start flex items-center justify-center ${
                    selectedMedia?.url === media.url ? "border-primary" : "border-transparent"
                  }`}
                >
                  {media.type === 'video' ? (
                     <>
                        <video src={media.url} className="object-cover w-full h-full opacity-60" />
                        <FiPlayCircle className="absolute text-2xl text-gray-900 bg-white/50 backdrop-blur-sm rounded-full p-1" />
                     </>
                  ) : (
                    <Image 
                        src={media.url} 
                        alt="" 
                        fill
                        className="object-cover" 
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-5 space-y-6 md:space-y-8"
          >
            <div className="space-y-4">
              <span className="text-primary font-bold tracking-widest uppercase text-sm">
                {product.category?.name || (typeof product.category === 'string' && !product.category.match(/^[0-9a-fA-F]{24}$/) ? product.category : "New Arrival")}
              </span>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-gray-900 leading-tight">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-4 mt-2">
                {(() => {
                  const currentPrice = selectedVariant?.price ?? product.price;
                  const mrp = selectedVariant?.mrp ?? product.mrp;
                  const discount = selectedVariant?.discount ?? product.discount ?? (mrp > currentPrice ? Math.round(((mrp - currentPrice) / mrp) * 100) : 0);
                  
                  return (
                    <>
                      {discount > 0 && (
                        <div className="flex items-center gap-1 text-[#008a48] font-bold text-2xl">
                          <span className="text-3xl">↓</span>
                          <span>{discount}%</span>
                        </div>
                      )}
                      {Number(mrp) > Number(currentPrice) && (
                        <p className="text-2xl text-gray-400 line-through">
                          {mounted ? formatPrice(mrp).replace(/[^\d,.₹$]/g, '') : mrp}
                        </p>
                      )}
                      <p className="text-3xl font-bold text-gray-900">
                        {mounted ? formatPrice(currentPrice) : currentPrice}
                      </p>
                    </>
                  );
                })()}
                
                {stock < 10 && stock > 0 && (
                  <span className="bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1.5 rounded-full animate-pulse">
                    Only {stock} left!
                  </span>
                )}
              </div>

              {/* Star Rating Summary */}
              <div className="flex items-center gap-2 mt-4">
                <div className="flex gap-1 text-yellow-400 text-sm">
                  {[...Array(5)].map((_, i) => (
                     <FiStar key={i} className={i < Math.round(product.averageRating || 0) ? "fill-current" : "text-gray-300"} />
                  ))}
                </div>
                <span className="text-sm text-gray-500 font-medium">({product.averageRating?.toFixed(1) || 0})</span>
                <button 
                  onClick={() => {
                      const tabsElement = document.getElementById("product-tabs");
                      if (tabsElement) {
                          tabsElement.scrollIntoView({ behavior: "smooth", block: "start" });
                          window.dispatchEvent(new CustomEvent('switchTab', { detail: 'reviews' }));
                      }
                  }}
                  className="text-sm text-primary font-bold hover:underline"
                >
                  {product.numReviews || 0} Reviews
                </button>
              </div>
            </div>

            <div className="h-px bg-gray-200 w-full" />

            {/* Colors */}
            {allColors.length > 0 && (
              <div className="space-y-4">
                <p className="font-bold text-sm uppercase tracking-wider text-gray-400">
                  Colour: <span className="text-gray-900 ml-2">{selectedColor}</span>
                </p>
                <div className="flex gap-3 flex-wrap">
                  {allColors.map((color) => {
                    const colorVariantWithImage = variants.find(v => v.color === color && v.images && v.images.length > 0);
                    const colorImage = colorVariantWithImage ? colorVariantWithImage.images[0] : null;
                    
                    return (
                      <button
                        key={color}
                        title={color}
                        onClick={() => setSelectedColor(color)}
                        className={`transition-all font-medium text-sm md:text-base relative flex items-center justify-center overflow-hidden ${
                          colorImage ? 'w-14 h-18 md:w-16 md:h-20 rounded-xl' : 'px-4 py-2 md:px-6 md:py-2.5 rounded-full'
                        } ${
                          selectedColor === color
                            ? "border-2 border-primary ring-2 ring-primary/20 shadow-lg"
                            : "border-2 border-gray-100 bg-white text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        {colorImage ? (
                          <>
                            <Image src={colorImage} alt={color} fill className="object-cover" />
                            <div className={`absolute inset-0 bg-black/20 ${selectedColor === color ? 'bg-black/0' : 'group-hover:bg-black/10'} transition-colors`} />
                          </>
                        ) : (
                          <span className={`${selectedColor === color ? "text-primary font-bold" : ""}`}>{color}</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Sizes */}
            {allSizes.length > 0 && (
              <div className="space-y-4">
                <p className="font-bold text-sm uppercase tracking-wider text-gray-400">Size</p>
                <div className="flex gap-2.5 flex-wrap">
                  {allSizes.map((size) => {
                    const disabled = !availableSizesForColor.includes(size);
                    return (
                      <button
                        key={size}
                        disabled={disabled}
                        onClick={() => { setSelectedSize(size); setSelectedLength(""); }}
                        className={`min-w-[50px] h-12 rounded-xl md:rounded-2xl border-2 transition-all flex items-center justify-center font-bold text-sm md:text-base ${
                          disabled ? "opacity-20 cursor-not-allowed border-gray-100" :
                          selectedSize === size
                            ? "border-primary bg-primary text-white shadow-lg shadow-primary/20"
                            : "border-gray-100 bg-white text-gray-600 hover:border-gray-200"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Lengths */}
            {allLengths.length > 0 && (
              <div className="space-y-4">
                <p className="font-bold text-sm uppercase tracking-wider text-gray-400">Length</p>
                <div className="flex gap-2.5 flex-wrap">
                  {allLengths.map((length) => {
                    const disabled = !availableLengthsForColor.includes(length);
                    return (
                      <button
                        key={length}
                        disabled={disabled}
                        onClick={() => { setSelectedLength(length); setSelectedSize(""); }}
                        className={`min-w-[50px] h-12 rounded-xl md:rounded-2xl border-2 transition-all flex items-center justify-center font-bold text-sm md:text-base ${
                          disabled ? "opacity-20 cursor-not-allowed border-gray-100" :
                          selectedLength === length
                            ? "border-primary bg-primary text-white shadow-lg shadow-primary/20"
                            : "border-gray-100 bg-white text-gray-600 hover:border-gray-200"
                        }`}
                      >
                        {length}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity and Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <div className="flex items-center justify-between sm:justify-start bg-white border border-gray-100 rounded-2xl p-2 shadow-sm">
                <button 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-primary transition-colors hover:bg-gray-50 rounded-lg"
                  disabled={isOutOfStock}
                >
                  <FiMinus />
                </button>
                <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                <button 
                  onClick={() => setQuantity(q => Math.min(stock, q + 1))}
                  className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-primary transition-colors hover:bg-gray-50 rounded-lg"
                  disabled={isOutOfStock || quantity >= stock}
                >
                  <FiPlus />
                </button>
              </div>

              <button
                disabled={!canAdd}
                onClick={() => {
                  addToCart(product, quantity, selectedVariant);
                  toast.success("Added to GRABSZY Cart!");
                  setQuantity(1);
                }}
                className={`flex-grow flex items-center justify-center gap-3 py-4 md:py-5 rounded-2xl font-bold text-white transition-all active:scale-95 shadow-xl ${
                  !canAdd 
                    ? "bg-gray-200 cursor-not-allowed" 
                    : "bg-primary hover:bg-secondary shadow-primary/20"
                }`}
              >
                <FiShoppingBag size={20} />
                {isOutOfStock ? "Out of Stock" : "Add to Cart"}
              </button>

              <button 
                onClick={() => {
                   if (isInWishlist(product._id)) {
                      removeItem(product._id);
                      toast.success("Removed from Wishlist");
                   } else {
                      addItem(product);
                      toast.success("Added to Wishlist");
                   }
                }}
                className={`w-14 h-14 md:w-[68px] md:h-auto flex-shrink-0 flex items-center justify-center border-2 rounded-2xl transition-all ${
                    isInWishlist(product._id) 
                    ? "border-red-100 bg-red-50 text-red-500" 
                    : "border-gray-100 text-gray-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50/50"
                }`}
                title="Wishlist"
              >
                <FiHeart size={24} className={isInWishlist(product._id) ? "fill-current" : ""} />
              </button>

              <button 
                onClick={handleShare}
                className="w-14 h-14 md:w-[68px] md:h-auto flex-shrink-0 flex items-center justify-center border-2 rounded-2xl transition-all border-gray-100 text-gray-400 hover:text-primary hover:border-primary/30 hover:bg-primary/5"
                title="Share Product"
              >
                <FiShare2 size={24} />
              </button>
            </div>
          </motion.div>
        </div>
        
        <div className="mt-10 md:mt-16">
            <ProductTabs product={product} refetch={refetch} />
        </div>

        <div className="mt-10 md:mt-16">
            <RelatedProducts categoryId={product.category?._id || product.category} currentProductId={product._id} />
        </div>
      </div>
    </main>
  );
}

export function ProductTabs({ product, refetch }) {
    const [activeTab, setActiveTab] = useState("description");

    useEffect(() => {
        const handleSwitchTab = (e) => setActiveTab(e.detail);
        window.addEventListener('switchTab', handleSwitchTab);
        return () => window.removeEventListener('switchTab', handleSwitchTab);
    }, []);

    const tabs = [
        { id: "description", label: "Description" },
        { id: "reviews", label: `Reviews (${product.numReviews || 0})` },
        { id: "manufacturer", label: "Manufacturer Info" },
    ];

    return (
        <motion.div 
            id="product-tabs"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-black/5 border border-gray-100"
        >
            <div className="flex gap-8 border-b border-gray-100 mb-8 overflow-x-auto pb-4 md:pb-0">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`font-bold text-lg pb-4 border-b-2 transition-all whitespace-nowrap ${
                            activeTab === tab.id 
                            ? "text-primary border-primary" 
                            : "text-gray-400 border-transparent hover:text-gray-600"
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="min-h-[200px] pt-4">
                {activeTab === "description" && (
                     <div 
                        className="prose prose-lg max-w-none text-gray-500 prose-headings:font-display prose-a:text-primary [&_*]:break-words [&_*]:whitespace-normal"
                        dangerouslySetInnerHTML={{ __html: product.description }}
                     />
                )}
                {activeTab === "reviews" && (
                    <ReviewsSection product={product} refetch={refetch} />
                )}
                {activeTab === "manufacturer" && (
                    <div className="prose prose-lg max-w-none text-gray-500 prose-headings:font-display prose-a:text-primary [&_*]:break-words [&_*]:whitespace-normal">
                        {product.manufacturerInfo ? (
                            <div dangerouslySetInnerHTML={{ __html: product.manufacturerInfo }} />
                        ) : (
                            <p className="italic text-gray-400">No manufacturer information available.</p>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
}

export function RelatedProducts({ categoryId, currentProductId }) {
    const { addToCart } = useCartStore();
    
    const { data: relatedProducts, isLoading } = useQuery({
        queryKey: ['related-products', categoryId, currentProductId],
        queryFn: async () => {
            if (!categoryId) return [];
            const { data } = await api.get(`/products/related?category=${categoryId}&exclude=${currentProductId}`);
            return data;
        },
        enabled: !!categoryId
    });

    if (isLoading || !relatedProducts?.length) return null;

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
        >
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-8 animate-fade-in-up">Related Products</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                {relatedProducts.map(product => (
                    <ProductCard 
                        key={product._id} 
                        product={product}
                        onAddToCart={(p, q, v) => {
                             addToCart(p, q, v);
                             toast.success("Added to cart");
                        }}
                    />
                ))}
            </div>
        </motion.section>
    );
}
