"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { 
  FiPlus, 
  FiTrash2, 
  FiGrid, 
  FiImage, 
  FiType,
  FiEdit2,
  FiSearch
} from "react-icons/fi";
import Image from "next/image";
import { useState } from "react";
import toast from "react-hot-toast";
import ConfirmationModal from "@/components/ConfirmationModal";
import { SectionLoader } from "@/components/Loader";

export default function AdminCategories() {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({ name: "", image: "" });
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const { data: categories, isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data } = await api.get("/categories");
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      await api.post("/categories", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-categories"]);
      toast.success("Category created!");
      setIsAdding(false);
      setNewCategory({ name: "", image: "" });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to create category");
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      await api.put(`/categories/${editingCategory._id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-categories"]);
      toast.success("Category updated!");
      setEditingCategory(null);
      setNewCategory({ name: "", image: "" });
      setIsAdding(false);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update category");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-categories"]);
      toast.success("Category deleted!");
      setCategoryToDelete(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete category");
    }
  });

  const handleEdit = (category) => {
    setEditingCategory(category);
    setNewCategory({ name: category.name, image: category.image || "" });
    setIsAdding(true);
  };

  const handleCloseForm = () => {
    setIsAdding(false);
    setEditingCategory(null);
    setNewCategory({ name: "", image: "" });
  };

  const handleSubmit = () => {
    if (editingCategory) {
      updateMutation.mutate(newCategory);
    } else {
      createMutation.mutate(newCategory);
    }
  };

  if (isLoading) return <SectionLoader className="min-h-[60vh]" />;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-display font-bold text-gray-900">Categories</h1>
          <p className="text-gray-500 mt-2">Organize your store taxonomy.</p>
        </div>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-primary hover:bg-secondary text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 active:scale-95"
          >
            <FiPlus size={20} /> Add New Category
          </button>
        )}
      </div>

      {isAdding && (
        <section className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-black/5 border border-gray-100 animate-in fade-in slide-in-from-top-4 duration-500">
           <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-display font-bold">{editingCategory ? "Edit Category" : "New Category"}</h2>
              <button onClick={handleCloseForm} className="text-gray-400 hover:text-gray-900 transition-colors">Cancel</button>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Category Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Summer Essentials"
                  className="w-full bg-surface border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 px-6 py-4 rounded-2xl outline-none transition-all"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Feature Image</label>
                <div className="flex gap-4">
                    <input 
                    type="text" 
                    placeholder="Image URL or upload file"
                    className="w-full bg-surface border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 px-6 py-4 rounded-2xl outline-none transition-all"
                    value={newCategory.image}
                    onChange={(e) => setNewCategory({ ...newCategory, image: e.target.value })}
                    />
                    <label className="flex-shrink-0 bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 rounded-2xl flex items-center justify-center cursor-pointer transition-colors">
                        <FiImage size={24} />
                        <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                
                                const formData = new FormData();
                                formData.append("file", file);
                                
                                const toastId = toast.loading("Uploading...");
                                try {
                                    const { data } = await api.post("/upload", formData, {
                                        headers: { "Content-Type": "multipart/form-data" },
                                    });
                                    setNewCategory(prev => ({ ...prev, image: data.url }));
                                    toast.success("Image uploaded!", { id: toastId });
                                } catch (err) {
                                    toast.error("Upload failed", { id: toastId });
                                }
                            }}
                        />
                    </label>
                </div>
              </div>
           </div>
           <button 
             onClick={handleSubmit}
             disabled={createMutation.isPending || updateMutation.isPending}
             className="mt-8 bg-black text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-all shadow-lg"
           >
             <FiPlus /> {createMutation.isPending || updateMutation.isPending ? "Saving..." : (editingCategory ? "Update Category" : "Create Category")}
           </button>
        </section>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categories?.map((category) => (
          <div key={category._id} className="group bg-white rounded-[2.5rem] p-6 shadow-xl shadow-black/5 border border-gray-100 hover:border-primary/20 transition-all flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-3xl overflow-hidden mb-6 bg-surface border border-gray-100 relative">
              <Image 
                src={category.image || "/placeholder.png"} 
                alt={category.name} 
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <h3 className="text-xl font-display font-bold text-gray-900 mb-1">{category.name}</h3>
            <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-6">48 Products</p>
            
            <div className="flex gap-2 w-full pt-6 border-t border-gray-50">
               <button 
                onClick={() => handleEdit(category)}
                className="flex-1 flex items-center justify-center gap-2 p-3 bg-surface text-gray-500 hover:bg-gray-100 rounded-xl transition-all font-bold text-xs">
                  <FiEdit2 size={14} /> Edit
               </button>
               <button 
                onClick={() => setCategoryToDelete(category)}
                className="p-3 bg-surface text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                  <FiTrash2 size={14} />
               </button>
            </div>
          </div>
        ))}
        
        {categories?.length === 0 && (
          <div className="col-span-full p-20 text-center text-gray-400 bg-white rounded-[2.5rem] border border-dashed border-gray-100">
            <FiGrid size={48} className="mx-auto mb-4 opacity-10" />
            <p className="text-lg font-display">No categories have been created yet.</p>
          </div>
        )}
      </div>

       {categoryToDelete && (
        <ConfirmationModal 
          isOpen={!!categoryToDelete}
          onClose={() => setCategoryToDelete(null)}
          onConfirm={() => deleteMutation.mutate(categoryToDelete._id)}
          title="Delete Category"
          message={`Are you sure you want to delete "${categoryToDelete.name}"? This action cannot be undone.`}
          confirmText={deleteMutation.isPending ? "Deleting..." : "Delete Category"}
        />
      )}
    </div>
  );
}
