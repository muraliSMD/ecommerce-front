"use client";

import HeroSlider from "@/components/HeroSlider";
import Header from "@/components/Header";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/hooks/useCart";
import Footer from "@/components/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function Home() {
  const { data: products, isLoading, isError } = useProducts();
  const { addToCart } = useCart();

  return (
    <>
      <HeroSlider />

      <section className="container mx-auto py-10">
           <Breadcrumbs />
        <h2 className="text-3xl font-bold text-center mb-8">
          Our Jewellery Collection
        </h2>

        {isLoading ? (
          <p className="text-center text-gray-500">Loading products...</p>
        ) : isError ? (
          <p className="text-center text-red-500">Failed to load products.</p>
        ) : products?.length === 0 ? (
          <p className="text-center text-gray-500">No products added yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products?.map((p) => (
              <ProductCard
                key={p._id}
                product={p}
                onAddToCart={
                  (prod) => addToCart({ product: prod, quantity: 1 }) // ✅ Just call it directly
                }
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
