"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Link from "next/link";
import { format } from "date-fns";
import Image from "next/image";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function BlogListPage() {
  const { data: blogs, isLoading } = useQuery({
    queryKey: ["blogs"],
    queryFn: async () => {
      const { data } = await api.get("/blogs?published=true");
      return data;
    },
  });

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
    </div>
  );

  return (
    <main className="bg-surface min-h-screen pb-20 pt-32 lg:pt-36">
      <div className="container mx-auto px-4 md:px-8">
        <div className="mb-12 text-center">
            <span className="text-primary font-bold tracking-widest uppercase text-sm">Our Journal</span>
            <h1 className="text-4xl md:text-5xl font-display font-bold mt-2 text-gray-900">Latest News & Stories</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs?.map((blog) => (
                <Link 
                    key={blog._id} 
                    href={`/blog/${blog.slug}`}
                    className="group flex flex-col gap-4"
                >
                    <div className="aspect-[4/3] rounded-2xl overflow-hidden relative bg-gray-100">
                        {blog.coverImage ? (
                            <Image 
                                src={blog.coverImage} 
                                alt={blog.title} 
                                fill 
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-300 bg-gray-50">
                                No Image
                            </div>
                        )}
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span>{format(new Date(blog.createdAt), "MMMM d, yyyy")}</span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-primary transition-colors">
                            {blog.title}
                        </h2>
                        <p className="text-gray-500 line-clamp-2 text-sm leading-relaxed">
                            {blog.excerpt || "Read more about this topic..."}
                        </p>
                    </div>
                </Link>
            ))}
        </div>

        {blogs?.length === 0 && (
            <div className="text-center py-20 text-gray-500">
                <p>No posts published yet. Check back soon!</p>
            </div>
        )}
      </div>
    </main>
  );
}
