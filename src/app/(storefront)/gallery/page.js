"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { SectionLoader } from "@/components/Loader";
import { FiImage, FiMaximize2 } from "react-icons/fi";


export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedImage, setSelectedImage] = useState(null);

  // Fetch Categories
  const { data: categories, isLoading: isLoadingCats } = useQuery({
    queryKey: ["gallery-categories"],
    queryFn: async () => {
      const { data } = await api.get("/gallery/categories");
      return data || [];
    },
  });

  const { data: images, isLoading } = useQuery({
    queryKey: ["gallery", activeCategory],
    queryFn: async () => {
      const url = activeCategory === "All" ? "/gallery?activeOnly=true" : `/gallery?category=${activeCategory}&activeOnly=true`;
      const { data } = await api.get(url);
      return data;
    },
  });

  const allCategories = ["All", ...(categories?.map(c => ({ id: c._id, name: c.name })) || [])];

  return (
    <div className="min-h-screen bg-[#fcfcfd] pt-24 pb-20">
      {/* Hero Section */}
      <section className="container mx-auto px-6 mb-16 text-center">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6 }}
        >
          <span className="text-primary font-bold tracking-[0.2em] uppercase text-xs mb-4 block">Visual Journey</span>
          <h1 className="text-5xl md:text-7xl font-display font-bold text-gray-900 mb-6 italic">Our Gallery</h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg leading-relaxed">
            A curated collection of our finest moments, traditional crafts, and vibrant community.
          </p>
        </motion.div>
      </section>

      {/* Category Tabs */}
      <section className="container mx-auto px-6 mb-12">
        <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6">
          {allCategories.map((category) => {
            const categoryId = typeof category === "string" ? category : category.id;
            const categoryName = typeof category === "string" ? category : category.name;
            const isActive = activeCategory === categoryId;
            
            return (
              <button
                key={categoryId}
                onClick={() => setActiveCategory(categoryId)}
                className={`relative px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 isolate ${
                  isActive
                    ? "text-white"
                    : "text-gray-500 hover:text-gray-900 bg-white border border-gray-100 shadow-sm"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary rounded-full z-[-1] shadow-lg shadow-primary/30"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                {categoryName}
              </button>
            );
          })}
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="container mx-auto px-6">
        {isLoading || isLoadingCats ? (
          <SectionLoader className="min-h-[40vh]" />
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-3 lg:grid-cols-6 xl:grid-cols-8 gap-2 md:gap-4"
          >
            <AnimatePresence mode="popLayout">
              {images?.map((image, index) => {
                const catName = typeof image.category === 'object' ? image.category?.name : (categories?.find(c => c._id === image.category)?.name || image.category || "General");
                
                return (
                  <motion.div
                    key={image._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="group relative aspect-[4/5] bg-white rounded-lg md:rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer"
                    onClick={() => setSelectedImage(image)}
                  >
                    <Image
                      src={image.imageUrl}
                      alt={image.caption || "Gallery image"}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-2 md:p-4">
                      <motion.div
                          initial={{ y: 10, opacity: 0 }}
                          whileInView={{ y: 0, opacity: 1 }}
                          className="space-y-0.5 md:space-y-1"
                      >
                          <span className="text-primary text-[6px] md:text-[8px] font-black uppercase tracking-widest">{catName}</span>
                          {image.caption && <p className="text-white font-medium text-[8px] md:text-sm leading-tight line-clamp-2">{image.caption}</p>}
                      </motion.div>
                    </div>


                    <div className="absolute top-2 right-2 md:top-4 md:right-4 opacity-0 group-hover:opacity-100 transition-all duration-500">
                       <div className="w-6 h-6 md:w-10 md:h-10 bg-white/20 backdrop-blur-md rounded-md md:rounded-xl flex items-center justify-center text-white border border-white/30">
                          <FiMaximize2 size={12} className="md:w-4 md:h-4" />
                       </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {images?.length === 0 && (
              <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border border-dashed border-gray-200">
                <FiImage className="mx-auto text-gray-300 mb-6" size={64} />
                <h3 className="text-2xl font-display font-bold text-gray-900 mb-2">Moments yet to be captured</h3>
                <p className="text-gray-500">Check back soon for new updates in this category.</p>
              </div>
            )}
          </motion.div>
        )}
      </section>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-12"
            onClick={() => setSelectedImage(null)}
          >
            <motion.button
               whileHover={{ scale: 1.1 }}
               whileTap={{ scale: 0.9 }}
               className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors z-[110]"
               onClick={() => setSelectedImage(null)}
            >
               <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </motion.button>

            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-6xl h-full max-h-full flex flex-col md:flex-row gap-8 items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative flex-1 w-full h-[60vh] md:h-full rounded-[2rem] overflow-hidden shadow-2xl">
                <Image
                  src={selectedImage.imageUrl}
                  alt={selectedImage.caption || "Gallery image"}
                  fill
                  className="object-contain"
                />
              </div>
              
              <div className="md:w-80 w-full text-white space-y-6">
                <div>
                   <span className="text-primary font-bold uppercase tracking-widest text-xs block mb-2">
                     {typeof selectedImage.category === 'object' ? selectedImage.category?.name : (categories?.find(c => c._id === selectedImage.category)?.name || selectedImage.category || "General")}
                   </span>
                   <h2 className="text-3xl font-display font-bold italic">{selectedImage.caption || "Untitled Moment"}</h2>
                </div>
                <div className="h-px bg-white/10 w-full" />
                <p className="text-white/60 text-sm leading-relaxed">
                  This stunning visual is part of our {(typeof selectedImage.category === 'object' ? selectedImage.category?.name : (categories?.find(c => c._id === selectedImage.category)?.name || selectedImage.category || "General")).toLowerCase()} collection, showcasing the elegance and detail we strive for.
                </p>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setSelectedImage(null)}
                        className="bg-white text-black px-8 py-3 rounded-full text-sm font-bold hover:bg-primary hover:text-white transition-all w-full md:w-auto"
                    >
                        Close View
                    </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
