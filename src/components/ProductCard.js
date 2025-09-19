"use client";

import Link from "next/link";
import Image from "next/image";

export default function ProductCard({ product, onAddToCart }) {
  const hasVariants = product.variants && product.variants.length > 0;

  return (
    <div className="p-4 bg-white rounded-2xl shadow hover:shadow-lg transistion-shadow duration-300">
      <Image
        src={product.images?.[0]}
        alt={product.name.toString()}
        width={400}
        height={192}
        className="rounded-xl w-full h-48 object-cover cursor-pointer"
      />
      <h3 className="text-lg font-semibold mt-3">{product.name}</h3>
      {product.description && (
        <p className="text-grey-500">{product.description}</p>
      )}
      {hasVariants ? (
        <Link href={`/product/${product._id}`}>
          <button className="mt-4 w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transistion-colors duration-300">
            Buy Options
          </button>
        </Link>
      ) : (
        <button
          className="mt-3 w-full bg-black text-white p-2 rounded-xl"
          onClick={() => onAddToCart(product)}
        >
          Add to Cart
        </button>
      )}
    </div>
  );
}
