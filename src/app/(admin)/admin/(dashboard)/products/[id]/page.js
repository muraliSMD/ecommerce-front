"use client";

import { use, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { 
  FiArrowLeft, 
  FiEdit2, 
  FiTag, 
  FiDollarSign, 
  FiGrid,
  FiBox,
  FiInfo,
  FiImage,
  FiVideo,
  FiGlobe,
  FiPlayCircle
} from "react-icons/fi";
import Link from "next/link";
import Image from "next/image";
import { SectionLoader } from "@/components/Loader";
import { useSettingsStore } from "@/store/settingsStore";

export default function ProductDetailsAdmin({ params }) {
  const { id } = use(params);
  const formatPrice = useSettingsStore((state) => state.formatPrice);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ["admin-product", id],
    queryFn: async () => {
      const { data } = await api.get(`/products/${id}`);
      return data;
    },
  });

  if (isLoading) return <SectionLoader className="min-h-[60vh]" />;
  if (error || !product) return (
    <div className="text-center py-20">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h2>
      <Link href="/admin/products" className="text-primary font-bold hover:underline flex items-center justify-center gap-2">
        <FiArrowLeft /> Back to products
      </Link>
    </div>
  );

  const totalStock = product.variants?.length > 0 
    ? product.variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0)
    : (product.stock || 0);

  const variantImages = product.variants?.flatMap(v => v.images || []) || [];
  
  const gallery = [
    ...(product.videos?.map(v => ({ url: v, type: 'video' })) || []),
    ...(product.images?.map(img => ({ url: img, type: 'image' })) || []),
    ...(variantImages.map(img => ({ url: img, type: 'image' })))
  ];

  const activeMedia = gallery[activeMediaIndex] || { url: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2070", type: 'image' };

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link 
          href="/admin/products"
          className="flex items-center gap-2 text-gray-500 hover:text-primary font-bold transition-colors"
        >
          <FiArrowLeft /> Back to products
        </Link>
        <Link 
          href={`/admin/products/edit/${product._id}`}
          className="bg-primary hover:bg-secondary text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/20 active:scale-95"
        >
          <FiEdit2 /> Edit Product
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Media Gallery */}
        <div className="lg:col-span-5 space-y-4">
          <div className="aspect-square bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-xl shadow-black/5 relative flex items-center justify-center">
            {activeMedia.type === 'video' ? (
                <video 
                  src={activeMedia.url}
                  autoPlay 
                  muted 
                  loop 
                  playsInline
                  className="w-full h-full object-contain bg-black"
                />
            ) : (
                <Image 
                  src={activeMedia.url} 
                  alt={product.name}
                  fill
                  className="object-cover"
                />
            )}
          </div>
          <div className="grid grid-cols-4 gap-4">
            {gallery.map((media, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveMediaIndex(idx)}
                className={`aspect-square bg-gray-50 rounded-2xl overflow-hidden border-2 transition-all relative flex items-center justify-center ${activeMediaIndex === idx ? 'border-primary ring-4 ring-primary/10 scale-105' : 'border-transparent hover:border-gray-200'}`}
              >
                {media.type === 'video' ? (
                   <>
                      <video src={media.url} className="w-full h-full object-cover opacity-60" />
                      <FiPlayCircle className="absolute text-3xl text-gray-900 bg-white/50 backdrop-blur-sm rounded-full p-1" />
                   </>
                ) : (
                   <Image src={media.url} alt="" width={100} height={100} className="w-full h-full object-cover" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Key Details */}
        <div className="lg:col-span-7 space-y-8">
          <section className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-black/5 border border-gray-100">
            <div className="flex items-start justify-between mb-6">
              <div>
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-bold uppercase tracking-widest mb-2 inline-block">
                  {product.category?.name || product.category || "General"}
                </span>
                <h1 className="text-3xl font-display font-bold text-gray-900">{product.name}</h1>
                <p className="text-gray-400 font-mono text-sm mt-1">ID: {product._id}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-display font-bold text-primary">{formatPrice(product.price)}</p>
                <p className="text-sm text-gray-400 mt-1">Base Price</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-y border-gray-50">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Stock</p>
                <p className={`text-xl font-bold ${totalStock > 0 ? 'text-gray-900' : 'text-red-500'}`}>{totalStock}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">SKU</p>
                <p className="text-lg font-bold text-gray-900">{product.sku || "N/A"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Variants</p>
                <p className="text-lg font-bold text-gray-900">{product.variants?.length || 0}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</p>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${totalStock > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                   {totalStock > 0 ? 'IN STOCK' : 'OUT OF STOCK'}
                </span>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <FiInfo className="text-primary" /> Description
              </h3>
              <div 
                className="prose prose-sm max-w-none text-gray-600 break-words overflow-hidden"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>
            
            {product.manufacturerInfo && (
              <div className="mt-8">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <FiBox className="text-primary" /> Manufacturer Details
                </h3>
                <div 
                  className="prose prose-sm max-w-none text-gray-600 break-words overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: product.manufacturerInfo }}
                />
              </div>
            )}
          </section>

          {/* Variants Table */}
          <section className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-black/5 border border-gray-100">
            <h2 className="text-xl font-display font-bold mb-6 flex items-center gap-3">
              <FiGrid className="text-primary" /> Variants Inventory
            </h2>
            <div className="overflow-hidden rounded-2xl border border-gray-100">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <th className="px-6 py-4">Color</th>
                    <th className="px-6 py-4">Size/Length</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {product.variants?.map((v, i) => (
                    <tr key={i} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: v.color?.toLowerCase() || 'gray' }}></div>
                          <span className="font-bold text-gray-900">{v.color}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-600">
                        {v.size && `Size: ${v.size}`}
                        {v.size && v.length && " / "}
                        {v.length && `Length: ${v.length}`}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">{formatPrice(v.price)}</td>
                      <td className="px-6 py-4">
                        <span className={`font-bold ${v.stock > 0 ? 'text-gray-900' : 'text-red-500'}`}>{v.stock}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* SEO Preview */}
          <section className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-black/5 border border-gray-100">
            <h2 className="text-xl font-display font-bold mb-6 flex items-center gap-3">
              <FiGlobe className="text-primary" /> SEO & Visibility
            </h2>
            <div className="space-y-4">
              <div className="bg-surface rounded-2xl p-6 border border-gray-100">
                <p className="text-blue-600 text-lg font-medium hover:underline cursor-pointer">{product.seo?.metaTitle || product.name}</p>
                <p className="text-green-700 text-sm truncate">.../product/{product.slug || product._id}</p>
                <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                  {product.seo?.metaDescription || "No custom description set. Search engines will use the default description."}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Keywords</p>
                  <p className="text-sm font-medium text-gray-900">{product.seo?.metaKeywords || "None"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Slug</p>
                  <p className="text-sm font-mono text-primary font-bold">{product.slug || "N/A"}</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
