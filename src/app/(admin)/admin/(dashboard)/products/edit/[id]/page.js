"use client";

import { useState, useEffect, use } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { 
  FiArrowLeft, 
  FiSave, 
  FiPlus, 
  FiTrash2, 
  FiImage, 
  FiType, 
  FiTag, 
  FiDollarSign, 
  FiGrid,
  FiUpload,
  FiGlobe
} from "react-icons/fi";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { SectionLoader } from "@/components/Loader";
import { useSettingsStore } from "@/store/settingsStore";
import CategorySelector from "@/components/admin/CategorySelector";
import RichTextEditor from "@/components/admin/RichTextEditor";
import imageCompression from "browser-image-compression";

export default function EditProduct({ params }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = use(params);
  const getCurrencySymbol = useSettingsStore((state) => state.getCurrencySymbol);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const [product, setProduct] = useState({
    name: "",
    slug: "",
    sku: "",
    description: "",
    price: "",
    mrp: "",
    discount: "",
    category: "",
    images: [""],
    videos: [""],
    variants: [],
    stock: 0,
    hasVariants: false,
    metaTitle: "",
    metaDescription: "",
    metaKeywords: ""
  });

  const [newVariant, setNewVariant] = useState({ color: "", size: "", length: "", price: "", mrp: "", discount: "", stock: "" });

  const { data: categories } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data } = await api.get("/categories");
      return data;
    },
  });

  const { data: fetchedProduct, isLoading } = useQuery({
    queryKey: ["admin-product", id],
    queryFn: async () => {
      const { data } = await api.get(`/products/${id}?admin=true`);
      return data;
    },
  });

  useEffect(() => {
    if (fetchedProduct) {
      setProduct({
        ...fetchedProduct,
        slug: fetchedProduct.slug || "",
        sku: fetchedProduct.sku || "",
        category: typeof fetchedProduct.category === 'object' ? fetchedProduct.category?._id : fetchedProduct.category || "",
        images: fetchedProduct.images?.length ? fetchedProduct.images : [""],
        videos: fetchedProduct.videos?.length ? fetchedProduct.videos : [""],
        variants: fetchedProduct.variants || [],
        hasVariants: fetchedProduct.hasVariants || false,
        stock: fetchedProduct.stock || 0,
        mrp: fetchedProduct.mrp || "",
        discount: fetchedProduct.discount || "",
        metaTitle: fetchedProduct.metaTitle || "",
        metaDescription: fetchedProduct.metaDescription || "",
        metaKeywords: fetchedProduct.metaKeywords || ""
      });
    }
  }, [fetchedProduct]);

  const updateProductMutation = useMutation({
    mutationFn: async (data) => {
      const { data: response } = await api.put(`/products/${id}`, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["admin-products"]);
      queryClient.invalidateQueries(["admin-product", id]);
      toast.success("Product updated successfully!");
      router.push("/admin/products");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update product");
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let updatedProduct = { ...product, [name]: value };

    // Auto-calculate logic for single product
    if (name === "price" || name === "mrp") {
      const price = name === "price" ? Number(value) : Number(product.price);
      const mrp = name === "mrp" ? Number(value) : Number(product.mrp);
      if (mrp > 0 && price > 0) {
        updatedProduct.discount = Math.round(((mrp - price) / mrp) * 100);
      }
    } else if (name === "discount") {
      const discount = Number(value);
      const mrp = Number(product.mrp);
      if (mrp > 0 && discount >= 0) {
        updatedProduct.price = Math.round(mrp * (1 - discount / 100));
      }
    }

    setProduct(updatedProduct);
  };

  const handleImageChange = (index, value) => {
    const newImages = [...product.images];
    newImages[index] = value;
    setProduct({ ...product, images: newImages });
  };

  const addImageField = () => {
    setProduct({ ...product, images: [...product.images, ""] });
  };

  const removeImageField = (index) => {
    const newImages = product.images.filter((_, i) => i !== index);
    setProduct({ ...product, images: newImages.length ? newImages : [""] });
  };

  const handleVideoChange = (index, value) => {
    const newVideos = [...product.videos];
    newVideos[index] = value;
    setProduct({ ...product, videos: newVideos });
  };

  const addVideoField = () => {
    setProduct({ ...product, videos: [...product.videos, ""] });
  };

  const removeVideoField = (index) => {
    const newVideos = product.videos.filter((_, i) => i !== index);
    setProduct({ ...product, videos: newVideos.length ? newVideos : [""] });
  };

  const addVariant = () => {
    if (!newVariant.color || (!newVariant.size && !newVariant.length) || !newVariant.price) {
      return toast.error("Please fill color, size/length and price for variant");
    }
    setProduct({ 
      ...product, 
      variants: [...product.variants, { 
        ...newVariant, 
        stock: Number(newVariant.stock) || 0,
        price: Number(newVariant.price) || 0,
        mrp: Number(newVariant.mrp) || undefined,
        discount: Number(newVariant.discount) || undefined
      }] 
    });
    setNewVariant({ color: "", size: "", length: "", price: "", mrp: "", discount: "", stock: "" });
  };

  const removeVariant = (index) => {
    const newVariants = product.variants.filter((_, i) => i !== index);
    setProduct({ ...product, variants: newVariants });
  };

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...product.variants];
    const updatedVariant = {
      ...newVariants[index],
      [field]: field === 'stock' || field === 'price' || field === 'mrp' || field === 'discount' ? Number(value) : value
    };

    // Auto-calculate for variant list
    if (field === "price" || field === "mrp") {
      const price = field === "price" ? Number(value) : Number(updatedVariant.price);
      const mrp = field === "mrp" ? Number(value) : Number(updatedVariant.mrp);
      if (mrp > 0 && price > 0) {
        updatedVariant.discount = Math.round(((mrp - price) / mrp) * 100);
      }
    } else if (field === "discount") {
      const discount = Number(value);
      const mrp = Number(updatedVariant.mrp);
      if (mrp > 0 && discount >= 0) {
        updatedVariant.price = Math.round(mrp * (1 - discount / 100));
      }
    }

    newVariants[index] = updatedVariant;
    setProduct({ ...product, variants: newVariants });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (product.hasVariants && product.variants.length === 0) {
      return toast.error("Please add at least one variant");
    }
    // Calculate total stock from variants
    const totalStock = product.hasVariants 
        ? product.variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0)
        : (Number(product.stock) || 0);
    
    const formattedProduct = {
      ...product,
      price: Number(product.price) || 0,
      mrp: Number(product.mrp) || undefined,
      discount: Number(product.discount) || undefined,
      stock: totalStock,
      variants: product.variants.map(v => ({
        ...v,
        price: Number(v.price) || 0,
        mrp: Number(v.mrp) || undefined,
        discount: Number(v.discount) || undefined,
        stock: Number(v.stock) || 0
      }))
    };

    updateProductMutation.mutate(formattedProduct);
  };

  const [uploading, setUploading] = useState(false);
  const [videoUploading, setVideoUploading] = useState(false);

  const handleFileUpload = async (e, index, type = 'image') => {
    let file = e.target.files[0];
    if (!file) return;

    if (type === 'video') setVideoUploading(true);
    else {
      setUploading(true);
      // Compress image before upload
      if (file.type.startsWith('image/')) {
        try {
          const options = {
            maxSizeMB: 1, // Max 1MB
            maxWidthOrHeight: 1920,
            useWebWorker: true
          };
          const compressedFile = await imageCompression(file, options);
          file = compressedFile;
        } catch (error) {
          console.error("Image compression error:", error);
          toast.error("Warning: Could not compress image, uploading original.");
        }
      }
    }

    const formData = new FormData();
    formData.append("file", file);
    
    try {
      const res = await fetch("/api/upload", {
          method: "POST",
          body: formData
      });
      const data = await res.json();
      
      if (res.ok) {
          if (type === 'video') {
              handleVideoChange(index, data.url);
              toast.success("Video uploaded!");
          } else {
              handleImageChange(index, data.url);
              toast.success("Image uploaded!");
          }
      } else {
          toast.error(`Failed to upload ${type}`);
      }
    } catch (error) {
      toast.error(`Failed to upload ${type}`);
    } finally {
      if (type === 'video') setVideoUploading(false);
      else setUploading(false);
    }
  };

  if (isLoading) return <SectionLoader className="min-h-[60vh]" />;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-12">
        <Link 
          href="/admin/products"
          className="flex items-center gap-2 text-gray-500 hover:text-primary font-bold transition-colors"
        >
          <FiArrowLeft /> Back to products
        </Link>
        <button 
          onClick={handleSubmit}
          disabled={updateProductMutation.isPending}
          className="bg-primary hover:bg-secondary text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50"
        >
          <FiSave /> {updateProductMutation.isPending ? "Updating..." : "Update Product"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Basic Information */}
        <section className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-black/5 border border-gray-100">
          <h2 className="text-2xl font-display font-bold mb-8 flex items-center gap-3">
            <FiType className="text-primary" /> Basic Information
          </h2>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Product Name</label>
              <input 
                type="text" 
                name="name"
                value={product.name}
                onChange={handleInputChange}
                placeholder="e.g. Essential Oversized Tee"
                className="w-full bg-surface border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 px-6 py-4 rounded-2xl outline-none transition-all"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Slug (URL)</label>
              <input 
                type="text" 
                name="slug"
                value={product.slug}
                onChange={handleInputChange}
                placeholder="e.g. essential-oversized-tee"
                className="w-full bg-surface border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 px-6 py-4 rounded-2xl outline-none transition-all font-mono text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">SKU</label>
              <input 
                type="text" 
                name="sku"
                value={product.sku}
                onChange={handleInputChange}
                placeholder="e.g. TEE-BLK-XL"
                className="w-full bg-surface border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 px-6 py-4 rounded-2xl outline-none transition-all font-mono text-sm"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Category</label>
                  {categories ? (
                    <CategorySelector 
                        categories={categories}
                        value={product.category}
                        onChange={(val) => setProduct({...product, category: val})}
                    />
                  ) : (
                    <p>Loading categories...</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Selling Price ({mounted ? getCurrencySymbol() : "..."})</label>
                  <input 
                    type="number" 
                    name="price"
                    value={product.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    className="w-full bg-surface border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 px-6 py-4 rounded-2xl outline-none transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Base Price / MRP ({mounted ? getCurrencySymbol() : "..."})</label>
                  <input 
                    type="number" 
                    name="mrp"
                    value={product.mrp}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    className="w-full bg-surface border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 px-6 py-4 rounded-2xl outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Discount (%)</label>
                  <input 
                    type="number" 
                    name="discount"
                    value={product.discount}
                    onChange={handleInputChange}
                    placeholder="e.g. 10"
                    className="w-full bg-surface border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 px-6 py-4 rounded-2xl outline-none transition-all"
                  />
                </div>
            </div>

            {/* Product Type Toggle */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gray-50 rounded-2xl border border-gray-100">
               <div>
                 <p className="font-bold text-gray-900">Product Type</p>
                 <p className="text-xs text-gray-500 mt-1">Does this product come in multiple variations like size or color?</p>
               </div>
               <div className="flex bg-white rounded-xl p-1 border border-gray-200">
                 <button 
                   type="button" 
                   onClick={() => setProduct({...product, hasVariants: false})}
                   className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${!product.hasVariants ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-gray-500 hover:bg-gray-50'}`}
                 >
                   Single Product
                 </button>
                 <button 
                   type="button"
                   onClick={() => setProduct({...product, hasVariants: true})}
                   className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${product.hasVariants ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-gray-500 hover:bg-gray-50'}`}
                 >
                   Variant Product
                 </button>
               </div>
            </div>

            {/* Single Product Stock */}
            {!product.hasVariants && (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Available Stock</label>
                  <input 
                    type="number" 
                    name="stock"
                    value={product.stock}
                    onChange={handleInputChange}
                    placeholder="0"
                    className="w-full bg-surface border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 px-6 py-4 rounded-2xl outline-none transition-all"
                    required={!product.hasVariants}
                  />
                </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Description</label>
              <RichTextEditor 
                value={product.description}
                onChange={(value) => setProduct({...product, description: value})}
                placeholder="Describe the product features, fit and material..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Manufacturer Info</label>
              <RichTextEditor 
                value={product.manufacturerInfo || ""}
                onChange={(value) => setProduct({...product, manufacturerInfo: value})}
                placeholder="Details about manufacturer, care instructions, etc..."
              />
            </div>
          </div>
        </section>

        {/* Media */}
        <section className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-black/5 border border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-display font-bold flex items-center gap-3">
              <FiImage className="text-primary" /> Product Media
            </h2>
            <button 
              type="button" 
              onClick={addImageField}
              className="text-primary font-bold text-sm flex items-center gap-2 hover:underline"
            >
              <FiPlus /> Add Image URL
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {product.images.map((img, idx) => (
              <div key={idx} className="space-y-2">
                <div className="relative group">
                  <input 
                    type="text" 
                    value={img}
                    onChange={(e) => handleImageChange(idx, e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-surface border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 px-6 py-4 rounded-2xl outline-none transition-all pr-12"
                  />
                  <button 
                    onClick={() => removeImageField(idx)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
                
                <div className="flex items-center gap-2">
                    <label className="cursor-pointer bg-gray-50 hover:bg-gray-100 text-gray-600 px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 border border-gray-200">
                        <FiUpload /> Upload
                        <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, idx)}
                            disabled={uploading}
                        />
                    </label>
                    {uploading && <span className="text-xs text-primary animate-pulse">Uploading...</span>}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-6">Paste direct links or upload images.</p>
        </section>

        {/* Videos */}
        <section className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-black/5 border border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-display font-bold flex items-center gap-3">
              <FiImage className="text-primary" /> Product Videos
            </h2>
            <button 
              type="button" 
              onClick={addVideoField}
              className="text-primary font-bold text-sm flex items-center gap-2 hover:underline"
            >
              <FiPlus /> Add Video URL
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {product.videos.map((vid, idx) => (
              <div key={idx} className="space-y-2">
                <div className="relative group">
                  <input 
                    type="text" 
                    value={vid}
                    onChange={(e) => handleVideoChange(idx, e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-surface border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 px-6 py-4 rounded-2xl outline-none transition-all pr-12"
                  />
                  <button 
                    onClick={() => removeVideoField(idx)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
                
                <div className="flex items-center gap-2">
                    <label className="cursor-pointer bg-gray-50 hover:bg-gray-100 text-gray-600 px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 border border-gray-200">
                        <FiUpload /> Upload Video
                        <input 
                            type="file" 
                            className="hidden" 
                            accept="video/*"
                            onChange={(e) => handleFileUpload(e, idx, 'video')}
                            disabled={videoUploading}
                        />
                    </label>
                    {videoUploading && <span className="text-xs text-primary animate-pulse">Uploading...</span>}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-6">Paste direct links or upload videos (mp4, webm, etc).</p>
        </section>

        {/* SEO & Visibility */}
        <section className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-black/5 border border-gray-100">
          <h2 className="text-2xl font-display font-bold mb-8 flex items-center gap-3">
            <FiGlobe className="text-primary" /> SEO & Visibility
          </h2>
          <div className="space-y-6 bg-surface p-6 rounded-3xl border border-gray-100">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Meta Title</label>
              <input 
                type="text" 
                name="metaTitle"
                value={product.metaTitle}
                onChange={handleInputChange}
                placeholder="Leave blank to use product name"
                className="w-full bg-white border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 px-6 py-4 rounded-2xl outline-none transition-all"
              />
              <p className="text-xs text-gray-400">Search engines will use this title. Max 60 characters recommended.</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Meta Description</label>
              <textarea 
                name="metaDescription"
                value={product.metaDescription}
                onChange={handleInputChange}
                placeholder="Briefly describe the product for search engine results..."
                rows={3}
                className="w-full bg-white border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 px-6 py-4 rounded-2xl outline-none transition-all resize-none"
              />
              <p className="text-xs text-gray-400">Search engines will use this description. Expected between 150-160 characters.</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Meta Keywords</label>
              <input 
                type="text" 
                name="metaKeywords"
                value={product.metaKeywords}
                onChange={handleInputChange}
                placeholder="e.g. t-shirt, cotton, black, oversized"
                className="w-full bg-white border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 px-6 py-4 rounded-2xl outline-none transition-all"
              />
              <p className="text-xs text-gray-400">Comma-separated tags for better indexing.</p>
            </div>
          </div>
        </section>

        {/* Variants */}
        {product.hasVariants && (
        <section className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-black/5 border border-gray-100">
          <h2 className="text-2xl font-display font-bold mb-8 flex items-center gap-3">
            <FiGrid className="text-primary" /> Variants & Inventory
          </h2>
          
          {/* New Variant Form */}
          <div className="bg-surface rounded-3xl p-6 mb-8 border border-gray-100 grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Color</label>
              <input 
                type="text" 
                value={newVariant.color}
                onChange={(e) => setNewVariant({...newVariant, color: e.target.value})}
                placeholder="e.g. Black"
                className="w-full bg-white border border-gray-100 px-4 py-3 rounded-xl outline-none text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Size</label>
              <input 
                type="text" 
                value={newVariant.size || ""}
                onChange={(e) => setNewVariant({...newVariant, size: e.target.value})}
                placeholder="e.g. XL"
                className="w-full bg-white border border-gray-100 px-4 py-3 rounded-xl outline-none text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Length</label>
              <input 
                type="text" 
                value={newVariant.length || ""}
                onChange={(e) => setNewVariant({...newVariant, length: e.target.value})}
                placeholder="e.g. 5m"
                className="w-full bg-white border border-gray-100 px-4 py-3 rounded-xl outline-none text-sm"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Price</label>
                <input 
                  type="number" 
                  value={newVariant.price}
                  onChange={(e) => {
                    const price = Number(e.target.value);
                    const mrp = Number(newVariant.mrp);
                    let discount = newVariant.discount;
                    if (mrp > 0 && price > 0) {
                      discount = Math.round(((mrp - price) / mrp) * 100);
                    }
                    setNewVariant({...newVariant, price: e.target.value, discount});
                  }}
                  placeholder="29"
                  className="w-full bg-white border border-gray-100 px-4 py-3 rounded-xl outline-none text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase">MRP</label>
                <input 
                  type="number" 
                  value={newVariant.mrp}
                  onChange={(e) => {
                    const mrp = Number(e.target.value);
                    const price = Number(newVariant.price);
                    let discount = newVariant.discount;
                    if (mrp > 0 && price > 0) {
                      discount = Math.round(((mrp - price) / mrp) * 100);
                    }
                    setNewVariant({...newVariant, mrp: e.target.value, discount});
                  }}
                  placeholder="39"
                  className="w-full bg-white border border-gray-100 px-4 py-3 rounded-xl outline-none text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Stock</label>
                <input 
                  type="number" 
                  value={newVariant.stock}
                  onChange={(e) => setNewVariant({...newVariant, stock: e.target.value})}
                  placeholder="50"
                  className="w-full bg-white border border-gray-100 px-4 py-3 rounded-xl outline-none text-sm"
                />
              </div>
            </div>
            <div className="md:col-span-1 space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Discount (%)</label>
                <input 
                  type="number" 
                  value={newVariant.discount || ""}
                  onChange={(e) => {
                    const discount = Number(e.target.value);
                    const mrp = Number(newVariant.mrp);
                    let price = newVariant.price;
                    if (mrp > 0 && discount >= 0) {
                      price = Math.round(mrp * (1 - discount / 100));
                    }
                    setNewVariant({...newVariant, discount: e.target.value, price});
                  }}
                  placeholder="0"
                  className="w-full bg-white border border-gray-100 px-4 py-3 rounded-xl outline-none text-sm"
                />
            </div>
            <button 
              type="button" 
              onClick={addVariant}
              className="bg-gray-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all"
            >
              <FiPlus /> Add Variant
            </button>
          </div>

          {/* Variants Table */}
          <div className="space-y-3">
            {product.variants.map((v, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-surface rounded-2xl border border-gray-50 group">
                <div className="flex gap-4 flex-1 items-center">
                  <div className="flex items-center gap-2 min-w-[100px]">
                    <div className="w-3 h-3 rounded-full bg-gray-900" style={{ backgroundColor: v.color?.toLowerCase() || 'gray' }}></div>
                    <span className="font-bold text-gray-900">{v.color}</span>
                  </div>
                  {v.size && <span className="font-bold text-gray-500 min-w-[60px]">Size: {v.size}</span>}
                  {v.length && <span className="font-bold text-gray-500 min-w-[60px]">Length: {v.length}</span>}
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400 uppercase">Price</span>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{mounted ? getCurrencySymbol() : ""}</span>
                        <input 
                            type="number" 
                            value={v.price} 
                            onChange={(e) => handleVariantChange(i, 'price', e.target.value)}
                            className="w-24 bg-white border border-gray-100 pl-6 pr-2 py-2 rounded-lg text-sm font-bold text-gray-900 outline-none focus:border-primary transition-colors"
                        />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400 uppercase">MRP</span>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{mounted ? getCurrencySymbol() : ""}</span>
                        <input 
                            type="number" 
                            value={v.mrp || ""} 
                            onChange={(e) => handleVariantChange(i, 'mrp', e.target.value)}
                            className="w-24 bg-white border border-gray-100 pl-6 pr-2 py-2 rounded-lg text-sm font-bold text-gray-900 outline-none focus:border-primary transition-colors"
                        />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400 uppercase">Disc %</span>
                    <input 
                        type="number" 
                        value={v.discount || ""} 
                        onChange={(e) => handleVariantChange(i, 'discount', e.target.value)}
                        className="w-16 bg-white border border-gray-100 px-2 py-2 rounded-lg text-sm font-bold text-gray-900 outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-400 uppercase">Stock</span>
                    <input 
                        type="number" 
                        value={v.stock} 
                        onChange={(e) => handleVariantChange(i, 'stock', e.target.value)}
                        className="w-20 bg-white border border-gray-100 px-3 py-2 rounded-lg text-sm font-bold text-gray-900 outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>
                <button 
                  onClick={() => removeVariant(i)}
                  className="p-2 text-gray-300 hover:text-red-500 transition-colors ml-4"
                >
                  <FiTrash2 />
                </button>
              </div>
            ))}
            {product.variants.length === 0 && (
              <p className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-100 rounded-[2rem]">
                No variants added yet. Define color/size combinations.
              </p>
            )}
          </div>
        </section>
        )}
      </div>
    </div>
  );
}
