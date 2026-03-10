"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { FiChevronDown, FiHelpCircle, FiSearch, FiMessageCircle } from "react-icons/fi";
import Link from "next/link";

export default function FAQPage() {
  const [openId, setOpenId] = useState(null);
  const [search, setSearch] = useState("");

  const { data: faqs, isLoading } = useQuery({
    queryKey: ["faqs"],
    queryFn: async () => {
      const { data } = await api.get("/faqs");
      return data;
    },
  });

  const filteredFaqs = faqs?.filter(f => 
    f.question.toLowerCase().includes(search.toLowerCase()) || 
    f.answer.toLowerCase().includes(search.toLowerCase()) ||
    f.category.toLowerCase().includes(search.toLowerCase())
  );

  const categories = [...new Set(faqs?.map(f => f.category) || [])];

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
    </div>
  );

  return (
    <main className="bg-white min-h-screen pt-32 lg:pt-40">
        {/* Hero Section */}
        <section className="container mx-auto px-4 md:px-8 max-w-4xl text-center mb-20">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-xs font-black uppercase tracking-widest mb-6">
                    <FiHelpCircle /> Help Center
                </div>
                <h1 className="text-4xl md:text-6xl font-display font-bold text-gray-900 mb-6 leading-tight">
                    How can we help?
                </h1>
                <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto mb-10">
                    Find quick answers to your questions about our products, shipping, and more.
                </p>

                <div className="relative max-w-xl mx-auto group">
                    <div className="absolute inset-y-0 left-6 flex items-center text-gray-400 group-focus-within:text-primary transition-colors">
                        <FiSearch size={20} />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Search for answers..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-100 rounded-[2rem] pl-16 pr-8 py-6 text-sm focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                    />
                </div>
            </motion.div>
        </section>

        {/* FAQ Content */}
        <section className="container mx-auto px-4 md:px-8 max-w-4xl pb-32">
            <div className="space-y-16">
                {categories.map((category) => {
                    const categoryFaqs = filteredFaqs?.filter(f => f.category === category);
                    if (categoryFaqs?.length === 0) return null;

                    return (
                        <div key={category} className="space-y-8">
                            <h2 className="text-2xl font-display font-bold text-gray-900 px-4 border-l-4 border-primary">
                                {category}
                            </h2>
                            <div className="space-y-4">
                                {categoryFaqs.map((faq) => (
                                    <div 
                                        key={faq._id}
                                        className={`bg-white border rounded-[2rem] overflow-hidden transition-all duration-300 ${
                                            openId === faq._id 
                                            ? "border-primary/20 shadow-xl shadow-primary/5" 
                                            : "border-gray-100 hover:border-gray-200"
                                        }`}
                                    >
                                        <button 
                                            onClick={() => setOpenId(openId === faq._id ? null : faq._id)}
                                            className="w-full text-left p-8 flex items-start justify-between gap-6"
                                        >
                                            <span className="font-bold text-gray-900 md:text-lg leading-snug">
                                                {faq.question}
                                            </span>
                                            <div className={`mt-1.5 p-2 rounded-xl transition-all ${
                                                openId === faq._id 
                                                ? "bg-primary text-white rotate-180 shadow-lg shadow-primary/20" 
                                                : "bg-gray-50 text-gray-400"
                                            }`}>
                                                <FiChevronDown />
                                            </div>
                                        </button>
                                        
                                        <AnimatePresence>
                                            {openId === faq._id && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                                >
                                                    <div className="px-8 pb-10 text-gray-600 leading-relaxed md:text-lg">
                                                        <div className="h-[1px] bg-gray-50 mb-8"></div>
                                                        {faq.answer}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}

                {filteredFaqs?.length === 0 && (
                    <div className="text-center py-20 bg-gray-50 rounded-[3rem] border border-gray-100 border-dashed">
                        <p className="text-xl font-display font-medium text-gray-900 mb-2">No results found for &quot;{search}&quot;</p>
                        <p className="text-gray-500">Try a different keyword or contact our support team.</p>
                    </div>
                )}
            </div>

            {/* Support CTA */}
            <div className="mt-24 p-12 bg-gray-900 rounded-[3rem] text-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32 transition-transform group-hover:scale-125 duration-1000"></div>
                
                <h3 className="text-3xl font-display font-bold text-white mb-6 relative z-10">Still have questions?</h3>
                <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto relative z-10">
                    Our team is ready to assist you with anything you need. We&apos;re available 24/7.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
                    <Link href="/contact" className="px-10 py-5 bg-white text-gray-900 rounded-[2rem] font-bold hover:scale-105 transition-all flex items-center justify-center gap-2">
                        <FiMessageCircle /> Contact Support
                    </Link>
                    <Link href="/about" className="px-10 py-5 bg-white/10 text-white rounded-[2rem] font-bold hover:bg-white/20 backdrop-blur-md transition-all">
                        Learn More
                    </Link>
                </div>
            </div>
        </section>
    </main>
  );
}
