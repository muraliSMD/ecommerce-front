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
  FiUpload
} from "react-icons/fi";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { SectionLoader } from "@/components/Loader";
import { useSettingsStore } from "@/store/settingsStore";

export default function EditProduct({ params }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id } = use(params);
  const getCurrencySymbol = useSettingsStore((state) => state.getCurrencySymbol);
  
  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    images: [""],
    variants: [],
    stock: 0
  });

  const [newVariant, setNewVariant] = useState({ color: "", size: "", price: "", stock: "" });

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
      const { data } = await api.get(`/products/${id}`);
      return data;
    },
  });

  useEffect(() => {
    if (fetchedProduct) {
      setProduct({
        ...fetchedProduct,
        images: fetchedProduct.images?.length ? fetchedProduct.images : [""],
        variants: fetchedProduct.variants || []
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
    setProduct({ ...product, [name]: value });
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

  const addVariant = () => {
    if (!newVariant.color || !newVariant.size || !newVariant.price) {
      return toast.error("Please fill color, size and price for variant");
    }
    setProduct({ 
      ...product, 
      variants: [...product.variants, { ...newVariant, stock: Number(newVariant.stock) || 0, price: Number(newVariant.price) }] 
    });
    setNewVariant({ color: "", size: "", price: "", stock: "" });
  };

  const removeVariant = (index) => {
    const newVariants = product.variants.filter((_, i) => i !== index);
    setProduct({ ...product, variants: newVariants });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (product.variants.length === 0) {
      return toast.error("Please add at least one variant");
    }
    // Calculate total stock from variants
    const totalStock = product.variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0);
    updateProductMutation.mutate({ ...product, stock: totalStock });
  };

  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      const res = await fetch("/api/upload", {
          method: "POST",
          body: formData
      });
      const data = await res.json();
      
      if (res.ok) {
          handleImageChange(index, data.url);
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Category</label>
                  <select 
                    name="category"
                    value={product.category}
                    onChange={handleInputChange}
                    className="w-full bg-surface border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 px-6 py-4 rounded-2xl outline-none transition-all appearance-none"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories?.map((cat) => (
                      <option key={cat._id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Base Price ({getCurrencySymbol()})</label>
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
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Description</label>
              <textarea 
                name="description"
                value={product.description}
                onChange={handleInputChange}
                placeholder="Describe the product features, fit and material..."
                rows={4}
                className="w-full bg-surface border border-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/10 px-6 py-4 rounded-2xl outline-none transition-all resize-none"
                required
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

        {/* Variants */}
        <section className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-black/5 border border-gray-100">
          <h2 className="text-2xl font-display font-bold mb-8 flex items-center gap-3">
            <FiGrid className="text-primary" /> Variants & Inventory
          </h2>
          
          {/* New Variant Form */}
          <div className="bg-surface rounded-3xl p-6 mb-8 border border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
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
                value={newVariant.size}
                onChange={(e) => setNewVariant({...newVariant, size: e.target.value})}
                placeholder="e.g. XL"
                className="w-full bg-white border border-gray-100 px-4 py-3 rounded-xl outline-none text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Price</label>
                <input 
                  type="number" 
                  value={newVariant.price}
                  onChange={(e) => setNewVariant({...newVariant, price: e.target.value})}
                  placeholder="29"
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
                <div className="flex gap-8">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-900" style={{ backgroundColor: v.color?.toLowerCase() || 'gray' }}></div>
                    <span className="font-bold text-gray-900">{v.color}</span>
                  </div>
                  <span className="font-bold text-gray-500">Size: {v.size}</span>
                  <span className="font-bold text-gray-900">{getCurrencySymbol()}{v.price}</span>
                  <span className="text-gray-400">{v.stock} in stock</span>
                </div>
                <button 
                  onClick={() => removeVariant(i)}
                  className="p-2 text-gray-300 hover:text-red-500 transition-colors"
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
      </div>
    </div>
  );
}
