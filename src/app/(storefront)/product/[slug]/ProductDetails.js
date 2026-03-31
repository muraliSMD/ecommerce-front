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

const resolveColorName = (color) => {
  if (!color) return "";
  const closest = getClosestColorName(color);
  if (closest && closest.toLowerCase() !== color.toLowerCase()) {
    return `${closest} (${color})`;
  }
  return color;
};

export default function ProductDetails({ initialProduct }) {
  const slug = initialProduct?.slug;
  const imageRefs = useRef([]);
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
  }, [variants, selectedColor]);

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

    // If no exact match but we have a color, find ANY variant with that color as initial fallback for media/price
    if (!variant && selectedColor) {
        variant = variants.find(v => v.color === selectedColor);
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
    if (!mounted) {
      if (!variants.length && product?.hasVariants) return;
    } else {
      return; 
    }

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
      params.delete('age');
    } else if (selectedLength) {
      params.set('length', selectedLength);
      params.delete('size');
      params.delete('nSize');
      params.delete('age');
    } else if (selectedAge) {
      params.set('age', selectedAge);
      params.delete('size');
      params.delete('length');
      params.delete('nSize');
    } else if (selectedNSize) {
      params.set('nSize', selectedNSize);
      params.delete('size');
      params.delete('length');
      params.delete('age');
    } else {
      params.delete('size');
      params.delete('length');
      params.delete('nSize');
      params.delete('age');
    }

    if (selectedWithBlouse) params.set('blouse', selectedWithBlouse);
    else params.delete('blouse');

    if (selectedBlouseMeter) params.set('blouseMeter', selectedBlouseMeter);
    else params.delete('blouseMeter');

    if (selectedSilkType) params.set('silk', selectedSilkType);
    else params.delete('silk');

    const queryString = params.toString();
    const newPath = queryString ? `${pathname}?${queryString}` : pathname;
    
    // Use replace to avoid polluting history on every click
    // Only replace if url actually changed
    if (queryString !== searchParams.toString()) {
        router.replace(newPath, { scroll: false });
    }
  }, [selectedColor, selectedSize, selectedLength, selectedAge, selectedNSize, selectedWithBlouse, selectedBlouseMeter, selectedSilkType, pathname, router, mounted, searchParams]);

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
        const shareText = `Check out ${product.name}${selectedColor ? ` in ${resolveColorName(selectedColor)}` : ''}${selectedSize ? ` (Size: ${selectedSize})` : ''}${selectedLength ? ` (Length: ${selectedLength})` : ''}${selectedNSize ? ` (N-Size: ${selectedNSize})` : ''}!`;
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
    ? (!selectedVariant || (selectedVariant.stock === 0 && !selectedVariant.isPreBook && !product.isPreBook))
    : (product.stock === 0 && !product.isPreBook);
  
  const isPreBook = product.isPreBook || (hasVariants ? (selectedVariant?.isPreBook ?? false) : false);
  const stock = hasVariants ? (selectedVariant?.stock ?? 0) : (product.stock ?? 0);
  const canAdd = (!isOutOfStock || isPreBook) && quantity > 0 && (isPreBook || quantity <= stock);

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


  const scrollToImage = (index) => {
    imageRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <main className="bg-bg-main min-h-screen pb-8 md:pb-12">
      <div className="container mx-auto px-4 md:px-8">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
          {/* Left Column: Gallery (Premium Vertical Stack with Thumbnails) */}
          <div className="lg:col-span-7 flex flex-row gap-4 md:gap-6 relative">
            {/* Sticky Thumbnail Strip (Desktop only for this specific look) */}
            <div className="hidden lg:flex flex-col gap-4 sticky top-28 self-start w-16 xl:w-20">
              {gallery.map((media, i) => (
                <button
                  key={i}
                  onClick={() => scrollToImage(i)}
                  className="aspect-square bg-white rounded-md overflow-hidden border border-border-main hover:border-primary transition-all relative group"
                >
                  <div className="relative w-full h-full opacity-60 group-hover:opacity-100 transition-opacity">
                    {media.type === 'video' ? (
                       <video src={media.url} className="object-cover w-full h-full" />
                    ) : (
                       <Image src={media.url} alt="" fill className="object-cover" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Main Image Stack */}
            <div className="flex-1 space-y-4 md:space-y-6">
              {gallery.map((media, i) => (
                <div 
                  key={i} 
                  ref={el => imageRefs.current[i] = el}
                  className="bg-white rounded-3xl md:rounded-[2.5rem] p-2 md:p-3 shadow-2xl shadow-black/5 border border-border-main relative overflow-hidden group"
                >
                  <div className="aspect-square rounded-2xl md:rounded-[2rem] overflow-hidden bg-bg-surface relative border border-border-main flex items-center justify-center">
                    {media.type === 'video' ? (
                        <video 
                          src={media.url} 
                          autoPlay 
                          muted 
                          loop 
                          playsInline
                          className="w-full h-full object-cover" 
                        />
                    ) : (
                        <ZoomImage src={media.url} zoomAmount={250} height={1000} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Product Details (Sticky) */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-5 flex flex-col gap-6 md:gap-8 lg:sticky lg:top-28 lg:self-start h-fit"
          >
              <div className="flex justify-between items-start order-1 lg:order-1">
                <span className="text-primary font-bold tracking-widest uppercase text-sm">
                  {product.category?.name || (typeof product.category === 'string' && !product.category.match(/^[0-9a-fA-F]{24}$/) ? product.category : "New Arrival")}
                </span>
                
              </div>

              <h1 className="text-2xl md:text-3xl font-display font-bold text-text-main leading-tight capitalize order-3 lg:order-2">
                {product.name.toLowerCase()}
              </h1>
              
              <div className="flex items-center gap-4 order-4 lg:order-4">
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
                        <p className="text-lg md:text-2xl text-text-muted line-through">
                          {mounted ? formatPrice(mrp).replace(/[^\d,.₹$]/g, '') : mrp}
                        </p>
                      )}
                      <p className="text-xl md:text-3xl font-bold text-text-main">
                        {mounted ? formatPrice(currentPrice) : currentPrice}
                      </p>
                    </>
                  );
                })()}
                
                {isPreBook && (
                    <span className="bg-primary/10 text-primary text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest border border-primary/20">
                      Pre-book
                    </span>
                )}
                
                {stock < 10 && stock > 0 && !isPreBook && (
                  <span className="bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1.5 rounded-full animate-pulse">
                    Only {stock} left!
                  </span>
                )}
              </div>
              
              {isPreBook && (
                  <div className="order-8 lg:order-4 bg-primary/5 p-4 rounded-2xl border border-primary/10 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <FiShoppingBag />
                      </div>
                      <div>
                          <p className="text-xs font-bold text-text-muted uppercase">Estimated Shipping</p>
                          <p className="text-sm font-bold text-text-main">
                            {selectedVariant?.preBookDeliveryDate || product.preBookDeliveryDate || "10 Days from order placement"}
                          </p>
                      </div>
                  </div>
              )}

              {/* Star Rating Summary */}
              <div className="flex items-center gap-2 order-5 lg:order-3">
                <div className="flex gap-1 text-yellow-400 text-sm">
                  {[...Array(5)].map((_, i) => (
                     <FiStar key={i} className={i < Math.round(product.averageRating || 0) ? "fill-current" : "text-text-muted/30"} />
                  ))}
                </div>
                <span className="text-sm text-text-muted font-medium">({product.averageRating?.toFixed(1) || 0})</span>
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
                <div className="bg-bg-section/30 dark:bg-bg-section/10 p-4 rounded-2xl border border-border-main space-y-3 w-max min-w-[50%] order-9 mt-6 lg:order-5 lg:mt-0">
                  <p className="text-[12px] font-bold text-text-muted uppercase tracking-widest">Product Specifications</p>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                    {product.color && (
                      <div className="flex items-center gap-2">
                         <span className="text-sm md:text-base text-text-muted">Color:</span>
                         <span className="font-bold text-text-main text-base">{resolveColorName(product.color)}</span>
                      </div>
                    )}
                    {product.size && (
                      <div className="flex items-center gap-2">
                         <span className="text-sm md:text-base text-text-muted">Size:</span>
                         <span className="font-bold text-text-main text-base">{product.size}</span>
                      </div>
                    )}
                    {product.length && (
                      <div className="flex items-center gap-2">
                         <span className="text-sm md:text-base text-text-muted">Length:</span>
                         <span className="font-bold text-text-main text-base">{product.length}</span>
                      </div>
                    )}
                    {product.age && (
                      <div className="flex items-center gap-2">
                         <span className="text-sm md:text-base text-text-muted">Age:</span>
                         <span className="font-bold text-text-main text-base">{product.age}</span>
                      </div>
                    )}
                    {product.silkType && (
                      <div className="flex items-center gap-2">
                         <span className="text-sm md:text-base text-text-muted">Silk:</span>
                         <span className="font-bold text-text-main text-base">{product.silkType}</span>
                      </div>
                    )}
                    {product.withBlouse && (
                      <div className="flex items-center gap-2">
                         <span className="text-sm md:text-base text-text-muted">Blouse:</span>
                         <span className="font-bold text-text-main text-base">{product.withBlouse}</span>
                      </div>
                    )}
                    {product.blouseMeter && (
                      <div className="flex items-center gap-2">
                         <span className="text-sm md:text-base text-text-muted">Blouse Length:</span>
                         <span className="font-bold text-text-main text-base">{product.blouseMeter}</span>
                      </div>
                    )}
                     {product.nSize && (
                       <div className="flex items-center gap-2">
                          <span className="text-sm md:text-base text-text-muted">N-Size:</span>
                          <span className="font-bold text-text-main text-base">{product.nSize}</span>
                       </div>
                     )}
                  </div>
                </div>
              )}

            <div className="h-px bg-border-main w-full order-10 lg:order-8" />

            {/* Colors */}
            {allColors.length > 0 && (
              <VariantSlider 
                title={<span>Colour: <span className="text-text-main ml-2">{resolveColorName(selectedColor)}</span></span>}
                orderClass="order-2 lg:order-6 mt-4 md:mt-0"
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
                          : "border-2 border-border-main bg-bg-surface text-text-muted hover:border-text-muted/30"
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
            <VariantSlider orderClass="order-6 lg:order-7 mt-2 md:mt-0 gap-4 lg:gap-2">
              {/* Sizes */}
              {availableSizesForColor.length > 0 && (
                <div className="flex-shrink-0 min-w-max snap-start">
                  <VariantSlider title={<span className="ml-2">Size</span>} compact={true}>
                    {allSizes.map((size) => {
                      const variantInfo = variants.find(v => v.color === selectedColor && v.size === size);
                      const disabled = !variantInfo;
                      const isOutOfStock = variantInfo && variantInfo.stock <= 0 && !product.isPreBook && !variantInfo.isPreBook;
                      return (
                        <button
                          key={size}
                          disabled={disabled || isOutOfStock}
                          onClick={() => { 
                            setSelectedSize(size); 
                            setSelectedLength("");
                            setSelectedAge("");
                            setSelectedNSize("");
                          }}
                          className={`min-w-[50px] px-4 h-11 flex-shrink-0 rounded-xl border-2 transition-all flex items-center justify-center font-bold text-base snap-start m-[2px] ${
                            disabled ? "hidden" :
                            isOutOfStock ? "opacity-30 cursor-not-allowed border-border-main bg-bg-section/50 text-text-muted/50 decoration-slate-400 line-through" :
                            selectedSize === size
                              ? "border-primary bg-primary text-white shadow-lg shadow-primary/20"
                              : "border-border-main bg-bg-surface text-text-muted hover:border-text-muted/30"
                          }`}
                        >
                          {size} {isOutOfStock && "(Out of Stock)"}
                        </button>
                      );
                    })}
                  </VariantSlider>
                </div>
              )}

              {/* Lengths */}
              {availableLengthsForColor.length > 0 && (
                <div className="flex-shrink-0 min-w-max snap-start">
                  <VariantSlider title={<span className="ml-2">Length</span>} compact={true}>
                    {allLengths.map((length) => {
                      const variantInfo = variants.find(v => v.color === selectedColor && v.length === length);
                      const disabled = !variantInfo;
                      const isOutOfStock = variantInfo && variantInfo.stock <= 0 && !product.isPreBook && !variantInfo.isPreBook;
                      return (
                        <button
                          key={length}
                          disabled={disabled || isOutOfStock}
                          onClick={() => { 
                            setSelectedLength(length); 
                            setSelectedSize("");
                            setSelectedAge("");
                            setSelectedNSize("");
                          }}
                          className={`min-w-[50px] px-4 h-11 flex-shrink-0 rounded-xl border-2 transition-all flex items-center justify-center font-bold text-base snap-start m-[2px] ${
                            disabled ? "hidden" :
                            isOutOfStock ? "opacity-30 cursor-not-allowed border-border-main bg-bg-section/50 text-text-muted/50 decoration-slate-400 line-through" :
                            selectedLength === length
                              ? "border-primary bg-primary text-white shadow-lg shadow-primary/20"
                              : "border-border-main bg-bg-surface text-text-muted hover:border-text-muted/30"
                          }`}
                        >
                          {length} {isOutOfStock && "(Out of Stock)"}
                        </button>
                      );
                    })}
                  </VariantSlider>
                </div>
              )}

              {/* Ages */}
              {availableAgesForColor.length > 0 && (
                <div className="flex-shrink-0 min-w-max snap-start">
                  <VariantSlider title={<span className="ml-2">Age Group</span>} compact={true}>
                    {allAges.map((age) => {
                      const variantInfo = variants.find(v => v.color === selectedColor && v.age === age);
                      const disabled = !variantInfo;
                      const isOutOfStock = variantInfo && variantInfo.stock <= 0 && !product.isPreBook && !variantInfo.isPreBook;
                      return (
                        <button
                          key={age}
                          disabled={disabled || isOutOfStock}
                          onClick={() => { 
                            setSelectedAge(age); 
                            setSelectedSize("");
                            setSelectedLength("");
                            setSelectedNSize("");
                          }}
                          className={`min-w-[100px] px-4 h-11 flex-shrink-0 rounded-xl border-2 transition-all flex items-center justify-center font-bold text-base snap-start m-[2px] ${
                            disabled ? "hidden" :
                            isOutOfStock ? "opacity-30 cursor-not-allowed border-border-main bg-bg-section/50 text-text-muted/50 decoration-slate-400 line-through" :
                            selectedAge === age
                              ? "border-primary bg-primary text-white shadow-lg shadow-primary/20"
                              : "border-border-main bg-bg-surface text-text-muted hover:border-text-muted/30"
                          }`}
                        >
                          {age} {isOutOfStock && "(Out of Stock)"}
                        </button>
                      );
                    })}
                  </VariantSlider>
                </div>
              )}

              {/* Numerical Sizes */}
              {availableNSizesForColor.length > 0 && (
                <div className="flex-shrink-0 min-w-max snap-start">
                  <VariantSlider title={<span className="ml-2">N-Size</span>} compact={true}>
                    {allNSizes.map((nSize) => {
                      const variantInfo = variants.find(v => v.color === selectedColor && v.nSize === nSize);
                      const disabled = !variantInfo;
                      const isOutOfStock = variantInfo && variantInfo.stock <= 0 && !product.isPreBook && !variantInfo.isPreBook;
                      return (
                        <button
                          key={nSize}
                          disabled={disabled || isOutOfStock}
                          onClick={() => { 
                            setSelectedNSize(nSize); 
                            setSelectedSize("");
                            setSelectedLength("");
                            setSelectedAge("");
                          }}
                          className={`min-w-[60px] px-4 h-11 flex-shrink-0 rounded-xl border-2 transition-all flex items-center justify-center font-bold text-base snap-start m-[2px] ${
                            disabled ? "hidden" :
                            isOutOfStock ? "opacity-30 cursor-not-allowed border-border-main bg-bg-section/50 text-text-muted/50 decoration-slate-400 line-through" :
                            selectedNSize === nSize
                              ? "border-primary bg-primary text-white shadow-lg shadow-primary/20"
                              : "border-border-main bg-bg-surface text-text-muted hover:border-text-muted/30"
                          }`}
                        >
                          {nSize} {isOutOfStock && "(Out of Stock)"}
                        </button>
                      );
                    })}
                  </VariantSlider>
                </div>
              )}

              {/* Silk Types */}
              {isSaree && availableSilkTypesForColor.length > 0 && (
                <div className="flex-shrink-0 min-w-max snap-start">
                  <VariantSlider title={<span className="ml-2">Silk Type</span>} compact={true}>
                    {allSilkTypes.map((type) => {
                      const variantInfo = variants.find(v => v.color === selectedColor && v.silkType === type);
                      const disabled = !variantInfo;
                      const isOutOfStock = variantInfo && variantInfo.stock <= 0 && !product.isPreBook && !variantInfo.isPreBook;
                      return (
                        <button
                          key={type}
                          disabled={disabled || isOutOfStock}
                          onClick={() => setSelectedSilkType(type)}
                          className={`min-w-[120px] px-4 h-11 flex-shrink-0 rounded-xl border-2 transition-all flex items-center justify-center font-bold text-base snap-start m-[2px] ${
                            disabled ? "hidden" :
                            isOutOfStock ? "opacity-30 cursor-not-allowed border-border-main bg-bg-section/50 text-text-muted/50 decoration-slate-400 line-through" :
                            selectedSilkType === type
                              ? "border-primary bg-primary text-white shadow-lg shadow-primary/20"
                              : "border-border-main bg-bg-surface text-text-muted hover:border-text-muted/30"
                          }`}
                        >
                          {type} {isOutOfStock && "(Out of Stock)"}
                        </button>
                      );
                    })}
                  </VariantSlider>
                </div>
              )}

              {/* Blouse Options */}
              {isSaree && availableBlouseOptionsForColor.length > 0 && (
                <div className="flex-shrink-0 min-w-max snap-start">
                  <VariantSlider title={<span className="ml-2">Blouse</span>} compact={true}>
                    {allBlouseOptions.map((opt) => {
                      const variantInfo = variants.find(v => v.color === selectedColor && v.withBlouse === opt);
                      const disabled = !variantInfo;
                      const isOutOfStock = variantInfo && variantInfo.stock <= 0 && !product.isPreBook && !variantInfo.isPreBook;
                      return (
                        <button
                          key={opt}
                          disabled={disabled || isOutOfStock}
                          onClick={() => setSelectedWithBlouse(opt)}
                          className={`min-w-[120px] px-4 h-11 flex-shrink-0 rounded-xl border-2 transition-all flex items-center justify-center font-bold text-base snap-start m-[2px] ${
                            disabled ? "hidden" :
                            isOutOfStock ? "opacity-30 cursor-not-allowed border-border-main bg-bg-section/50 text-text-muted/50 decoration-slate-400 line-through" :
                            selectedWithBlouse === opt
                              ? "border-primary bg-primary text-white shadow-lg shadow-primary/20"
                              : "border-border-main bg-bg-surface text-text-muted hover:border-text-muted/30"
                          }`}
                        >
                          {opt} {isOutOfStock && "(Out of Stock)"}
                        </button>
                      );
                    })}
                  </VariantSlider>
                </div>
              )}

              {/* Blouse Meters */}
              {isSaree && availableBlouseMetersForColor.length > 0 && (
                <div className="flex-shrink-0 min-w-max snap-start">
                  <VariantSlider title={<span className="ml-2">Blouse Length</span>} compact={true}>
                    {allBlouseMeters.map((meter) => {
                      const variantInfo = variants.find(v => v.color === selectedColor && v.blouseMeter === meter);
                      const disabled = !variantInfo;
                      const isOutOfStock = variantInfo && variantInfo.stock <= 0 && !product.isPreBook && !variantInfo.isPreBook;
                      return (
                        <button
                          key={meter}
                          disabled={disabled || isOutOfStock}
                          onClick={() => setSelectedBlouseMeter(meter)}
                          className={`min-w-[100px] px-4 h-11 flex-shrink-0 rounded-xl border-2 transition-all flex items-center justify-center font-bold text-base snap-start ${
                            disabled ? "hidden" :
                            isOutOfStock ? "opacity-30 cursor-not-allowed border-border-main bg-bg-section/50 text-text-muted/50 decoration-slate-400 line-through" :
                            selectedBlouseMeter === meter
                              ? "border-primary bg-primary text-white shadow-lg shadow-primary/20"
                              : "border-border-main bg-bg-surface text-text-muted hover:border-text-muted/30"
                          }`}
                        >
                          {meter} {isOutOfStock && "(Out of Stock)"}
                        </button>
                      );
                    })}
                  </VariantSlider>
                </div>
              )}
            </VariantSlider>

            <div className="h-px bg-gray-200 w-full order-7 lg:order-8 mt-6" />

            {/* Quantity and Actions */}
            {/* Quantity and Actions */}
            <div className="flex flex-col gap-6 pt-4 order-11 lg:order-9">
              {/* Utility Section: Quantity, Wishlist, Share */}
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-bg-surface border border-border-main rounded-2xl p-1.5 shadow-sm">
                  <button 
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center text-text-main/60 hover:text-primary transition-colors hover:bg-bg-section rounded-lg"
                    disabled={isOutOfStock}
                  >
                    <FiMinus />
                  </button>
                  <span className="w-10 text-center font-bold text-lg text-text-main">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(q => isPreBook ? q + 1 : Math.min(stock, q + 1))}
                    className="w-10 h-10 flex items-center justify-center text-text-main/60 hover:text-primary transition-colors hover:bg-bg-section rounded-lg"
                    disabled={isOutOfStock && !isPreBook || (!isPreBook && quantity >= stock)}
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
                {(!isPreBook && !isOutOfStock) && (
                  <button
                    disabled={!canAdd}
                    onClick={() => {
                      addToCart(product, quantity, selectedVariant);
                      toast.success("Added to GRABSZY Cart!");
                      setQuantity(1);
                    }}
                    className="flex-1 flex items-center justify-center gap-3 py-4 md:py-5 rounded-2xl font-bold text-white transition-all active:scale-95 shadow-xl text-base md:text-lg bg-primary hover:bg-secondary shadow-primary/20"
                  >
                    <FiShoppingBag size={20} />
                    Add to Cart
                  </button>
                )}

                <button
                  disabled={!canAdd}
                  onClick={() => {
                    addToCart(product, quantity, selectedVariant);
                    router.push(isPreBook ? '/cart' : '/checkout');
                  }}
                  className={`flex-1 flex items-center justify-center gap-3 py-4 md:py-5 rounded-2xl font-bold transition-all active:scale-95 shadow-xl text-base md:text-lg ${
                    !canAdd
                      ? "bg-bg-section/50 cursor-not-allowed text-text-muted/50" 
                      : "bg-btn-dark hover:bg-btn-dark-hover text-btn-text shadow-gray-900/20"
                  }`}
                >
                  <FiArrowRight size={20} />
                  {isOutOfStock ? "Out of Stock" : isPreBook ? "Pre-book Now" : "Buy Now"}
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
            className="bg-bg-surface rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-black/5 border border-border-main"
        >
            <div className="flex gap-8 border-b border-border-main mb-8 overflow-x-auto pb-4 md:pb-0">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`font-bold text-lg pb-4 border-b-2 transition-all whitespace-nowrap ${
                            activeTab === tab.id 
                            ? "text-primary border-primary" 
                            : "text-text-main/50 border-transparent hover:text-text-main"
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="min-h-[200px] pt-4">
                {activeTab === "description" && (
                     <div 
                        className="prose prose-lg dark:prose-invert max-w-none text-text-muted prose-headings:font-display prose-a:text-primary [&_*]:break-words [&_*]:whitespace-normal"
                        dangerouslySetInnerHTML={{ __html: product.description }}
                     />
                )}
                {activeTab === "reviews" && (
                    <ReviewsSection product={product} refetch={refetch} />
                )}
                {activeTab === "manufacturer" && (
                    <div className="prose prose-lg dark:prose-invert max-w-none text-text-muted prose-headings:font-display prose-a:text-primary [&_*]:break-words [&_*]:whitespace-normal">
                        {product.manufacturerInfo ? (
                            <div dangerouslySetInnerHTML={{ __html: product.manufacturerInfo }} />
                        ) : (
                            <p className="italic text-text-muted/50">No manufacturer information available.</p>
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
            <h2 className="text-3xl font-display font-bold text-text-main mb-8 animate-fade-in-up">Related Products</h2>
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
