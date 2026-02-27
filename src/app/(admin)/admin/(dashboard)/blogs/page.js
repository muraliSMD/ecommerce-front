"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Link from "next/link";
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiEyeOff } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import ConfirmationModal from "@/components/ConfirmationModal";

export default function AdminBlogsPage() {
  const queryClient = useQueryClient();
  const [blogToDelete, setBlogToDelete] = useState(null);

  // Fetch Blogs
  const { data: blogs, isLoading } = useQuery({
    queryKey: ["admin-blogs"],
    queryFn: async () => {
      const { data } = await api.get("/blogs");
      return data;
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/blogs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-blogs"]);
      toast.success("Blog deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete blog");
    },
  });

  const handleDelete = (blog) => {
    setBlogToDelete(blog);
  };

  if (isLoading) return <div className="p-8 text-center">Loading blogs...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
        <Link
          href="/admin/blogs/new"
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl font-bold hover:bg-secondary transition-colors"
        >
          <FiPlus /> New Post
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                    <th className="p-4 font-bold text-gray-500 text-sm">Title</th>
                    <th className="p-4 font-bold text-gray-500 text-sm">Status</th>
                    <th className="p-4 font-bold text-gray-500 text-sm">Author</th>
                    <th className="p-4 font-bold text-gray-500 text-sm">Date</th>
                    <th className="p-4 font-bold text-gray-500 text-sm text-right">Actions</th>
                </tr>
            </thead>
            <tbody>
                {blogs?.map((blog) => (
                    <tr key={blog._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                        <td className="p-4">
                            <p className="font-bold text-gray-900">{blog.title}</p>
                            <p className="text-xs text-gray-400 font-mono">/{blog.slug}</p>
                        </td>
                        <td className="p-4">
                            {blog.isPublished ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                                    <FiEye size={12} /> Published
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold">
                                    <FiEyeOff size={12} /> Draft
                                </span>
                            )}
                        </td>
                        <td className="p-4 text-sm text-gray-600">
                            {blog.author?.name || "Unknown"}
                        </td>
                        <td className="p-4 text-sm text-gray-600">
                            {format(new Date(blog.createdAt), "MMM d, yyyy")}
                        </td>
                        <td className="p-4">
                            <div className="flex justify-end gap-2">
                                <Link
                                    href={`/admin/blogs/${blog.slug}`} // Or ID if preferred
                                    className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                                >
                                    <FiEdit2 size={18} />
                                </Link>
                                <button 
                                    onClick={() => handleDelete(blog)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <FiTrash2 size={18} />
                                </button>
                            </div>
                        </td>
                    </tr>
                ))}
                {blogs?.length === 0 && (
                    <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-500">
                            No blog posts found. Create one to get started.
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
      </div>

      {blogToDelete && (
        <ConfirmationModal 
          isOpen={!!blogToDelete}
          onClose={() => setBlogToDelete(null)}
          onConfirm={() => deleteMutation.mutate(blogToDelete._id)}
          title="Delete Blog Post"
          message={`Are you sure you want to delete "${blogToDelete.title}"? This action cannot be undone.`}
          confirmText={deleteMutation.isPending ? "Deleting..." : "Delete Post"}
          type="danger"
        />
      )}
    </div>
  );
}
