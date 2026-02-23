"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useParams } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import ReactMarkdown from 'react-markdown';
import Breadcrumbs from "@/components/Breadcrumbs";
import { FiCalendar, FiUser } from "react-icons/fi";

export default function BlogPostPage() {
  const { slug } = useParams();

  const { data: blog, isLoading } = useQuery({
    queryKey: ["blog", slug],
    queryFn: async () => {
      const { data } = await api.get(`/blogs/${slug}`);
      return data;
    },
  });

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div>
    </div>
  );

  if (!blog) return (
    <div className="min-h-screen flex items-center justify-center text-2xl font-display">
        Blog post not found
    </div>
  );

  return (
    <main className="bg-surface min-h-screen pb-12 pt-32 lg:pt-36">
        {/* Hero Section */}
        <div className="container mx-auto px-4 md:px-8 max-w-4xl">
            <div className="mb-8">
                <Breadcrumbs 
                    items={[
                        { label: "Home", href: "/" },
                        { label: "Blog", href: "/blog" },
                        { label: blog.title, href: `/blog/${slug}` }
                    ]} 
                />
            </div>

            <div className="space-y-6 text-center mb-12">
                <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5">
                        <FiCalendar /> {format(new Date(blog.createdAt), "MMMM d, yyyy")}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    <span className="flex items-center gap-1.5">
                        <FiUser /> {blog.author?.name || "Team Grabszy"}
                    </span>
                </div>
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-gray-900 leading-tight">
                    {blog.title}
                </h1>
            </div>

            {blog.coverImage && (
                <div className="aspect-video relative rounded-[2rem] overflow-hidden shadow-2xl shadow-black/5 mb-12">
                    <Image 
                        src={blog.coverImage} 
                        alt={blog.title} 
                        fill 
                        className="object-cover"
                    />
                </div>
            )}
            
            <div className="prose prose-lg prose-gray mx-auto prose-headings:font-display prose-headings:font-bold prose-a:text-primary prose-img:rounded-xl">
                <ReactMarkdown>{blog.content}</ReactMarkdown>
            </div>
        </div>
    </main>
  );
}
