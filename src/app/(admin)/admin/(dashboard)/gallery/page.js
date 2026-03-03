"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { 
  FiPlus, 
  FiTrash2, 
  FiEdit2, 
  FiImage, 
  FiEye,
  FiEyeOff,
  FiFilter
} from "react-icons/fi";
import Image from "next/image";
import toast from "react-hot-toast";
import { SectionLoader } from "@/components/Loader";
import ConfirmationModal from "@/components/ConfirmationModal";

export default function AdminGallery() {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [filterCategory, setFilterCategory] = useState("All");
  
  // Category management state
  const [isManagingCategories, setIsManagingCategories] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [editingCat, setEditingCat] = useState(null);

  const [formData, setFormData] = useState({
    imageUrl: "",
    category: "",
    caption: "",
    isActive: true,
    order: 0
  });

  // Fetch Categories
  const { data: categories, isLoading: isLoadingCats } = useQuery({
    queryKey: ["admin-gallery-categories"],
    queryFn: async () => {
      const { data } = await api.get("/gallery/categories");
      return data;
    },
  });

  const { data: galleryItems, isLoading } = useQuery({
    queryKey: ["admin-gallery", filterCategory],
    queryFn: async () => {
      const url = filterCategory === "All" ? "/gallery" : `/gallery?category=${filterCategory}`;
      const { data } = await api.get(url);
      return data;
    },
  });

  // Category Mutations
  const createCatMutation = useMutation({
    mutationFn: async (data) => await api.post("/gallery/categories", data),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-gallery-categories"]);
      setNewCatName("");
      toast.success("Category created!");
    }
  });

  const updateCatMutation = useMutation({
    mutationFn: async (data) => await api.put("/gallery/categories", data),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-gallery-categories"]);
      setEditingCat(null);
      toast.success("Category updated!");
    }
  });

  const deleteCatMutation = useMutation({
    mutationFn: async (id) => await api.delete(`/gallery/categories?id=${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-gallery-categories"]);
      toast.success("Category deleted!");
    }
  });

  // Gallery Item Mutations
  const createMutation = useMutation({
    mutationFn: async (data) => {
      await api.post("/gallery", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-gallery"]);
      toast.success("Gallery item created successfully!");
      setIsAdding(false);
      resetForm();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to create gallery item");
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      await api.put("/gallery", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-gallery"]);
      toast.success("Gallery item updated successfully!");
      setEditingItem(null);
      setIsAdding(false);
      resetForm();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update gallery item");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/gallery?id=${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-gallery"]);
      toast.success("Gallery item deleted successfully!");
      setItemToDelete(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete gallery item");
    }
  });

  const resetForm = () => {
    setFormData({
      imageUrl: "",
      category: categories?.[0]?._id || "",
      caption: "",
      isActive: true,
      order: 0
    });
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      imageUrl: item.imageUrl,
      category: item.category?._id || item.category,
      caption: item.caption || "",
      isActive: item.isActive,
      order: item.order
    });
    setIsAdding(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingItem) {
      updateMutation.mutate({ ...formData, _id: editingItem._id });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleAddCategory = (e) => {
      e.preventDefault();
      if (!newCatName.trim()) return;
      const slug = newCatName.toLowerCase().replace(/ /g, '-');
      createCatMutation.mutate({ name: newCatName, slug });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadFormData = new FormData();
    uploadFormData.append("file", file);
    
    setIsUploading(true);
    const toastId = toast.loading("Uploading image...");
    try {
        const { data } = await api.post("/upload", uploadFormData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        setFormData(prev => ({ ...prev, imageUrl: data.url }));
        toast.success("Image uploaded!", { id: toastId });
    } catch (err) {
        toast.error("Upload failed", { id: toastId });
    } finally {
        setIsUploading(false);
    }
  };

  if (isLoading || isLoadingCats) return <SectionLoader className="min-h-[60vh]" />;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-display font-bold text-gray-900">Gallery Management</h1>
          <p className="text-gray-500 mt-2">Manage images and categories for your storefront gallery.</p>
        </div>
        <div className="flex gap-4">
            <button 
                onClick={() => setIsManagingCategories(!isManagingCategories)}
                className="bg-white border border-gray-200 text-gray-700 px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all hover:bg-gray-50"
            >
                {isManagingCategories ? "Close Categories" : "Manage Categories"}
            </button>
            {!isAdding && !isManagingCategories && (
            <button 
                onClick={() => { setIsAdding(true); resetForm(); }}
                className="bg-primary hover:bg-secondary text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 active:scale-95"
            >
                <FiPlus size={20} /> Add New Image
            </button>
            )}
        </div>
      </div>

      {isManagingCategories && (
          <section className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-gray-100 animate-in fade-in slide-in-from-top-4 duration-500">
               <h2 className="text-2xl font-display font-bold mb-6">Gallery Categories</h2>
               
               <form onSubmit={handleAddCategory} className="flex gap-4 mb-8">
                   <input 
                        type="text"
                        placeholder="New Category Name (e.g. Sarees)"
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        className="flex-1 bg-surface border border-gray-100 p-4 rounded-xl outline-none"
                   />
                   <button 
                        type="submit"
                        disabled={createCatMutation.isPending}
                        className="bg-black text-white px-8 py-4 rounded-xl font-bold disabled:opacity-50"
                   >
                       Add Category
                   </button>
               </form>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {categories?.map(cat => (
                       <div key={cat._id} className="flex items-center justify-between p-4 bg-surface rounded-xl border border-gray-100">
                           {editingCat === cat._id ? (
                               <input 
                                    autoFocus
                                    className="bg-white border p-1 rounded w-full mr-2"
                                    defaultValue={cat.name}
                                    onBlur={(e) => {
                                        updateCatMutation.mutate({ _id: cat._id, name: e.target.value });
                                    }}
                               />
                           ) : (
                               <span className="font-bold">{cat.name}</span>
                           )}
                           <div className="flex gap-2">
                               <button onClick={() => setEditingCat(cat._id)} className="p-2 text-gray-400 hover:text-primary"><FiEdit2 size={16} /></button>
                               <button onClick={() => deleteCatMutation.mutate(cat._id)} className="p-2 text-gray-400 hover:text-red-500"><FiTrash2 size={16} /></button>
                           </div>
                       </div>
                   ))}
               </div>
          </section>
      )}

      {!isAdding && !isManagingCategories && (
        <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm overflow-x-auto no-scrollbar">
           <FiFilter className="text-gray-400 flex-shrink-0" />
           <button
               onClick={() => setFilterCategory("All")}
               className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                 filterCategory === "All" 
                 ? "bg-primary text-white shadow-md shadow-primary/20" 
                 : "bg-gray-50 text-gray-500 hover:bg-gray-100"
               }`}
           >
               All
           </button>
           {categories?.map(cat => (
             <button
               key={cat._id}
               onClick={() => setFilterCategory(cat._id)}
               className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                 filterCategory === cat._id 
                 ? "bg-primary text-white shadow-md shadow-primary/20" 
                 : "bg-gray-50 text-gray-500 hover:bg-gray-100"
               }`}
             >
               {cat.name}
             </button>
           ))}
        </div>
      )}

      {isAdding && (
        <section className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-black/5 border border-gray-100 animate-in fade-in slide-in-from-top-4 duration-500">
           <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-display font-bold">{editingItem ? "Edit Gallery Item" : "New Gallery Item"}</h2>
              <button 
                onClick={() => { setIsAdding(false); setEditingItem(null); }} 
                className="text-gray-400 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
           </div>
           
           <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                 <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Gallery Image</label>
                 <div className="flex gap-4 items-center">
                    <div className="w-32 h-32 bg-surface rounded-xl flex items-center justify-center border border-gray-100 overflow-hidden relative">
                        {formData.imageUrl ? (
                        <div className="relative w-full h-full">
                            <Image src={formData.imageUrl} alt="Preview" fill className="object-cover" />
                        </div>
                        ) : (
                        <FiImage className="text-gray-300" size={32} />
                        )}
                    </div>
                    <div className="flex-1">
                        <input 
                            type="text"
                            value={formData.imageUrl}
                            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                            placeholder="Image URL"
                            required
                            className="w-full bg-surface border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 px-4 py-3 rounded-xl outline-none transition-all mb-2 text-sm"
                        />
                        <label className="inline-block bg-black text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer hover:bg-gray-800 transition-colors">
                            {isUploading ? "Uploading..." : "Upload Image"}
                            <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*"
                                onChange={handleFileUpload}
                                disabled={isUploading}
                            />
                        </label>
                    </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Category</label>
                <select 
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-surface border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 px-6 py-4 rounded-2xl outline-none transition-all appearance-none"
                >
                  <option value="">Select Category</option>
                  {categories?.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Display Order</label>
                <input 
                  type="number" 
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className="w-full bg-surface border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 px-6 py-4 rounded-2xl outline-none transition-all"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Caption (Optional)</label>
                <input 
                  type="text" 
                  value={formData.caption}
                  onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                  placeholder="A short description for the image"
                  className="w-full bg-surface border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 px-6 py-4 rounded-2xl outline-none transition-all"
                />
              </div>

              <div className="space-y-2 flex items-center pt-8">
                 <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    <span className="ml-3 text-sm font-medium text-gray-900">Visible on storefront</span>
                </label>
              </div>

              <div className="md:col-span-2 pt-4">
                <button 
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending || isUploading}
                    className="w-full bg-black text-white px-10 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {editingItem ? (updateMutation.isPending ? "Updating..." : "Update Item") : (createMutation.isPending ? "Creating..." : "Add to Gallery")}
                </button>
              </div>
           </form>
        </section>
      )}

      {/* Gallery List */}
      <div className="grid grid-cols-3 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4">
         {galleryItems?.map((item) => (
             <div key={item._id} className="bg-white rounded-xl md:rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group">
                 <div className="aspect-square relative overflow-hidden">
                     {item.imageUrl && (
                        <Image 
                          src={item.imageUrl} 
                          alt={item.caption || "Gallery item"} 
                          fill 
                          className="object-cover group-hover:scale-110 transition-transform duration-500" 
                        />
                     )}
                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 md:gap-2">
                        <button 
                            onClick={() => handleEdit(item)}
                            className="p-1.5 md:p-2 bg-white text-gray-900 rounded-md md:rounded-lg hover:bg-primary hover:text-white transition-colors"
                        >
                            <FiEdit2 size={12} className="md:w-4 md:h-4" />
                        </button>
                        <button 
                            onClick={() => setItemToDelete(item)}
                            className="p-1.5 md:p-2 bg-white text-red-500 rounded-md md:rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                        >
                            <FiTrash2 size={12} className="md:w-4 md:h-4" />
                        </button>
                     </div>
                     <div className="absolute top-1.5 left-1.5 md:top-3 md:left-3">
                        <span className="px-1.5 py-0.5 md:px-2 md:py-1 bg-white/90 backdrop-blur-sm text-gray-900 text-[6px] md:text-[8px] font-bold uppercase rounded shadow-sm">
                            {item.category?.name || (categories?.find(c => c._id === (item.category?._id || item.category))?.name) || (typeof item.category === 'string' ? item.category : "Uncategorized")}
                        </span>
                     </div>
                     {/* ... rest of item display */}

                     {!item.isActive && (
                        <div className="absolute top-1.5 right-1.5 md:top-3 md:right-3">
                            <span className="px-1.5 py-0.5 md:px-2 md:py-1 bg-gray-900/90 backdrop-blur-sm text-white text-[6px] md:text-[8px] font-bold uppercase rounded shadow-sm flex items-center gap-1">
                                <FiEyeOff size={6} className="md:w-2 md:h-2" />
                            </span>
                        </div>
                     )}
                 </div>
                 
                 {item.caption && (
                    <div className="p-1.5 md:p-2">
                        <p className="text-[8px] md:text-[10px] text-gray-600 line-clamp-1 italic">"{item.caption}"</p>
                    </div>
                 )}
             </div>
         ))}

         {galleryItems?.length === 0 && (
            <div className="col-span-full text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
                <FiImage className="mx-auto text-gray-300 mb-4" size={48} />
                <h3 className="text-lg font-bold text-gray-900">No images found</h3>
                <p className="text-gray-500">Try changing the filter or add a new gallery image.</p>
            </div>
         )}
      </div>

      <ConfirmationModal 
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={() => deleteMutation.mutate(itemToDelete._id)}
        title="Delete Gallery Image?"
        message="Are you sure you want to delete this image from the gallery? This action cannot be undone."
        confirmText="Delete Image"
        type="danger"
      />
    </div>
  );
}
