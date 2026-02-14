"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
// ... imports
import { FiPlus, FiTrash2, FiEdit2, FiChevronRight, FiChevronDown, FiFolder, FiFolderPlus, FiUpload, FiImage } from "react-icons/fi";
import Image from "next/image";
import toast from "react-hot-toast";

// Recursive Category Item Component
const CategoryItem = ({ category, allCategories, level = 0, onDelete, onEdit, onAddChild }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Find children of this category
  const children = allCategories.filter(c => c.parent?._id === category._id || c.parent === category._id);
  const hasChildren = children.length > 0;

  return (
    <div className="select-none">
      <div 
        className={`flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100 group ${level > 0 ? "ml-6" : ""}`}
      >
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`p-1 rounded-lg hover:bg-gray-200 text-gray-400 transition-colors ${!hasChildren ? "invisible" : ""}`}
        >
          {isOpen ? <FiChevronDown /> : <FiChevronRight />}
        </button>
        
        <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 overflow-hidden relative flex-shrink-0">
            {category.image ? (
                <Image src={category.image} alt={category.name} fill className="object-cover" />
            ) : (
                <FiFolder size={20} />
            )}
        </div>

        <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900 truncate">{category.name}</span>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full flex-shrink-0">/{category.slug}</span>
            </div>
            {category.description && <p className="text-xs text-gray-500 truncate max-w-md">{category.description}</p>}
        </div>

        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
            <button 
                onClick={() => onAddChild(category)}
                className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                title="Add Subcategory"
            >
                <FiFolderPlus />
            </button>
            <button 
                onClick={() => onEdit(category)}
                className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit"
            >
                <FiEdit2 />
            </button>
            <button 
                onClick={() => onDelete(category)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete"
            >
                <FiTrash2 />
            </button>
        </div>
      </div>

      {isOpen && hasChildren && (
        <div className="border-l-2 border-gray-50 ml-5 my-1 pl-2">
          {children.map(child => (
            <CategoryItem 
              key={child._id} 
              category={child} 
              allCategories={allCategories} 
              level={level + 1}
              onDelete={onDelete}
              onEdit={onEdit}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [parentCategory, setParentCategory] = useState(null); // For adding subcategory
  
  const [formData, setFormData] = useState({ name: "", description: "", image: "" });
  const [uploading, setUploading] = useState(false);

  // Fetch Categories
  const { data: categories, isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data } = await api.get("/categories");
      return data;
    },
  });

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: async (data) => {
       const { data: res } = await api.post("/categories", data);
       return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-categories"]);
      toast.success("Category created!");
      closeModal();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to create")
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
       const { data: res } = await api.put(`/categories/${id}`, data);
       return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-categories"]);
      toast.success("Category updated!");
      closeModal();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to update")
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
       const { data: res } = await api.delete(`/categories/${id}`);
       return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-categories"]);
      toast.success("Category deleted!");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to delete")
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingCategory) {
        updateMutation.mutate({ id: editingCategory._id, data: formData });
    } else {
        createMutation.mutate({ 
            ...formData, 
            parent: parentCategory ? parentCategory._id : null 
        });
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append("file", file);

    setUploading(true);
    try {
      const res = await fetch("/api/upload", {
          method: "POST",
          body: uploadData
      });
      const data = await res.json();
      
      if (res.ok) {
          setFormData({ ...formData, image: data.url });
          toast.success("Image uploaded!");
      } else {
          toast.error("Failed to upload image");
      }
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const openAddModal = (parent = null) => {
    setParentCategory(parent);
    setEditingCategory(null);
    setFormData({ name: "", description: "", image: "" });
    setIsModalOpen(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setParentCategory(null); 
    setFormData({ 
        name: category.name, 
        description: category.description || "", 
        image: category.image || "" 
    });
    setIsModalOpen(true);
  };

  const handleDelete = (category) => {
    if (confirm(`Are you sure you want to delete "${category.name}"? This might affect subcategories.`)) {
        deleteMutation.mutate(category._id);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setParentCategory(null);
  };

  // Filter root categories
  // Robust check: Ensure parent is null OR parent ID is not in current list (orphan check if desired, but ideally unnecessary if DB clean)
  // For now stick to simple check but verify data
  const rootCategories = categories?.filter(c => !c.parent || (typeof c.parent === 'object' && !c.parent._id)) || [];

  return (
    <div className="pb-20 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
            <h1 className="text-2xl font-display font-bold text-gray-900">Categories</h1>
            <p className="text-gray-500 text-sm">Manage your product category hierarchy</p>
        </div>
        <button 
          onClick={() => openAddModal(null)}
          className="bg-primary hover:bg-secondary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/20 active:scale-95"
        >
          <FiPlus /> Add Root Category
        </button>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-black/5 border border-gray-100 min-h-[500px]">
        {isLoading ? (
            <div className="text-center py-20 text-gray-400">Loading categories...</div>
        ) : rootCategories.length > 0 ? (
            <div className="space-y-1">
                {rootCategories.map(cat => (
                    <CategoryItem 
                        key={cat._id} 
                        category={cat} 
                        allCategories={categories} 
                        onDelete={handleDelete}
                        onEdit={openEditModal}
                        onAddChild={openAddModal}
                    />
                ))}
            </div>
        ) : (
            <div className="text-center py-20 text-gray-400 border-2 border-dashed border-gray-100 rounded-3xl">
                No categories found. Start by adding one.
            </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in fade-in zoom-in duration-200 lg:max-w-lg">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">
                        {editingCategory ? "Edit Category" : parentCategory ? `Add Subcategory to "${parentCategory.name}"` : "Add Root Category"}
                    </h2>
                    <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><FiPlus className="rotate-45" size={24}/></button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Image Upload */}
                    <div className="flex justify-center mb-6">
                        <div className="relative group w-32 h-32 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden hover:border-primary/50 transition-colors">
                            {formData.image ? (
                                <>
                                    <Image src={formData.image} alt="Preview" fill className="object-cover" />
                                    <button 
                                        type="button"
                                        onClick={() => setFormData({...formData, image: ""})}
                                        className="absolute top-2 right-2 bg-white/80 p-1.5 rounded-full text-red-500 hover:bg-white transition-colors"
                                    >
                                        <FiTrash2 size={14} />
                                    </button>
                                </>
                            ) : (
                                <div className="text-center">
                                    <FiImage className="mx-auto text-gray-300 mb-2" size={24} />
                                    <span className="text-xs text-gray-400 font-bold block">Add Image</span>
                                </div>
                            )}
                            
                            <label className={`absolute inset-0 cursor-pointer flex items-center justify-center ${formData.image ? "opacity-0 hover:opacity-100 bg-black/40 text-white transition-opacity" : ""}`}>
                                {formData.image ? <FiEdit2 /> : null}
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    disabled={uploading}
                                />
                            </label>
                            {uploading && (
                                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-500 uppercase">Name</label>
                        <input 
                            type="text" 
                            required
                            value={formData.name} 
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="Category Name"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-500 uppercase">Description (Optional)</label>
                        <textarea 
                            value={formData.description} 
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            className="w-full bg-gray-50 border border-gray-100 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                            placeholder="Short description..."
                            rows={3}
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button 
                            type="button" 
                            onClick={closeModal}
                            className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={createMutation.isPending || updateMutation.isPending || uploading}
                            className="flex-1 py-3 rounded-xl font-bold bg-primary text-white hover:bg-secondary transition-colors disabled:opacity-50"
                        >
                            {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save Category"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
}
