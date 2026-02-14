"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { 
  FiPlus, 
  FiSearch, 
  FiFilter, 
  FiEdit2, 
  FiTrash2, 
  FiEye, 
  FiMoreVertical 
} from "react-icons/fi";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import ConfirmationModal from "@/components/ConfirmationModal";
import { SectionLoader } from "@/components/Loader";
import { useSettingsStore } from "@/store/settingsStore";

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [productToDelete, setProductToDelete] = useState(null);
  const formatPrice = useSettingsStore((state) => state.formatPrice);

  const { data: products, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data } = await api.get("/products");
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-products"]);
      toast.success("Product deleted successfully");
      setProductToDelete(null);
    },
    onError: () => {
      toast.error("Failed to delete product");
    }
  });

  const getCategoryName = (product) => product.category?.name || product.category || "Uncategorized";

  const filteredProducts = products?.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const categoryName = getCategoryName(p);
    const matchesCategory = filterCategory === "All" || categoryName === filterCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  const categories = ["All", ...new Set(products?.map(p => getCategoryName(p)).filter(c => c !== "Uncategorized") || [])];

  if (isLoading) return <SectionLoader className="min-h-[60vh]" />;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-display font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 mt-2">Manage your catalog and inventory.</p>
        </div>
        <Link 
          href="/admin/products/add"
          className="bg-primary hover:bg-secondary text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 active:scale-95"
        >
          <FiPlus size={20} /> Add New Product
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-grow w-full">
          <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text"
            placeholder="Search products..."
            className="w-full bg-surface border-none focus:ring-2 focus:ring-primary/20 pl-14 pr-6 py-4 rounded-2xl outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-48">
            <FiFilter className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full bg-surface border-none focus:ring-2 focus:ring-primary/20 pl-14 pr-6 py-4 rounded-2xl outline-none appearance-none cursor-pointer"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-black/5 border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface/50 text-gray-400 text-[10px] font-bold uppercase tracking-widest border-b border-gray-100">
                <th className="px-8 py-6">Product</th>
                <th className="px-8 py-6">Category</th>
                <th className="px-8 py-6">Price</th>
                <th className="px-8 py-6">Stock</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProducts.map((product) => (
                <tr key={product._id} className="group hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-surface border border-gray-100 relative">
                        <Image 
                          src={product.images?.[0] || "/placeholder.png"} 
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 group-hover:text-primary transition-colors">{product.name}</p>
                        <p className="text-xs text-gray-400 font-mono">ID: {product._id.slice(-8).toUpperCase()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="px-3 py-1 bg-surface border border-gray-100 rounded-full text-xs font-bold text-gray-600">
                      {getCategoryName(product)}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <p className="font-bold text-gray-900">{formatPrice(product.price)}</p>
                    {product.variants?.length > 1 && (
                      <p className="text-[10px] text-gray-400">{product.variants.length} Variants</p>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <p className={`font-bold ${product.stock > 0 ? 'text-gray-900' : 'text-red-500'}`}>
                      {product.stock}
                    </p>
                    <div className="w-24 h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${product.stock > 10 ? 'bg-green-500' : product.stock > 0 ? 'bg-orange-500' : 'bg-red-500'}`}
                        style={{ width: `${Math.min(100, product.stock)}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link 
                        href={`/admin/products/edit/${product._id}`}
                        className="p-3 bg-surface text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                      >
                        <FiEdit2 size={16} />
                      </Link>
                      <button 
                        onClick={() => setProductToDelete(product)}
                        className="p-3 bg-surface text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
            <div className="p-20 text-center">
              <div className="bg-surface w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-gray-300">
                <FiSearch size={32} />
              </div>
              <h3 className="text-xl font-display font-bold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500">Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      </div>

      {productToDelete && (
        <ConfirmationModal 
          isOpen={!!productToDelete}
          onClose={() => setProductToDelete(null)}
          onConfirm={() => deleteMutation.mutate(productToDelete._id)}
          title="Delete Product"
          message={`Are you sure you want to delete "${productToDelete.name}"? This action cannot be undone.`}
          confirmText={deleteMutation.isPending ? "Deleting..." : "Delete Product"}
        />
      )}
    </div>
  );
}
