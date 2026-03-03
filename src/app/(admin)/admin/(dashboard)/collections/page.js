"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSearch, FiFilter } from "react-icons/fi";
import toast from "react-hot-toast";
import ConfirmationModal from "@/components/ConfirmationModal";
import { SectionLoader } from "@/components/Loader";
import Image from "next/image";

export default function AdminCollections() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [collectionToDelete, setCollectionToDelete] = useState(null);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isActive: true
  });
  
  const [activeTab, setActiveTab] = useState("details"); // 'details' or 'products'
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("All");

  const { data: collections, isLoading } = useQuery({
    queryKey: ["admin-collections"],
    queryFn: async () => {
      const { data } = await api.get("/admin/collections");
      return data;
    },
  });

  const { data: allProducts, isLoading: isProductsLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data } = await api.get("/products?admin=true");
      return data;
    },
  });

  const { data: collectionProducts, isLoading: isCollectionProductsLoading } = useQuery({
    queryKey: ["admin-collection-products", editingCollection?._id],
    queryFn: async () => {
      const { data } = await api.get(`/admin/collections/${editingCollection._id}/products`);
      return data;
    },
    enabled: !!editingCollection,
  });

  // Pre-fill selected products when editing a collection and its products are loaded
  useEffect(() => {
    if (editingCollection && collectionProducts) {
      setSelectedProducts(collectionProducts);
    }
  }, [editingCollection, collectionProducts]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      let collectionRes;
      if (editingCollection) {
        collectionRes = await api.put(`/admin/collections/${editingCollection._id}`, data);
      } else {
        collectionRes = await api.post("/admin/collections", data);
      }
      
      const targetId = editingCollection ? editingCollection._id : collectionRes.data._id;
      
      // Update selected products
      await api.put(`/admin/collections/${targetId}/products`, { productIds: selectedProducts });
      
      return collectionRes;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-collections"]);
      queryClient.invalidateQueries(["admin-products"]);
      toast.success(editingCollection ? "Collection updated" : "Collection created");
      handleCloseModal();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to save collection");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/admin/collections/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-collections"]);
      queryClient.invalidateQueries(["admin-products"]);
      toast.success("Collection deleted");
      setCollectionToDelete(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete collection");
    }
  });

  const toggleVisibilityMutation = useMutation({
    mutationFn: async ({ id, isActive }) => {
      const { data } = await api.put(`/admin/collections/${id}`, { isActive });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-collections"]);
      toast.success("Collection visibility updated");
    },
    onError: () => {
      toast.error("Failed to update collection visibility");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error("Name is required");
    saveMutation.mutate(formData);
  };

  const handleEdit = (collection) => {
    setEditingCollection(collection);
    setFormData({
      name: collection.name,
      description: collection.description || "",
      isActive: collection.isActive
    });
    // Set to empty initially, will be populated by the query
    setSelectedProducts([]);
    setIsModalOpen(true);
  };

  const getCategoryName = (product) => product.category?.name || product.category || "Uncategorized";

  const categories = ["All", ...new Set(allProducts?.map(p => getCategoryName(p)).filter(c => c !== "Uncategorized") || [])];

  const filteredProducts = allProducts?.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(productSearchTerm.toLowerCase());
    const categoryName = getCategoryName(p);
    const matchesCategory = productCategoryFilter === "All" || categoryName === productCategoryFilter;
    return matchesSearch && matchesCategory;
  }) || [];

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCollection(null);
    setFormData({ name: "", description: "", isActive: true });
    setActiveTab("details");
    setSelectedProducts([]);
    setProductSearchTerm("");
    setProductCategoryFilter("All");
  };

  const handleSelectProduct = (productId) => {
    setSelectedProducts(prev => 
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  if (isLoading) return <SectionLoader className="min-h-[60vh]" />;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900">Collections</h1>
          <p className="text-gray-500 mt-2">Manage dynamic product collections like New Arrivals, Offer Zone, etc.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-secondary text-white px-6 py-4 md:px-8 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 active:scale-95 w-full md:w-auto mt-4 md:mt-0"
        >
          <FiPlus size={20} /> Create Collection
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-black/5 border border-gray-100 overflow-hidden w-full max-w-full">
        <div className="w-full overflow-x-auto align-middle">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="whitespace-nowrap">
              <tr className="bg-surface/50 text-gray-400 text-[10px] font-bold uppercase tracking-widest border-b border-gray-100">
                <th className="px-8 py-6">Name</th>
                <th className="px-8 py-6">Slug</th>
                <th className="px-8 py-6">Status</th>
                <th className="px-8 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 whitespace-nowrap">
              {collections?.map((collection) => (
                <tr key={collection._id} className="group hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-6 font-bold text-gray-900">{collection.name}</td>
                  <td className="px-8 py-6 text-gray-500 font-mono text-xs">{collection.slug}</td>
                  <td className="px-8 py-6">
                    <div className="flex items-center">
                      <button
                        onClick={() => toggleVisibilityMutation.mutate({ id: collection._id, isActive: !collection.isActive })}
                        disabled={toggleVisibilityMutation.isPending}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                          collection.isActive ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            collection.isActive ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                      <span className={`ml-3 text-xs font-bold ${collection.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                          {collection.isActive ? "Active" : "Disabled"}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleEdit(collection)}
                        className="p-3 bg-surface text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                      >
                        <FiEdit2 size={16} />
                      </button>
                      <button 
                        onClick={() => setCollectionToDelete(collection)}
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
          {(!collections || collections.length === 0) && (
            <div className="p-20 text-center">
              <h3 className="text-xl font-display font-bold text-gray-900 mb-2">No collections yet</h3>
              <p className="text-gray-500">Create your first collection to feature products.</p>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="p-6 md:px-8 md:pt-8 md:pb-4 flex flex-col gap-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-display font-bold text-gray-900">
                    {editingCollection ? "Edit Collection" : "Create Collection"}
                  </h2>
                  <button 
                    onClick={handleCloseModal}
                    className="w-10 h-10 bg-surface rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-colors"
                  >
                    <FiX size={20} />
                  </button>
              </div>
              <div className="flex gap-4">
                  <button 
                    onClick={() => setActiveTab("details")}
                    className={`pb-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'details' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
                  >
                      Details
                  </button>
                  <button 
                    onClick={() => setActiveTab("products")}
                    className={`pb-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'products' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-900'}`}
                  >
                      Products
                  </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
              {activeTab === 'details' && (
                  <div className="space-y-6 max-w-lg">
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">Name *</label>
                        <input 
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="w-full bg-surface border-none focus:ring-2 focus:ring-primary/20 px-6 py-4 rounded-2xl outline-none"
                          placeholder="e.g. New Arrivals"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">Description</label>
                        <textarea 
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          className="w-full bg-surface border-none focus:ring-2 focus:ring-primary/20 px-6 py-4 rounded-2xl outline-none resize-none"
                          placeholder="Optional description"
                          rows={3}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-surface rounded-2xl">
                        <div>
                          <label className="font-bold text-gray-900">Active Status</label>
                          <p className="text-xs text-gray-500">Display this collection on the storefront</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData({...formData, isActive: !formData.isActive})}
                          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                            formData.isActive ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        >
                          <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                              formData.isActive ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                  </div>
              )}

              {activeTab === 'products' && (
                  <div className="space-y-6">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-grow">
                          <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input 
                            type="text"
                            placeholder="Search products..."
                            className="w-full bg-surface border-none focus:ring-2 focus:ring-primary/20 pl-14 pr-6 py-4 rounded-2xl outline-none"
                            value={productSearchTerm}
                            onChange={(e) => setProductSearchTerm(e.target.value)}
                          />
                        </div>
                        <div className="relative min-w-[200px]">
                           <FiFilter className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                           <select 
                             value={productCategoryFilter}
                             onChange={(e) => setProductCategoryFilter(e.target.value)}
                             className="w-full bg-surface border-none focus:ring-2 focus:ring-primary/20 pl-14 pr-6 py-4 rounded-2xl outline-none appearance-none cursor-pointer"
                           >
                             {categories.map(cat => (
                               <option key={cat} value={cat}>{cat}</option>
                             ))}
                           </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                          {/* All Products List */}
                          <div className="space-y-4">
                              <h3 className="font-bold text-gray-900 text-sm">Available Products</h3>
                              <div className="bg-surface rounded-3xl p-2 h-[400px] overflow-y-auto border border-gray-100 space-y-2">
                                  {isProductsLoading ? (
                                      <div className="p-4 text-center text-gray-500 text-sm">Loading products...</div>
                                  ) : filteredProducts.length === 0 ? (
                                      <div className="p-4 text-center text-gray-500 text-sm">No products found</div>
                                  ) : (
                                      filteredProducts.map(product => {
                                          const isSelected = selectedProducts.includes(product._id);
                                          return (
                                              <div 
                                                  key={product._id} 
                                                  onClick={() => handleSelectProduct(product._id)}
                                                  className={`flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-colors border ${isSelected ? 'bg-primary/5 border-primary/20' : 'bg-white border-transparent hover:border-gray-200 shadow-sm'}`}
                                              >
                                                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-surface relative flex-shrink-0">
                                                      <Image 
                                                        src={product.images?.[0] || product.variants?.[0]?.images?.[0] || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2070"} 
                                                        alt={product.name}
                                                        fill
                                                        className="object-cover"
                                                      />
                                                  </div>
                                                  <div className="flex-grow min-w-0">
                                                      <p className="font-bold text-sm text-gray-900 truncate">{product.name}</p>
                                                      <p className="text-xs text-gray-500">{getCategoryName(product)}</p>
                                                  </div>
                                                  <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 border ${isSelected ? 'bg-primary border-primary text-white' : 'bg-surface border-gray-300'}`}>
                                                      {isSelected && <FiPlus className="rotate-45" size={14} />}
                                                  </div>
                                              </div>
                                          )
                                      })
                                  )}
                              </div>
                          </div>

                          {/* Selected Products List */}
                          <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                  <h3 className="font-bold text-gray-900 text-sm">Selected Products</h3>
                                  <span className="text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-full">{selectedProducts.length} selected</span>
                              </div>
                              <div className="bg-surface rounded-3xl p-2 h-[400px] overflow-y-auto border border-gray-100 space-y-2">
                                  {selectedProducts.length === 0 ? (
                                      <div className="p-4 text-center text-gray-500 text-sm">No products selected yet.</div>
                                  ) : (
                                      selectedProducts.map(id => {
                                          const product = allProducts?.find(p => p._id === id);
                                          if (!product) return null;
                                          return (
                                              <div 
                                                  key={id} 
                                                  className="flex items-center gap-4 p-3 rounded-2xl bg-white border border-transparent shadow-sm"
                                              >
                                                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-surface relative flex-shrink-0">
                                                      <Image 
                                                        src={product.images?.[0] || product.variants?.[0]?.images?.[0] || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2070"} 
                                                        alt={product.name}
                                                        fill
                                                        className="object-cover"
                                                      />
                                                  </div>
                                                  <div className="flex-grow min-w-0">
                                                      <p className="font-bold text-sm text-gray-900 truncate">{product.name}</p>
                                                      <p className="text-xs text-gray-500">{getCategoryName(product)}</p>
                                                  </div>
                                                  <button
                                                      type="button"
                                                      onClick={() => handleSelectProduct(id)}
                                                      className="w-8 h-8 rounded-xl flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
                                                  >
                                                      <FiTrash2 size={16} />
                                                  </button>
                                              </div>
                                          )
                                      })
                                  )}
                              </div>
                          </div>
                      </div>
                  </div>
              )}
            </form>
            
            <div className="p-6 md:p-8 border-t border-gray-100 flex gap-4">
                <button 
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-6 py-4 rounded-2xl font-bold text-gray-500 bg-surface hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSubmit}
                  disabled={saveMutation.isPending}
                  className="flex-1 px-6 py-4 rounded-2xl font-bold text-white bg-primary hover:bg-secondary transition-colors shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                  {saveMutation.isPending ? "Saving..." : "Save Collection"}
                </button>
            </div>
          </div>
        </div>
      )}

      {collectionToDelete && (
        <ConfirmationModal 
          isOpen={!!collectionToDelete}
          onClose={() => setCollectionToDelete(null)}
          onConfirm={() => deleteMutation.mutate(collectionToDelete._id)}
          title="Delete Collection"
          message={`Are you sure you want to delete "${collectionToDelete.name}"? This will not delete the products inside it, only the collection itself.`}
          confirmText={deleteMutation.isPending ? "Deleting..." : "Delete Collection"}
        />
      )}
    </div>
  );
}
