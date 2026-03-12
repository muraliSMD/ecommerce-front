"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useCartStore } from "@/store/cartStore";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import ZoomImage from "@/components/ZoomImage";
import toast from "react-hot-toast";
import { FiShoppingBag, FiHeart, FiShare2, FiMinus, FiPlus, FiStar, FiPlayCircle, FiChevronLeft, FiChevronRight, FiArrowRight } from "react-icons/fi";
import Image from "next/image";
import { getColorValue, getClosestColorName } from "@/lib/colors";
import { useSettingsStore } from "@/store/settingsStore";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import ReviewsSection from "@/components/ReviewsSection";
import { useWishlistStore } from "@/store/wishlistStore";
import VariantSlider from "@/components/VariantSlider";


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
  const [selectedAge, setSelectedAge] = useState("");
  const [selectedWithBlouse, setSelectedWithBlouse] = useState("");
  const [selectedBlouseMeter, setSelectedBlouseMeter] = useState("");
  const [selectedSilkType, setSelectedSilkType] = useState("");
  const [selectedNSize, setSelectedNSize] = useState("");
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const variants = useMemo(() => product?.variants || [], [product]);
  const isSaree = product.category?.name?.toLowerCase().includes("saree") || 
                  (typeof product.category === 'string' && product.category.toLowerCase().includes("saree"));

  const allColors = useMemo(() => {
    const variantColors = variants.map((v) => v.color).filter(Boolean);
    if (product?.color) {
      return [...new Set([...variantColors, product.color])];
    }
    return [...new Set(variantColors)];
  }, [variants, product]);

  const allSizes = useMemo(() => {
    const variantSizes = variants.map((v) => v.size).filter(Boolean);
    if (product?.size) {
      return [...new Set([...variantSizes, product.size])];
    }
    return [...new Set(variantSizes)];
  }, [variants, product]);

  const allLengths = useMemo(() => {
    const variantLengths = variants.map((v) => v.length).filter(Boolean);
    if (product?.length) {
      return [...new Set([...variantLengths, product.length])];
    }
    return [...new Set(variantLengths)];
  }, [variants, product]);

  const allAges = useMemo(() => {
    const variantAges = variants.map((v) => v.age).filter(Boolean);
    if (product?.age) {
      return [...new Set([...variantAges, product.age])];
    }
    return [...new Set(variantAges)];
  }, [variants, product]);

  const allBlouseOptions = useMemo(() => {
    const variantOptions = variants.map((v) => v.withBlouse).filter(Boolean);
    if (product?.withBlouse) {
      return [...new Set([...variantOptions, product.withBlouse])];
    }
    return [...new Set(variantOptions)];
  }, [variants, product]);

  const allBlouseMeters = useMemo(() => {
    const variantMeters = variants.map((v) => v.blouseMeter).filter(Boolean);
    if (product?.blouseMeter) {
      return [...new Set([...variantMeters, product.blouseMeter])];
    }
    return [...new Set(variantMeters)];
  }, [variants, product]);

  const allSilkTypes = useMemo(() => {
    const variantTypes = variants.map((v) => v.silkType).filter(Boolean);
    if (product?.silkType) {
      return [...new Set([...variantTypes, product.silkType])];
    }
    return [...new Set(variantTypes)];
  }, [variants, product]);
  
  const allNSizes = useMemo(() => {
    const variantNSizes = variants.map((v) => v.nSize).filter(Boolean);
    if (product?.nSize) {
      return [...new Set([...variantNSizes, product.nSize])];
    }
    return [...new Set(variantNSizes)];
  }, [variants, product]);

  const availableSizesForColor = useMemo(() => {
    if (!selectedColor) return allSizes;
    return variants.filter((v) => v.color === selectedColor && v.size).map((v) => v.size);
  }, [variants, selectedColor, allSizes]);

  const availableLengthsForColor = useMemo(() => {
    if (!selectedColor) return allLengths;
    return variants.filter((v) => v.color === selectedColor && v.length).map((v) => v.length);
  }, [variants, selectedColor, allLengths]);

  const availableAgesForColor = useMemo(() => {
    return variants.filter((v) => v.color === selectedColor && v.age).map((v) => v.age);
  }, [variants, selectedColor]);

  const availableBlouseOptionsForColor = useMemo(() => {
    if (!selectedColor) return allBlouseOptions;
    return variants.filter((v) => v.color === selectedColor && v.withBlouse).map((v) => v.withBlouse);
  }, [variants, selectedColor, allBlouseOptions]);

  const availableBlouseMetersForColor = useMemo(() => {
    if (!selectedColor) return allBlouseMeters;
    return variants.filter((v) => v.color === selectedColor && v.blouseMeter).map((v) => v.blouseMeter);
  }, [variants, selectedColor, allBlouseMeters]);

  const availableSilkTypesForColor = useMemo(() => {
    return variants.filter((v) => v.color === selectedColor && v.silkType).map((v) => v.silkType);
  }, [variants, selectedColor, allSilkTypes]);

  const availableNSizesForColor = useMemo(() => {
    if (!selectedColor) return allNSizes;
    return variants.filter((v) => v.color === selectedColor && v.nSize).map((v) => v.nSize);
  }, [variants, selectedColor, allNSizes]);


  // Main Effect: Derive variant and media from selection states
  useEffect(() => {
    let variant = variants.find((v) => {
      const matchColor = !selectedColor || v.color === selectedColor;
      const matchSize = !selectedSize || v.size === selectedSize;
      const matchLength = !selectedLength || v.length === selectedLength;
      const matchAge = !selectedAge || v.age === selectedAge;
      const matchBlouse = !selectedWithBlouse || v.withBlouse === selectedWithBlouse;
      const matchBlouseMeter = !selectedBlouseMeter || v.blouseMeter === selectedBlouseMeter;
      const matchSilk = !selectedSilkType || v.silkType === selectedSilkType;
      const matchNSize = !selectedNSize || v.nSize === selectedNSize;
      
      return matchColor && matchSize && matchLength && matchAge && matchBlouse && matchBlouseMeter && matchSilk && matchNSize;
    });

    // If no exact match but we have a color, find ANY variant with that color as fallback
    if (!variant && selectedColor) {
        variant = variants.find(v => v.color === selectedColor);
    }
        if (variant) {
            if (variant.size && selectedSize !== variant.size) {
                setSelectedSize(variant.size);
                setSelectedLength("");
            } else if (variant.length && selectedLength !== variant.length) {
                setSelectedLength(variant.length);
                setSelectedSize("");
                setSelectedAge("");
            } else if (variant.age && selectedAge !== variant.age) {
                setSelectedAge(variant.age);
                setSelectedSize("");
            } else if (variant.nSize && selectedNSize !== variant.nSize) {
                setSelectedNSize(variant.nSize);
        }
    }

    setSelectedVariant(variant || null);
    
    // Update media based on new variant
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
  }, [selectedColor, selectedSize, selectedLength, selectedAge, selectedWithBlouse, selectedBlouseMeter, selectedSilkType, selectedNSize, variants, product]);

  // Track Recent Views
  useEffect(() => {
    if (!product?._id) return;
    
    const trackView = () => {
        const recentViews = JSON.parse(localStorage.getItem('recent_views') || '[]');
        const updatedViews = [
            { id: product._id, name: product.name, slug: product.slug, image: product.images?.[0] },
            ...recentViews.filter(v => v.id !== product._id)
        ].slice(0, 10);
        localStorage.setItem('recent_views', JSON.stringify(updatedViews));
    };

    trackView();
  }, [product]);

  // Initialization Effect: Run only once or when variants/params change on MOUNT
  useEffect(() => {
    if (!variants.length || mounted) return;

    const colorParam = searchParams.get('color');
    const sizeParam = searchParams.get('size');
    const lengthParam = searchParams.get('length');
    const ageParam = searchParams.get('age');
    const blouseParam = searchParams.get('blouse');
    const blouseMeterParam = searchParams.get('blouseMeter');
    const silkParam = searchParams.get('silk');
    const nSizeParam = searchParams.get('nSize');

    if (variants.length > 0) {
      if (colorParam && allColors.includes(colorParam)) {
        setSelectedColor(colorParam);
        if (sizeParam && variants.some(v => v.color === colorParam && v.size === sizeParam)) {
            setSelectedSize(sizeParam);
            setSelectedLength("");
            setSelectedAge("");
            setSelectedNSize("");
        } else if (lengthParam && variants.some(v => v.color === colorParam && v.length === lengthParam)) {
            setSelectedLength(lengthParam);
            setSelectedSize("");
            setSelectedAge("");
            setSelectedNSize("");
        } else if (ageParam && variants.some(v => v.color === colorParam && v.age === ageParam)) {
            setSelectedAge(ageParam);
            setSelectedSize("");
            setSelectedLength("");
            setSelectedNSize("");
        } else if (nSizeParam && variants.some(v => v.color === colorParam && v.nSize === nSizeParam)) {
            setSelectedNSize(nSizeParam);
            setSelectedSize("");
            setSelectedLength("");
            setSelectedAge("");
        }
        
        if (blouseParam && allBlouseOptions.includes(blouseParam)) {
            setSelectedWithBlouse(blouseParam);
        }
        if (blouseMeterParam && allBlouseMeters.includes(blouseMeterParam)) {
            setSelectedBlouseMeter(blouseMeterParam);
        }
        if (silkParam && allSilkTypes.includes(silkParam)) {
            setSelectedSilkType(silkParam);
        }
      } else {
        // Default to first variant
        setSelectedColor(variants[0].color);
        if (variants[0].size) setSelectedSize(variants[0].size);
        if (variants[0].length) setSelectedLength(variants[0].length);
        if (variants[0].age) setSelectedAge(variants[0].age);
        if (variants[0].nSize) setSelectedNSize(variants[0].nSize);
        if (variants[0].withBlouse) setSelectedWithBlouse(variants[0].withBlouse);
        if (variants[0].blouseMeter) setSelectedBlouseMeter(variants[0].blouseMeter);
        if (variants[0].silkType) setSelectedSilkType(variants[0].silkType);
      }
    } else if (product && !product.hasVariants) {
      // Single product attribute selection
      if (product.color) setSelectedColor(product.color);
      if (product.size) setSelectedSize(product.size);
      if (product.length) setSelectedLength(product.length);
      if (product.age) setSelectedAge(product.age);
      if (product.nSize) setSelectedNSize(product.nSize);
    }
  }, [variants, allColors, allBlouseOptions, allBlouseMeters, allSilkTypes, allNSizes, searchParams, mounted, product]);

  // Fallback for products without variants
  useEffect(() => {
    if (variants.length || !product) return;
    
    const validVideos = product.videos?.filter(v => typeof v === 'string' && v.trim() !== '') || [];
    if (validVideos.length > 0) {
        setSelectedMedia({ url: validVideos[0], type: 'video' });
    } else if (product.images?.filter(i => typeof i === 'string' && i.trim() !== '')?.length) {
        setSelectedMedia({ url: product.images.filter(i => typeof i === 'string' && i.trim() !== '')[0], type: 'image' });
    }
  }, [product, variants]);

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
      params.delete('nSize');
    } else if (selectedLength) {
      params.set('length', selectedLength);
      params.delete('size');
      params.delete('nSize');
    } else if (selectedNSize) {
      params.set('nSize', selectedNSize);
      params.delete('size');
      params.delete('length');
    } else {
      params.delete('size');
      params.delete('length');
      params.delete('nSize');
    }

    const queryString = params.toString();
    const newPath = queryString ? `${pathname}?${queryString}` : pathname;
    
    // Use replace to avoid polluting history on every click, or push if you want it trackable
    router.replace(newPath, { scroll: false });
  }, [selectedColor, selectedSize, selectedLength, selectedNSize, pathname, router, mounted, searchParams]);

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
        const shareText = `Check out ${product.name}${selectedColor ? ` in ${resolveColorName(selectedColor)}` : ''}${selectedSize ? ` (Size: ${selectedSize})` : ''}${selectedLength ? ` (Length: ${selectedLength})` : ''}!`;
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

  const resolveColorName = (color) => {
    if (!color) return "";
    if (color.startsWith("#")) {
      const name = getClosestColorName(color);
      return name || color;
    }
    return color;
  };

  return (
    <main className="bg-surface min-h-screen pb-8 md:pb-12 pt-24 md:pt-28">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mb-4 lg:mb-6 px-4 md:px-0">
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
            className="lg:col-span-5 flex flex-col gap-6 md:gap-8"
          >
              <div className="flex justify-between items-start order-1">
                <span className="text-primary font-bold tracking-widest uppercase text-sm">
                  {product.category?.name || (typeof product.category === 'string' && !product.category.match(/^[0-9a-fA-F]{24}$/) ? product.category : "New Arrival")}
                </span>
                
              </div>

              <h1 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-gray-900 leading-tight order-2">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-4 order-3">
                {(() => {
                  const currentPrice = selectedVariant?.price ?? product.price;
                  const mrp = selectedVariant?.mrp ?? product.mrp;
                  const discount = selectedVariant?.discount ?? product.discount ?? (mrp > currentPrice ? Math.round(((mrp - currentPrice) / mrp) * 100) : 0);
                  
                  return (
                    <>
                      {discount > 0 && (
                        <div className="flex items-center gap-1 text-[#008a48] font-bold text-lg md:text-2xl">
                          <span className="text-xl md:text-3xl">↓</span>
                          <span>{discount}%</span>
                        </div>
                      )}
                      {Number(mrp) > Number(currentPrice) && (
                        <p className="text-lg md:text-2xl text-gray-400 line-through">
                          {mounted ? formatPrice(mrp).replace(/[^\d,.₹$]/g, '') : mrp}
                        </p>
                      )}
                      <p className="text-xl md:text-3xl font-bold text-gray-900">
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
              <div className="flex items-center gap-2 order-4">
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
              
              {/* Product Specifications */}
              {(product.color || product.size || product.length || product.age || product.silkType || product.withBlouse || product.blouseMeter) && (
                <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 space-y-3 w-max min-w-[50%] order-9 mt-6 lg:order-5 lg:mt-0">
                  <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">Product Specifications</p>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                    {product.color && (
                      <div className="flex items-center gap-2">
                         <span className="text-sm md:text-base text-gray-500">Color:</span>
                         <span className="font-bold text-gray-900 text-base">{resolveColorName(product.color)}</span>
                      </div>
                    )}
                    {product.size && (
                      <div className="flex items-center gap-2">
                         <span className="text-sm md:text-base text-gray-500">Size:</span>
                         <span className="font-bold text-gray-900 text-base">{product.size}</span>
                      </div>
                    )}
                    {product.length && (
                      <div className="flex items-center gap-2">
                         <span className="text-sm md:text-base text-gray-500">Length:</span>
                         <span className="font-bold text-gray-900 text-base">{product.length}</span>
                      </div>
                    )}
                    {product.age && (
                      <div className="flex items-center gap-2">
                         <span className="text-sm md:text-base text-gray-500">Age:</span>
                         <span className="font-bold text-gray-900 text-base">{product.age}</span>
                      </div>
                    )}
                    {product.silkType && (
                      <div className="flex items-center gap-2">
                         <span className="text-sm md:text-base text-gray-500">Silk:</span>
                         <span className="font-bold text-gray-900 text-base">{product.silkType}</span>
                      </div>
                    )}
                    {product.withBlouse && (
                      <div className="flex items-center gap-2">
                         <span className="text-sm md:text-base text-gray-500">Blouse:</span>
                         <span className="font-bold text-gray-900 text-base">{product.withBlouse}</span>
                      </div>
                    )}
                    {product.blouseMeter && (
                      <div className="flex items-center gap-2">
                         <span className="text-sm md:text-base text-gray-500">Blouse Length:</span>
                         <span className="font-bold text-gray-900 text-base">{product.blouseMeter}</span>
                      </div>
                    )}
                     {product.nSize && (
                       <div className="flex items-center gap-2">
                          <span className="text-sm md:text-base text-gray-500">N-Size:</span>
                          <span className="font-bold text-gray-900 text-base">{product.nSize}</span>
                       </div>
                     )}
                  </div>
                </div>
              )}

            <div className="h-px bg-gray-200 w-full order-10" />

            {/* Colors */}
            {allColors.length > 0 && (
              <VariantSlider 
                title={<span>Colour: <span className="text-gray-900 ml-2">{resolveColorName(selectedColor)}</span></span>}
                orderClass="order-5 lg:order-6 mt-4 md:mt-0"
              >
                {allColors.map((color) => {
                  const colorVariantWithImage = variants.find(v => v.color === color && v.images && v.images.length > 0);
                  const colorImage = colorVariantWithImage ? colorVariantWithImage.images[0] : null;
                  
                  return (
                    <button
                      key={color}
                      title={color}
                      onClick={() => setSelectedColor(color)}
                      className={`transition-all flex-shrink-0 font-medium text-sm md:text-base relative flex items-center justify-center overflow-hidden snap-start m-[2px] ${
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
                         <span className={`${selectedColor === color ? "text-primary font-bold" : ""}`}>{resolveColorName(color)}</span>
                       )}
                    </button>
                  )
                })}
              </VariantSlider>
            )}

            {/* Attributes Slider for Mobile & Web */}
            <VariantSlider orderClass="order-6 mt-2 md:mt-0 gap-4 lg:gap-2">
              {/* Sizes */}
              {allSizes.length > 0 && (
                <div className="flex-shrink-0 min-w-max snap-start">
                  <VariantSlider title={<span className="ml-2">Size</span>} compact={true}>
                    {allSizes.map((size) => {
                      const disabled = !availableSizesForColor.includes(size);
                      return (
                        <button
                          key={size}
                          disabled={disabled}
                          onClick={() => { setSelectedSize(size); setSelectedLength(""); }}
                          className={`min-w-[50px] h-11 flex-shrink-0 rounded-xl border-2 transition-all flex items-center justify-center font-bold text-base snap-start m-[2px] ${
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
                  </VariantSlider>
                </div>
              )}

              {/* Lengths */}
              {allLengths.length > 0 && (
                <div className="flex-shrink-0 min-w-max snap-start">
                  <VariantSlider title={<span className="ml-2">Length</span>} compact={true}>
                    {allLengths.map((length) => {
                      const disabled = !availableLengthsForColor.includes(length);
                      return (
                        <button
                          key={length}
                          disabled={disabled}
                          onClick={() => { setSelectedLength(length); setSelectedSize(""); setSelectedAge(""); }}
                          className={`min-w-[50px] h-11 flex-shrink-0 rounded-xl border-2 transition-all flex items-center justify-center font-bold text-base snap-start m-[2px] ${
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
                  </VariantSlider>
                </div>
              )}

              {/* Ages */}
              {allAges.length > 0 && (
                <div className="flex-shrink-0 min-w-max snap-start">
                  <VariantSlider title={<span className="ml-2">Age Group</span>} compact={true}>
                    {allAges.map((age) => {
                      const disabled = !availableAgesForColor.includes(age);
                      return (
                        <button
                          key={age}
                          disabled={disabled}
                          onClick={() => { setSelectedAge(age); setSelectedSize(""); setSelectedLength(""); }}
                          className={`min-w-[100px] h-11 flex-shrink-0 rounded-xl border-2 transition-all flex items-center justify-center font-bold text-base snap-start m-[2px] ${
                            disabled ? "opacity-20 cursor-not-allowed border-gray-100" :
                            selectedAge === age
                              ? "border-primary bg-primary text-white shadow-lg shadow-primary/20"
                              : "border-gray-100 bg-white text-gray-600 hover:border-gray-200"
                          }`}
                        >
                          {age}
                        </button>
                      );
                    })}
                  </VariantSlider>
                </div>
              )}

              {/* Numerical Sizes */}
              {allNSizes.length > 0 && (
                <div className="flex-shrink-0 min-w-max snap-start">
                  <VariantSlider title={<span className="ml-2">N-Size</span>} compact={true}>
                    {allNSizes.map((nSize) => {
                      const disabled = !availableNSizesForColor.includes(nSize);
                      return (
                        <button
                          key={nSize}
                          disabled={disabled}
                          onClick={() => { setSelectedNSize(nSize); setSelectedSize(""); setSelectedLength(""); setSelectedAge(""); }}
                          className={`min-w-[60px] h-11 flex-shrink-0 rounded-xl border-2 transition-all flex items-center justify-center font-bold text-base snap-start m-[2px] ${
                            disabled ? "opacity-20 cursor-not-allowed border-gray-100" :
                            selectedNSize === nSize
                              ? "border-primary bg-primary text-white shadow-lg shadow-primary/20"
                              : "border-gray-100 bg-white text-gray-600 hover:border-gray-200"
                          }`}
                        >
                          {nSize}
                        </button>
                      );
                    })}
                  </VariantSlider>
                </div>
              )}

              {/* Silk Types */}
              {isSaree && allSilkTypes.length > 0 && (
                <div className="flex-shrink-0 min-w-max snap-start">
                  <VariantSlider title={<span className="ml-2">Silk Type</span>} compact={true}>
                    {allSilkTypes.map((type) => {
                      const disabled = !availableSilkTypesForColor.includes(type);
                      return (
                        <button
                          key={type}
                          disabled={disabled}
                          onClick={() => setSelectedSilkType(type)}
                          className={`min-w-[120px] h-11 flex-shrink-0 rounded-xl border-2 transition-all flex items-center justify-center font-bold text-base snap-start m-[2px] ${
                            disabled ? "opacity-20 cursor-not-allowed border-gray-100" :
                            selectedSilkType === type
                              ? "border-primary bg-primary text-white shadow-lg shadow-primary/20"
                              : "border-gray-100 bg-white text-gray-600 hover:border-gray-200"
                          }`}
                        >
                          {type}
                        </button>
                      );
                    })}
                  </VariantSlider>
                </div>
              )}

              {/* Blouse Options */}
              {isSaree && allBlouseOptions.length > 0 && (
                <div className="flex-shrink-0 min-w-max snap-start">
                  <VariantSlider title={<span className="ml-2">Blouse</span>} compact={true}>
                    {allBlouseOptions.map((opt) => {
                      const disabled = !availableBlouseOptionsForColor.includes(opt);
                      return (
                        <button
                          key={opt}
                          disabled={disabled}
                          onClick={() => setSelectedWithBlouse(opt)}
                          className={`min-w-[120px] h-11 flex-shrink-0 rounded-xl border-2 transition-all flex items-center justify-center font-bold text-base snap-start m-[2px] ${
                            disabled ? "opacity-20 cursor-not-allowed border-gray-100" :
                            selectedWithBlouse === opt
                              ? "border-primary bg-primary text-white shadow-lg shadow-primary/20"
                              : "border-gray-100 bg-white text-gray-600 hover:border-gray-200"
                          }`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </VariantSlider>
                </div>
              )}

              {/* Blouse Meters */}
              {isSaree && allBlouseMeters.length > 0 && (
                <div className="flex-shrink-0 min-w-max snap-start">
                  <VariantSlider title={<span className="ml-2">Blouse Length</span>} compact={true}>
                    {allBlouseMeters.map((meter) => {
                      const disabled = !availableBlouseMetersForColor.includes(meter);
                      return (
                        <button
                          key={meter}
                          disabled={disabled}
                          onClick={() => setSelectedBlouseMeter(meter)}
                          className={`min-w-[100px] h-11 flex-shrink-0 rounded-xl border-2 transition-all flex items-center justify-center font-bold text-base snap-start ${
                            disabled ? "opacity-20 cursor-not-allowed border-gray-100" :
                            selectedBlouseMeter === meter
                              ? "border-primary bg-primary text-white shadow-lg shadow-primary/20"
                              : "border-gray-100 bg-white text-gray-600 hover:border-gray-200"
                          }`}
                        >
                          {meter}
                        </button>
                      );
                    })}
                  </VariantSlider>
                </div>
              )}
            </VariantSlider>

            <div className="h-px bg-gray-200 w-full order-7 mt-6" />

            {/* Quantity and Actions */}
            {/* Quantity and Actions */}
            <div className="flex flex-col gap-6 pt-4 order-8">
              {/* Utility Section: Quantity, Wishlist, Share */}
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-white border border-gray-100 rounded-2xl p-1.5 shadow-sm">
                  <button 
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-primary transition-colors hover:bg-gray-50 rounded-lg"
                    disabled={isOutOfStock}
                  >
                    <FiMinus />
                  </button>
                  <span className="w-10 text-center font-bold text-lg">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(q => Math.min(stock, q + 1))}
                    className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-primary transition-colors hover:bg-gray-50 rounded-lg"
                    disabled={isOutOfStock || quantity >= stock}
                  >
                    <FiPlus />
                  </button>
                </div>

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
                  className={`w-14 h-14 flex items-center justify-center border-2 rounded-2xl transition-all ${
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
                  className="w-14 h-14 flex items-center justify-center border-2 rounded-2xl transition-all border-gray-100 text-gray-400 hover:text-primary hover:border-primary/30 hover:bg-primary/5"
                  title="Share Product"
                >
                  <FiShare2 size={24} />
                </button>
              </div>

              {/* Purchase Section: Add to Cart & Buy Now */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  disabled={!canAdd}
                  onClick={() => {
                    addToCart(product, quantity, selectedVariant);
                    toast.success("Added to GRABSZY Cart!");
                    setQuantity(1);
                  }}
                  className={`flex-1 flex items-center justify-center gap-3 py-4 md:py-5 rounded-2xl font-bold text-white transition-all active:scale-95 shadow-xl text-base md:text-lg ${
                    !canAdd 
                      ? "bg-gray-200 cursor-not-allowed" 
                      : "bg-primary hover:bg-secondary shadow-primary/20"
                  }`}
                >
                  <FiShoppingBag size={20} />
                  {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                </button>

                <button
                  disabled={!canAdd}
                  onClick={() => {
                    addToCart(product, quantity, selectedVariant);
                    router.push('/checkout');
                  }}
                  className={`flex-1 flex items-center justify-center gap-3 py-4 md:py-5 rounded-2xl font-bold text-white transition-all active:scale-95 shadow-xl text-base md:text-lg ${
                    !canAdd 
                      ? "bg-gray-200 cursor-not-allowed" 
                      : "bg-btn-dark hover:bg-black shadow-gray-900/20"
                  }`}
                >
                  <FiArrowRight size={20} />
                  {isOutOfStock ? "Out of Stock" : "Buy Now"}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {quantity > 3 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3 text-blue-700 mt-4 overflow-hidden"
                >
                  <FiPlayCircle className="flex-shrink-0 mt-1 rotate-90" />
                  <p className="text-sm font-medium leading-relaxed">
                    <strong>Bulk Order:</strong> Orders over 3 units require custom manufacturing before being dispatched to your address.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
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
