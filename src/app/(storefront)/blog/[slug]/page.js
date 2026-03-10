"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import ReactMarkdown from 'react-markdown';
import Breadcrumbs from "@/components/Breadcrumbs";
import { FiCalendar, FiUser, FiArrowLeft, FiShare2, FiHeart } from "react-icons/fi";
import { motion, useScroll, useSpring } from "framer-motion";
import { useState } from "react";

export default function BlogPostPage() {
  const { slug } = useParams();
  const [isLiked, setIsLiked] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiff: 100,
    damping: 30,
    restDelta: 0.001
  });

  const { data: blog, isLoading } = useQuery({
    queryKey: ["blog", slug],
    queryFn: async () => {
      const { data } = await api.get(`/blogs/${slug}`);
      return data;
    },
  });

  const { data: otherBlogs } = useQuery({
    queryKey: ["blogs"],
    queryFn: async () => {
      const { data } = await api.get("/blogs?published=true");
      return data;
    },
  });

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-primary/20 animate-ping"></div>
          <div className="absolute inset-0 w-12 h-12 rounded-full border-t-4 border-primary animate-spin"></div>
      </div>
    </div>
  );

  if (!blog) return (
    <section className="container mx-auto px-4 md:px-8 max-w-7xl py-12 min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center justify-center gap-6 text-center">
            <h2 className="text-4xl font-display font-bold text-gray-900">Post Not Found</h2>
            <p className="text-gray-500">The blog post you&apos;re looking for doesn&apos;t exist.</p>
            <Link href="/blog" className="px-8 py-4 bg-primary text-white rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/20">
                Back to Blog
            </Link>
        </div>
    </section>
  );

  return (
    <main className="bg-white min-h-screen">
        {/* Progress Bar */}
        <motion.div
            className="fixed top-0 left-0 right-0 h-1.5 bg-primary z-50 origin-[0%]"
            style={{ scaleX }}
        />

        {/* Hero Section */}
        <section className="relative h-[70vh] min-h-[500px] w-full overflow-hidden">
            {blog.coverImage ? (
                <motion.div 
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="absolute inset-0"
                >
                    <Image 
                        src={blog.coverImage} 
                        alt={blog.title} 
                        fill 
                        priority
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
                </motion.div>
            ) : (
                <div className="absolute inset-0 bg-gray-900"></div>
            )}

            <div className="absolute inset-0 flex flex-col justify-end">
                <div className="container mx-auto px-4 md:px-8 max-w-7xl pb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="max-w-4xl"
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <Link href="/blog" className="flex items-center gap-2 text-white/80 hover:text-white text-sm font-bold transition-colors">
                                <FiArrowLeft /> Back to Articles
                            </Link>
                            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                            <span className="text-primary font-bold text-sm tracking-widest uppercase">INSIGHTS</span>
                        </div>
                        
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white leading-tight mb-8">
                            {blog.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 text-white/80">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/20 backdrop-blur-md flex items-center justify-center border border-white/10 overflow-hidden">
                                     <FiUser className="text-primary" />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold tracking-widest text-white/50">Written by</p>
                                    <p className="font-bold text-sm text-white">{blog.author?.name || "The Visionary"}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10">
                                     <FiCalendar className="text-white" />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-bold tracking-widest text-white/50">Published on</p>
                                    <p className="font-bold text-sm text-white">{format(new Date(blog.createdAt), "MMMM d, yyyy")}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>

        {/* Content Section */}
        <section className="container mx-auto px-4 md:px-8 max-w-7xl py-20">
            <div className="flex flex-col lg:flex-row gap-16">
                <article className="flex-1 max-w-4xl">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="prose prose-2xl prose-gray max-w-none prose-headings:font-display prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-600 prose-p:leading-relaxed prose-a:text-primary prose-a:font-bold prose-a:no-underline hover:prose-a:underline prose-img:rounded-[2.5rem] prose-img:shadow-2xl prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-gray-50 prose-blockquote:p-8 prose-blockquote:rounded-r-3xl prose-blockquote:not-italic"
                    >
                        <ReactMarkdown>{blog.content}</ReactMarkdown>
                    </motion.div>

                    {/* Social Meta */}
                    <div className="mt-16 pt-12 border-t border-gray-100 flex items-center justify-between">
                        <div className="flex gap-4">
                            <button 
                                onClick={() => setIsLiked(!isLiked)}
                                className={`p-4 rounded-2xl border transition-all flex items-center gap-2 font-bold ${isLiked ? 'bg-red-50 border-red-100 text-red-500 scale-105' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'}`}
                            >
                                <FiHeart fill={isLiked ? "currentColor" : "transparent"} size={20} />
                                {isLiked ? 'Favorited' : 'Like'}
                            </button>
                            <button className="p-4 rounded-2xl border border-gray-100 text-gray-400 hover:border-gray-200 transition-all flex items-center gap-2 font-bold">
                                <FiShare2 size={20} />
                                Share
                            </button>
                        </div>
                    </div>
                </article>

                <aside className="w-full lg:w-1/3 space-y-12">
                    {/* Newsletter Widget */}
                    <div className="bg-gray-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:scale-125"></div>
                        <h3 className="text-2xl font-display font-bold mb-4 relative z-10">Stay Inspired</h3>
                        <p className="text-gray-400 text-sm mb-8 leading-relaxed relative z-10">Subscribe to our weekly editorial for trends and behind-the-scenes stories.</p>
                        <form className="relative z-10 space-y-4">
                            <input 
                                type="email" 
                                placeholder="Your email address" 
                                className="w-full bg-white/10 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-primary/50 transition-colors"
                            />
                            <button className="w-full bg-primary text-white font-bold py-4 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                                Join Editorial
                            </button>
                        </form>
                    </div>

                    {/* Related Articles */}
                    <div className="bg-white border border-gray-100 rounded-[2.5rem] p-10">
                        <h3 className="text-xl font-display font-bold mb-8 flex items-center justify-between">
                            More Stories
                            <Link href="/blog" className="text-xs font-bold text-primary hover:underline">See all</Link>
                        </h3>
                        <div className="space-y-8">
                            {(otherBlogs || []).filter(b => b.slug !== slug).slice(0, 3).map((item, idx) => (
                                <Link 
                                    key={item._id} 
                                    href={`/blog/${item.slug}`}
                                    className="group block"
                                >
                                    <div className="relative aspect-video rounded-3xl overflow-hidden mb-4 bg-gray-50 border border-gray-50">
                                        {item.coverImage && (
                                            <Image 
                                                src={item.coverImage} 
                                                alt={item.title} 
                                                fill 
                                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                            />
                                        )}
                                        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
                                    </div>
                                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">
                                        {format(new Date(item.createdAt), "MMM d, yyyy")}
                                    </p>
                                    <h4 className="font-bold text-gray-900 group-hover:text-primary transition-colors leading-snug">
                                        {item.title}
                                    </h4>
                                </Link>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>
        </section>

        {/* Floating Action Menu */}
        <div className="fixed bottom-10 right-10 z-40 hidden md:block">
            <motion.div 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/80 backdrop-blur-xl border border-gray-100 p-2 rounded-2xl shadow-2xl flex items-center gap-1"
            >
                <Link href="/blog" className="p-3 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all" title="All Posts">
                    <FiArrowLeft size={18} />
                </Link>
                <div className="w-[1px] h-6 bg-gray-100 mx-1"></div>
                <button className="p-3 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all" title="Share Article">
                    <FiShare2 size={18} />
                </button>
            </motion.div>
        </div>
    </main>
  );
}
