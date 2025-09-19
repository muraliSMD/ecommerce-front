"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useCartStore } from "@/store/cartStore";
import { useState, useEffect, useMemo } from "react";
import Breadcrumbs from "@/components/Breadcrumbs";
import ZoomImage from "@/components/ZoomImage";
import toast from "react-hot-toast";

export default function ProductDetailPage() {
  const { id } = useParams();
  const addToCart = useCartStore((state) => state.addToCart);

  const { data: product, isLoading } = useQuery({
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

  // ✅ Update selectedVariant when color or size changes
  useEffect(() => {
    let variant = variants.find(
      (v) => v.color === selectedColor && v.size === selectedSize
    );

    // If size not selected yet, pick the first variant of the color
    if (!variant && selectedColor) {
      variant = variants.find((v) => v.color === selectedColor);
      if (variant) setSelectedSize(variant.size);
    }

    setSelectedVariant(variant || null);
    setSelectedImage(variant?.images?.[0] || product?.images?.[0] || null);
    setQuantity(1);
  }, [selectedColor, selectedSize, variants, product]);

  // Initialize default variant on product load
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

  if (isLoading) return <p className="text-center mt-8">Loading…</p>;
  if (!product) return <p className="text-center mt-8">Product not found</p>;

  const isOutOfStock = !selectedVariant || selectedVariant.stock === 0;
  const stock = selectedVariant?.stock ?? 0;
  const canAdd = !isOutOfStock && quantity > 0 && quantity <= stock;

  const gallery =
    (selectedVariant && selectedVariant.images?.length
      ? selectedVariant.images
      : product.images) || [];

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Products", href: "/products" },
          { label: product.name, href: `/product/${product._id}` },
        ]}
      />

      <div className="max-w-5xl mx-auto p-4 flex flex-col md:flex-row gap-8">
        {/* Images */}
        <div className="flex-1">
          <ZoomImage src={selectedImage} zoomAmount={250} height={450} />

          {/* thumbnails */}
          {/* thumbnails */}
          <div className="flex gap-3 mt-4 flex-wrap">
            {gallery.map((img, i) => {
              const safeImg = img && img.trim() !== "" ? img : null;
              return safeImg ? (
                <img
                  key={i}
                  src={safeImg}
                  alt=""
                  width={70}
                  height={70}
                  className={`w-20 h-20 object-cover rounded-lg cursor-pointer 
          transition-all duration-200
          ${
            selectedImage === safeImg
              ? "shadow-lg scale-105 border-2 border-yellow-400"
              : "hover:shadow-md hover:scale-105 border border-gray-200"
          }`}
                  onClick={() => setSelectedImage(safeImg)}
                />
              ) : null;
            })}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 space-y-4">
          <h1 className="text-3xl font-semibold">{product.name}</h1>

          {isOutOfStock ? (
            <p className="text-red-500 text-xl">Out of Stock</p>
          ) : (
            <p className="text-red-500 text-xl">
              ₹{selectedVariant?.price ?? product.price}
            </p>
          )}

          {selectedVariant && !isOutOfStock && (
            <p className="text-sm text-gray-500">Stock: {stock}</p>
          )}

          {/* Color */}
          {allColors.length > 0 && (
            <div>
              <label className="block mb-1 font-medium">Color</label>
              <div className="flex gap-4 flex-wrap">
                {allColors.map((color) => (
                  <label
                    key={color}
                    className={`flex items-center gap-1 px-2 py-1 rounded border cursor-pointer ${
                      selectedColor === color
                        ? "border-black"
                        : "border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="color"
                      value={color}
                      checked={selectedColor === color}
                      onChange={() => setSelectedColor(color)}
                      className="hidden"
                    />
                    <span>{color}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Size */}
          {allSizes.length > 0 && (
            <div>
              <label className="block mb-1 font-medium">Size / Storage</label>
              <select
                className="border rounded p-2"
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
              >
                <option value="">Select</option>
                {allSizes.map((size) => {
                  const variantForSize = variants.find(
                    (v) => v.color === selectedColor && v.size === size
                  );
                  const disabled = !availableSizesForColor.includes(size);
                  const stockText =
                    variantForSize?.stock === 0 ? " (Out of stock)" : "";
                  return (
                    <option key={size} value={size} disabled={disabled}>
                      {size}
                      {stockText}
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {/* Quantity & Add */}
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={1}
              max={stock}
              value={quantity}
              onChange={(e) =>
                setQuantity(
                  Math.min(Math.max(Number(e.target.value), 1), stock)
                )
              }
              className="border rounded p-2 w-20"
              disabled={isOutOfStock}
            />
            <button
              disabled={!canAdd}
              className={`bg-yellow-600 text-white px-5 py-3 rounded-xl 
                font-medium transition-colors 
                ${
                  !canAdd
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-yellow-700"
                }`}
              onClick={() => {
                addToCart(product, quantity, selectedVariant);
                toast.success("Added to cart!");
                setQuantity(1);
              }}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
