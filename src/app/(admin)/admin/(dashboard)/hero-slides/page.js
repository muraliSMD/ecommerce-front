"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { 
  FiPlus, 
  FiTrash2, 
  FiEdit2, 
  FiImage, 
  FiMove,
  FiEye,
  FiEyeOff
} from "react-icons/fi";
import Image from "next/image";
import toast from "react-hot-toast";
import { SectionLoader } from "@/components/Loader";
import ConfirmationModal from "@/components/ConfirmationModal";

export default function AdminHeroSlides() {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [slideToDelete, setSlideToDelete] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    image: "",
    link: "",
    isActive: true,
    order: 0
  });

  const { data: slides, isLoading } = useQuery({
    queryKey: ["admin-hero-slides"],
    queryFn: async () => {
      const { data } = await api.get("/hero-slides");
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      await api.post("/hero-slides", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-hero-slides"]);
      toast.success("Slide created successfully!");
      setIsAdding(false);
      resetForm();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to create slide");
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data) => {
      await api.put("/hero-slides", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-hero-slides"]);
      toast.success("Slide updated successfully!");
      setEditingSlide(null);
      setIsAdding(false);
      resetForm();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update slide");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/hero-slides?id=${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-hero-slides"]);
      toast.success("Slide deleted successfully!");
      setSlideToDelete(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete slide");
    }
  });

  const resetForm = () => {
    setFormData({
      title: "",
      subtitle: "",
      image: "",
      link: "",
      isActive: true,
      order: 0
    });
  };

  const handleEdit = (slide) => {
    setEditingSlide(slide);
    setFormData({
      title: slide.title,
      subtitle: slide.subtitle,
      image: slide.image,
      link: slide.link,
      isActive: slide.isActive,
      order: slide.order
    });
    setIsAdding(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingSlide) {
      updateMutation.mutate({ ...formData, _id: editingSlide._id });
    } else {
      createMutation.mutate({ ...formData, order: slides?.length || 0 });
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    
    setIsUploading(true);
    const toastId = toast.loading("Uploading...");
    try {
        const { data } = await api.post("/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        setFormData(prev => ({ ...prev, image: data.url }));
        toast.success("Image uploaded!", { id: toastId });
    } catch (err) {
        toast.error("Upload failed", { id: toastId });
    } finally {
        setIsUploading(false);
    }
  };

  if (isLoading) return <SectionLoader className="min-h-[60vh]" />;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-display font-bold text-gray-900">Hero Slider</h1>
          <p className="text-gray-500 mt-2">Manage the main banner slides on the home page.</p>
        </div>
        {!isAdding && (
          <button 
            onClick={() => { setIsAdding(true); resetForm(); }}
            className="bg-primary hover:bg-secondary text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 active:scale-95"
          >
            <FiPlus size={20} /> Add New Slide
          </button>
        )}
      </div>

      {isAdding && (
        <section className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-black/5 border border-gray-100 animate-in fade-in slide-in-from-top-4 duration-500">
           <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-display font-bold">{editingSlide ? "Edit Slide" : "New Slide"}</h2>
              <button 
                onClick={() => { setIsAdding(false); setEditingSlide(null); }} 
                className="text-gray-400 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
           </div>
           
           <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Title</label>
                <input 
                  type="text" 
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-surface border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 px-6 py-4 rounded-2xl outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Subtitle</label>
                <input 
                  type="text" 
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full bg-surface border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 px-6 py-4 rounded-2xl outline-none transition-all"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                 <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Banner Image</label>
                 <div className="flex gap-4 items-center">
                    <div className="w-32 h-20 bg-surface rounded-xl flex items-center justify-center border border-gray-100 overflow-hidden relative">
                        {formData.image ? (
                        <div className="relative w-full h-full">
                            <Image src={formData.image} alt="Preview" fill className="object-cover" />
                        </div>
                        ) : (
                        <FiImage className="text-gray-300" size={24} />
                        )}
                    </div>
                    <div className="flex-1">
                        <input 
                            type="text"
                            value={formData.image}
                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                            placeholder="Image URL"
                            required
                            className="w-full bg-surface border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 px-4 py-3 rounded-xl outline-none transition-all mb-2 text-sm"
                        />
                        <label className="inline-block bg-black text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer hover:bg-gray-800 transition-colors">
                            Upload Image
                            <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*"
                                onChange={handleFileUpload}
                            />
                        </label>
                    </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Link URL (Optional)</label>
                <input 
                  type="text" 
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="/shop?category=..."
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
                    <span className="ml-3 text-sm font-medium text-gray-900">Active</span>
                </label>
              </div>

              <div className="md:col-span-2 pt-4">
                <button 
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending || isUploading}
                    className="w-full bg-black text-white px-10 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {editingSlide ? (updateMutation.isPending ? "Updating..." : "Update Slide") : (createMutation.isPending ? "Creating..." : "Create Slide")}
                </button>
              </div>
           </form>
        </section>
      )}

      {/* Slides List */}
      <div className="space-y-4">
         {slides?.map((slide) => (
             <div key={slide._id} className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col md:flex-row items-center gap-6 shadow-sm hover:shadow-md transition-shadow">
                 <div className="w-full md:w-32 h-20 bg-gray-100 rounded-xl overflow-hidden relative flex-shrink-0">
                     {slide.image && <Image src={slide.image} alt={slide.title} fill className="object-cover" />}
                 </div>
                 
                 <div className="flex-1 text-center md:text-left">
                     <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                        <h3 className="font-bold text-gray-900">{slide.title}</h3>
                        {!slide.isActive && <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-bold uppercase rounded-full">Inactive</span>}
                     </div>
                     <p className="text-sm text-gray-500">{slide.subtitle}</p>
                 </div>

                 <div className="flex items-center gap-2">
                     <button 
                        onClick={() => handleEdit(slide)}
                        className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-colors"
                     >
                        <FiEdit2 size={18} />
                     </button>
                     <button 
                        onClick={() => setSlideToDelete(slide)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                     >
                        <FiTrash2 size={18} />
                     </button>
                 </div>
             </div>
         ))}

         {slides?.length === 0 && (
            <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
                <FiImage className="mx-auto text-gray-300 mb-4" size={48} />
                <h3 className="text-lg font-bold text-gray-900">No slides yet</h3>
                <p className="text-gray-500">Add a banner to showcase on the home page.</p>
            </div>
         )}
      </div>

      <ConfirmationModal 
        isOpen={!!slideToDelete}
        onClose={() => setSlideToDelete(null)}
        onConfirm={() => deleteMutation.mutate(slideToDelete._id)}
        title="Delete Slide?"
        message="Are you sure you want to delete this slide? This action cannot be undone."
        confirmText="Delete Slide"
        type="danger"
      />
    </div>
  );
}
