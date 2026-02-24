"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { 
  FiSearch, 
  FiPlus, 
  FiChevronLeft, 
  FiChevronRight, 
  FiImage, 
  FiEdit2, 
  FiTrash2, 
  FiEye, 
  FiFilter,
  FiMoreVertical,
  FiShoppingBag,
  FiPackage,
  FiInfo,
  FiCopy
} from "react-icons/fi";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import ConfirmationModal from "@/components/ConfirmationModal";
import { SectionLoader } from "@/components/Loader";
import { useSettingsStore } from "@/store/settingsStore";

export default function AdminProducts() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [productToDelete, setProductToDelete] = useState(null);
  const formatPrice = useSettingsStore((state) => state.formatPrice);

  const { data: products, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data } = await api.get("/products?admin=true");
      return data;
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id) => api.delete(`/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-products"]);
      toast.success("Product deleted successfully");
      setProductToDelete(null); // Clear productToDelete after successful deletion
    },
    onError: () => {
      toast.error("Failed to delete product");
    }
  });

  const duplicateProductMutation = useMutation({
    mutationFn: (id) => api.post(`/products/${id}/duplicate`),
    onSuccess: (response) => {
      queryClient.invalidateQueries(["admin-products"]);
      toast.success("Product duplicated successfully");
      router.push(`/admin/products/edit/${response.data._id}`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to duplicate product");
    }
  });

  const handleDuplicate = (id) => {
    duplicateProductMutation.mutate(id);
  };

  const toggleVisibilityMutation = useMutation({
    mutationFn: async ({ id, isActive }) => {
      const { data } = await api.put(`/products/${id}`, { isActive });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-products"]);
      toast.success("Product visibility updated");
    },
    onError: () => {
      toast.error("Failed to update product visibility");
    }
  });

  const handleToggleVisibility = (id, currentStatus) => {
    toggleVisibilityMutation.mutate({ id, isActive: !currentStatus });
  };

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
          <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900">Products</h1>
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
            <thead className="whitespace-nowrap">
              <tr className="bg-surface/50 text-gray-400 text-[10px] font-bold uppercase tracking-widest border-b border-gray-100">
                <th className="px-8 py-6">Product</th>
                <th className="px-8 py-6">Category</th>
                <th className="px-8 py-6">Price</th>
                <th className="px-8 py-6">Stock</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 whitespace-nowrap">
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
                    <div className="flex flex-col">
                      <p className="font-bold text-gray-900">{formatPrice(product.price)}</p>
                      {Number(product.mrp) > Number(product.price) && (
                        <p className="text-[10px] text-gray-400 line-through">
                          {formatPrice(product.mrp)}
                        </p>
                      )}
                      {product.variants?.length > 1 && (
                        <p className="text-[10px] text-gray-400">{product.variants.length} Variants</p>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {(() => {
                      const totalStock = product.variants?.length > 0 
                        ? product.variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0)
                        : (product.stock || 0);
                      
                      return (
                        <>
                          <p className={`font-bold ${totalStock > 0 ? 'text-gray-900' : 'text-red-500'}`}>
                            {totalStock}
                          </p>
                          <div className="w-24 h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${totalStock > 10 ? 'bg-green-500' : totalStock > 0 ? 'bg-orange-500' : 'bg-red-500'}`}
                              style={{ width: `${Math.min(100, totalStock)}%` }}
                            ></div>
                          </div>
                        </>
                      );
                    })()}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center">
                      <button
                        onClick={() => handleToggleVisibility(product._id, product.isActive !== false)}
                        disabled={toggleVisibilityMutation.isPending}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                          product.isActive !== false ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                        title={product.isActive !== false ? "Disable product" : "Enable product"}
                      >
                        <span className="sr-only">Toggle Active status</span>
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            product.isActive !== false ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <span className={`ml-3 text-xs font-bold ${product.isActive !== false ? 'text-green-600' : 'text-gray-500'}`}>
                          {product.isActive !== false ? "Active" : "Disabled"}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link 
                        href={`/admin/products/${product._id}`}
                        className="p-3 bg-surface text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                      >
                        <FiEye size={16} />
                      </Link>
                      <Link 
                        href={`/admin/products/edit/${product._id}`}
                        className="p-3 bg-surface text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                        title="Edit Product"
                      >
                        <FiEdit2 size={16} />
                      </Link>
                      <button 
                        onClick={() => handleDuplicate(product._id)}
                        className="p-3 bg-surface text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-xl transition-all"
                        title="Duplicate Product"
                        disabled={duplicateProductMutation.isPending}
                      >
                        <FiCopy size={16} className={duplicateProductMutation.isPending ? "animate-pulse" : ""} />
                      </button>
                      <button 
                        onClick={() => setProductToDelete(product)}
                        className="p-3 bg-surface text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        title="Delete Product"
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
          onConfirm={() => deleteProductMutation.mutate(productToDelete._id)}
          title="Delete Product"
          message={`Are you sure you want to delete "${productToDelete.name}"? This action cannot be undone.`}
          confirmText={deleteProductMutation.isPending ? "Deleting..." : "Delete Product"}
        />
      )}
    </div>
  );
}
