"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useCartStore } from "@/store/cartStore";
import { useState, useEffect, useMemo } from "react";
import Breadcrumbs from "@/components/Breadcrumbs";
import ZoomImage from "@/components/ZoomImage";
import toast from "react-hot-toast";
import { FiShoppingBag, FiHeart, FiShare2, FiMinus, FiPlus } from "react-icons/fi";
import Image from "next/image";
import { useSettingsStore } from "@/store/settingsStore";
import { motion } from "framer-motion";
import ReviewsSection from "@/components/ReviewsSection";
import { useWishlistStore } from "@/store/wishlistStore";

export default function ProductDetailPage() {
  const { id } = useParams();
  const addToCart = useCartStore((state) => state.addToCart);
  const formatPrice = useSettingsStore((state) => state.formatPrice);
  const { addItem, removeItem, isInWishlist } = useWishlistStore();

  const { data: product, isLoading, refetch } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data } = await api.get(`/products/${id}`);
      return data;
    },
  });

  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);

  const variants = useMemo(() => product?.variants || [], [product]);
  const allColors = useMemo(
    () => [...new Set(variants.map((v) => v.color).filter(Boolean))],
    [variants]
  );
  const allSizes = useMemo(
    () => [...new Set(variants.map((v) => v.size).filter(Boolean))],
    [variants]
  );

  const availableSizesForColor = useMemo(() => {
    if (!selectedColor) return allSizes;
    return variants.filter((v) => v.color === selectedColor).map((v) => v.size);
  }, [variants, selectedColor, allSizes]);

  useEffect(() => {
    let variant = variants.find(
      (v) => v.color === selectedColor && v.size === selectedSize
    );

    if (!variant && selectedColor) {
      variant = variants.find((v) => v.color === selectedColor);
      if (variant) setSelectedSize(variant.size);
    }

    setSelectedVariant(variant || null);
    setSelectedImage(variant?.images?.[0] || product?.images?.[0] || null);
    setQuantity(1);
  }, [selectedColor, selectedSize, variants, product]);

  useEffect(() => {
    if (variants.length) {
      setSelectedColor(variants[0].color);
      setSelectedSize(variants[0].size);
      setSelectedVariant(variants[0]);
      setSelectedImage(variants[0].images?.[0] || product?.images?.[0] || null);
    } else if (product?.images?.length) {
      setSelectedImage(product.images[0]);
    }
  }, [product, variants]);

  // Update Browser Tab Title
  useEffect(() => {
    if (product?.name) {
      document.title = `${product.name} | Grabszy`;
    }
  }, [product]);

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
    </div>
  );
  if (!product) return <p className="text-center mt-20 text-2xl font-display">Product not found</p>;

  const isOutOfStock = !selectedVariant || selectedVariant.stock === 0;
  const stock = selectedVariant?.stock ?? 0;
  const canAdd = !isOutOfStock && quantity > 0 && quantity <= stock;

  const gallery =
    (selectedVariant && selectedVariant.images?.length
      ? selectedVariant.images
      : product.images) || [];

  return (
    <main className="bg-surface min-h-screen pb-20 pt-32">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mb-6">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Store", href: "/" },
              { label: product.name, href: `/product/${product._id}` },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Gallery Sidebar */}
          <div className="lg:col-span-1 hidden lg:flex flex-col gap-4">
            {gallery.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(img)}
                className={`aspect-square rounded-2xl overflow-hidden border-2 transition-all relative ${
                  selectedImage === img ? "border-primary shadow-lg scale-105" : "border-transparent hover:border-gray-200"
                }`}
              >
                <Image 
                    src={img} 
                    alt="" 
                    fill
                    className="object-cover" 
                />
              </button>
            ))}
          </div>

          {/* Main Image */}
          <div className="lg:col-span-6 relative">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="aspect-square md:aspect-auto md:h-[600px] rounded-[2rem] md:rounded-[3rem] overflow-hidden bg-white shadow-2xl shadow-black/5 relative"
            >
              <ZoomImage src={selectedImage} zoomAmount={250} height={600} />
            </motion.div>
            
            {/* Mobile Thumbnails */}
            <div className="flex lg:hidden gap-3 mt-4 overflow-x-auto pb-2 px-2 snap-x snap-mandatory">
              {gallery.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className={`flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden relative border-2 snap-start ${
                    selectedImage === img ? "border-primary" : "border-transparent"
                  }`}
                >
                  <Image 
                    src={img} 
                    alt="" 
                    fill
                    className="object-cover" 
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="lg:col-span-5 space-y-6 md:space-y-8">
            <div className="space-y-4">
              <span className="text-primary font-bold tracking-widest uppercase text-sm">
                {product.category?.name || (typeof product.category === 'string' && !product.category.match(/^[0-9a-fA-F]{24}$/) ? product.category : "New Arrival")}
              </span>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-gray-900 leading-tight">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-6">
                <p className="text-3xl font-bold text-gray-900">
                  {formatPrice(selectedVariant?.price ?? product.price)}
                </p>
                {stock < 10 && stock > 0 && (
                  <span className="bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1.5 rounded-full animate-pulse">
                    Only {stock} left!
                  </span>
                )}
              </div>
            </div>

            <p className="text-gray-500 leading-relaxed text-base md:text-lg">
              {product.description || "The ultimate statement piece for your wardrobe. Crafted with precision and style in mind."}
            </p>

            <div className="h-px bg-gray-200 w-full" />

            {/* Colors */}
            {allColors.length > 0 && (
              <div className="space-y-4">
                <p className="font-bold text-sm uppercase tracking-wider text-gray-400">Color</p>
                <div className="flex gap-3 flex-wrap">
                  {allColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 md:px-6 md:py-2.5 rounded-full border-2 transition-all font-medium text-sm md:text-base ${
                        selectedColor === color
                          ? "border-primary bg-primary text-white shadow-lg shadow-primary/20"
                          : "border-gray-100 bg-white text-gray-600 hover:border-gray-200"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
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
                        onClick={() => setSelectedSize(size)}
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
              >
                <FiHeart size={24} className={isInWishlist(product._id) ? "fill-current" : ""} />
              </button>
            </div>
            
            <div className="flex items-center gap-6 pt-4">
              <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-primary transition-colors font-medium">
                <FiShare2 /> Share
              </button>
              <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-primary transition-colors font-medium underline underline-offset-4 decoration-primary/30">
                Size Guide
              </button>
            </div>
          </div>
        </div>
        <div className="mt-16 md:mt-24">
        <div className="mt-16 md:mt-24">
          <ReviewsSection product={product} refetch={refetch} />
        </div>
        </div>
      </div>
    </main>
  );
}

