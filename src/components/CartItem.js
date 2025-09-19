"use client";
import Image from "next/image";

export default function CartItem({ item, onRemove, onIncrement, onDecrement }) {
  const price = Number(item.variant?.price ?? item.product.price ?? 0);
  const image = item.variant?.images?.[0] || item.product.images?.[0] || "/placeholder.png";

  return (
    <div className="flex justify-between items-center border-b py-3">
      <div className="flex gap-4 items-center">
        <Image src={image} alt={item.product.name || "product name"} width={64} height={64} className="rounded-lg object-cover" />
        <div>
          <h3 className="font-semibold">{item.product.name}</h3>
          {item.variant && <p className="text-xs text-gray-400">{item.variant.color} {item.variant.size}</p>}
          <p className="text-gray-500 text-sm">₹{price}</p>
        </div>
      </div>

      <div className="flex flex-col items-end">
        <div className="flex items-center gap-2 mb-2">
          <button onClick={onDecrement} className="px-2 py-1 bg-gray-200 rounded-md">-</button>
          <span className="font-semibold">{item.quantity}</span>
          <button onClick={onIncrement} className="px-2 py-1 bg-gray-200 rounded-md">+</button>
        </div>
        <button onClick={onRemove} className="text-red-500 text-sm hover:underline">Remove</button>
      </div>
    </div>
  );
}
