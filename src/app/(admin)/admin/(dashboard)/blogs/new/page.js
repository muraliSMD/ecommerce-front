"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";
import { FiSave, FiArrowLeft, FiImage } from "react-icons/fi";
import Link from "next/link";

export default function EditBlogPage({ params }) {
  const router = useRouter();
  // If params.id exists, it's edit mode (we might need to handle this via route group or just separate create file)
  // For simplicity, let's assume this component handles both if we used a dynamic route, 
  // but for now I am creating a "new" page. I will make this a generic "Editor" component or just a specific "New" page.
  // Wait, I am writing to `admin/blogs/new/page.js`.

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    coverImage: "",
    isPublished: false
  });

  // Auto-generate slug from title
  useEffect(() => {
    if (formData.title && !formData.slug) {
        const slug = formData.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
        setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title]); // eslint-disable-line react-hooks/exhaustive-deps

  const createMutation = useMutation({
    mutationFn: async (data) => {
      await api.post("/blogs", data);
    },
    onSuccess: () => {
      toast.success("Blog created successfully");
      router.push("/admin/blogs");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create blog");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/blogs" className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
            <FiArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Create New Post</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                {/* Main Editor Area */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Title</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full text-xl font-bold p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                            placeholder="Enter post title..."
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Slug</label>
                        <input
                            type="text"
                            value={formData.slug}
                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                            className="w-full text-sm font-mono text-gray-500 p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none"
                            placeholder="post-url-slug"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Content</label>
                        <textarea
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            className="w-full h-96 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none resize-none font-mono text-sm leading-relaxed"
                            placeholder="Write your content here (Markdown/HTML)..."
                            required
                        />
                        <p className="text-xs text-gray-400 mt-2 text-right">Markdown supported</p>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {/* Sidebar Settings */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                    <h3 className="font-bold text-gray-900">Publishing</h3>
                    
                    <label className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50">
                        <input
                            type="checkbox"
                            checked={formData.isPublished}
                            onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                            className="w-5 h-5 text-primary rounded focus:ring-primary"
                        />
                        <span className="font-medium text-gray-700">Publish immediately</span>
                    </label>

                    <button
                        type="submit"
                        disabled={createMutation.isLoading}
                        className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-secondary transition-colors flex items-center justify-center gap-2"
                    >
                        <FiSave /> {createMutation.isLoading ? "Saving..." : "Save Post"}
                    </button>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                    <h3 className="font-bold text-gray-900">Excerpt</h3>
                    <textarea
                        value={formData.excerpt}
                        onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none resize-none text-sm h-32"
                        placeholder="Short summary for cards..."
                    />
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                    <h3 className="font-bold text-gray-900">Cover Image</h3>
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer relative overflow-hidden group">
                        {formData.coverImage ? (
                            <>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={formData.coverImage} alt="Cover Preview" className="absolute inset-0 w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white font-bold">
                                    Change Image
                                </div>
                            </>
                        ) : (
                            <div className="text-gray-400">
                                <FiImage className="mx-auto mb-2" size={24} />
                                <span className="text-sm">Paste URL or Upload</span>
                            </div>
                        )}
                        <input 
                            type="text" 
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={(e) => {
                                const url = prompt("Enter Image URL"); 
                                if(url) setFormData({...formData, coverImage: url})
                            }}
                        />
                    </div>
                    {/* Fallback text input for URL */}
                    <input
                        type="text"
                        value={formData.coverImage}
                        onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                        className="w-full text-xs p-2 border border-gray-200 rounded-lg"
                        placeholder="Or enter image URL..."
                    />
                </div>
            </div>
        </div>
      </form>
    </div>
  );
}
