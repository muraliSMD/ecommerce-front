"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  FiArrowLeft,
  FiUpload,
  FiDownload,
  FiCheck,
  FiAlertCircle,
  FiCopy,
  FiImage,
  FiTrash2,
  FiEye,
  FiInfo
} from "react-icons/fi";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";
import imageCompression from "browser-image-compression";

export default function BulkUploadProducts() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);
  
  // States for Excel Parsing
  const [fileName, setFileName] = useState("");
  const [parsedProducts, setParsedProducts] = useState([]);
  const [uploadErrors, setUploadErrors] = useState([]);
  const [isParsing, setIsParsing] = useState(false);

  // States for Quick Image Uploader Widget
  const [imagesList, setImagesList] = useState([]);
  const [isImageUploading, setIsImageUploading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch categories to do client-side validation
  const { data: categories } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data } = await api.get("/categories");
      return data;
    },
  });

  // Bulk upload mutation
  const bulkUploadMutation = useMutation({
    mutationFn: async (productsData) => {
      const { data } = await api.post("/products/bulk", { products: productsData });
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(["admin-products"]);
      toast.success(data.message || "Bulk upload completed successfully!");
      router.push("/admin/products");
    },
    onError: (error) => {
      const serverErrors = error.response?.data?.errors;
      if (serverErrors && Array.isArray(serverErrors)) {
        setUploadErrors(serverErrors);
        toast.error("Upload failed. Please check the errors below.");
      } else {
        toast.error(error.response?.data?.message || "Failed to bulk upload products");
      }
    },
  });

  // 1. Download Template Handler
  const handleDownloadTemplate = async () => {
    const XLSX = await import("xlsx");
    
    const headers = [
      "Name", "SKU", "Description", "Category", "Price", "MRP", "Stock",
      "Color", "Size", "N-Size", "Length", "Age Group", "With Blouse", "Blouse Meter", "Silk Type",
      "Images", "Is Featured", "Is Active", "Is PreBook", "PreBook Price", "PreBook Delivery Date"
    ];

    const sampleData = [
      {
        "Name": "Classic Silk Saree",
        "SKU": "SILK-SAR-001",
        "Description": "A beautiful hand-woven classic silk saree.",
        "Category": categories?.[0]?.name || "Sarees",
        "Price": 2500,
        "MRP": 5000,
        "Stock": 10,
        "Color": "Red",
        "Size": "",
        "N-Size": "",
        "Length": "5.5 mtrs",
        "Age Group": "",
        "With Blouse": "With Blouse",
        "Blouse Meter": "0.8 mtr",
        "Silk Type": "Kanchipuram Silk",
        "Images": "https://images.unsplash.com/photo-1610030469983-98e550d6193c",
        "Is Featured": "TRUE",
        "Is Active": "TRUE",
        "Is PreBook": "FALSE",
        "PreBook Price": "",
        "PreBook Delivery Date": ""
      },
      {
        "Name": "Premium Cotton T-Shirt",
        "SKU": "TSHIRT-001",
        "Description": "Comfy everyday cotton t-shirt (Size M).",
        "Category": categories?.[1]?.name || "T-Shirts",
        "Price": 499,
        "MRP": 999,
        "Stock": 15,
        "Color": "Blue",
        "Size": "M",
        "N-Size": "",
        "Length": "",
        "Age Group": "18 to 19",
        "With Blouse": "",
        "Blouse Meter": "",
        "Silk Type": "",
        "Images": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518",
        "Is Featured": "FALSE",
        "Is Active": "TRUE",
        "Is PreBook": "FALSE",
        "PreBook Price": "",
        "PreBook Delivery Date": ""
      },
      {
        "Name": "Premium Cotton T-Shirt",
        "SKU": "TSHIRT-001",
        "Description": "Comfy everyday cotton t-shirt (Size L).",
        "Category": categories?.[1]?.name || "T-Shirts",
        "Price": 499,
        "MRP": 999,
        "Stock": 20,
        "Color": "Blue",
        "Size": "L",
        "N-Size": "",
        "Length": "",
        "Age Group": "18 to 19",
        "With Blouse": "",
        "Blouse Meter": "",
        "Silk Type": "",
        "Images": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518",
        "Is Featured": "FALSE",
        "Is Active": "TRUE",
        "Is PreBook": "FALSE",
        "PreBook Price": "",
        "PreBook Delivery Date": ""
      }
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Products Template");
    XLSX.writeFile(wb, "products_bulk_upload_template.xlsx");
  };

  // 2. Parse Excel file
  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setIsParsing(true);
    setUploadErrors([]);
    setParsedProducts([]);

    try {
      const XLSX = await import("xlsx");
      const reader = new FileReader();

      reader.onload = async (evt) => {
        try {
          const bstr = evt.target.result;
          const wb = XLSX.read(bstr, { type: "binary" });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const rawRows = XLSX.utils.sheet_to_json(ws);

          if (rawRows.length === 0) {
            toast.error("Spreadsheet is empty!");
            setIsParsing(false);
            return;
          }

          // Parse and group products by Name/SKU
          const productsMap = {};

          rawRows.forEach((row) => {
            const name = row["Name"]?.toString().trim();
            const sku = row["SKU"]?.toString().trim();
            if (!name) return; // Skip rows without name

            const key = sku || name;

            if (!productsMap[key]) {
              productsMap[key] = {
                name,
                sku: sku || "",
                description: row["Description"]?.toString() || "",
                categoryName: row["Category"]?.toString().trim() || "",
                price: row["Price"] ? Number(row["Price"]) : 0,
                mrp: row["MRP"] ? Number(row["MRP"]) : null,
                discount: row["Discount"] ? Number(row["Discount"]) : null,
                stock: row["Stock"] ? Number(row["Stock"]) : 0,
                color: row["Color"]?.toString().trim() || null,
                size: row["Size"]?.toString().trim() || null,
                length: row["Length"]?.toString().trim() || null,
                age: row["Age Group"]?.toString().trim() || null,
                nSize: row["N-Size"]?.toString().trim() || null,
                withBlouse: row["With Blouse"]?.toString().trim() || null,
                blouseMeter: row["Blouse Meter"]?.toString().trim() || null,
                silkType: row["Silk Type"]?.toString().trim() || null,
                images: row["Images"]
                  ? row["Images"]
                      .toString()
                      .split(",")
                      .map((img) => img.trim())
                      .filter(Boolean)
                  : [],
                isFeatured: row["Is Featured"]?.toString().toUpperCase() === "TRUE",
                isActive: row["Is Active"]?.toString().toUpperCase() !== "FALSE",
                isPreBook: row["Is PreBook"]?.toString().toUpperCase() === "TRUE",
                preBookPrice: row["PreBook Price"] ? Number(row["PreBook Price"]) : null,
                preBookDeliveryDate: row["PreBook Delivery Date"]?.toString() || "",
                hasVariants: false,
                rowsList: [row],
              };
            } else {
              productsMap[key].rowsList.push(row);
              productsMap[key].hasVariants = true;
            }
          });

          // Final structure and mapping
          const structuredProducts = Object.values(productsMap).map((prod) => {
            // Validate category name matching (dynamic creation on backend, warning only)
            let categoryValid = true;
            if (prod.categoryName && categories) {
              categoryValid = categories.some(
                (c) => c.name.toLowerCase().trim() === prod.categoryName.toLowerCase().trim()
              );
            }

            const isSaree = prod.categoryName && prod.categoryName.toLowerCase().includes("saree");

            // Build variants list if product has variants
            let variants = [];
            let totalStock = prod.stock;

            if (prod.hasVariants) {
              totalStock = 0;
              variants = prod.rowsList.map((r) => {
                const stock = r["Stock"] ? Number(r["Stock"]) : 0;
                totalStock += stock;

                // Auto-calculate discount if price/mrp exists
                const price = r["Price"] ? Number(r["Price"]) : 0;
                const mrp = r["MRP"] ? Number(r["MRP"]) : null;
                let discount = r["Discount"] ? Number(r["Discount"]) : null;
                if (!discount && mrp && price) {
                  discount = Math.round(((mrp - price) / mrp) * 100);
                }

                return {
                  color: r["Color"]?.toString().trim() || null,
                  size: r["Size"]?.toString().trim() || null,
                  length: isSaree ? (r["Length"]?.toString().trim() || null) : null,
                  age: r["Age Group"]?.toString().trim() || null,
                  nSize: r["N-Size"]?.toString().trim() || null,
                  stock,
                  price,
                  mrp,
                  discount,
                  images: r["Images"]
                    ? r["Images"]
                        .toString()
                        .split(",")
                        .map((img) => img.trim())
                        .filter(Boolean)
                    : [],
                  withBlouse: isSaree ? (r["With Blouse"]?.toString().trim() || null) : null,
                  blouseMeter: isSaree ? (r["Blouse Meter"]?.toString().trim() || null) : null,
                  silkType: isSaree ? (r["Silk Type"]?.toString().trim() || null) : null,
                  isPreBook: r["Is PreBook"]?.toString().toUpperCase() === "TRUE",
                  preBookPrice: r["PreBook Price"] ? Number(r["PreBook Price"]) : null,
                  preBookDeliveryDate: r["PreBook Delivery Date"]?.toString() || "",
                };
              });

              // Take base price & fields from first variant
              prod.price = variants[0].price;
              prod.mrp = variants[0].mrp;
              prod.discount = variants[0].discount;
            } else {
              // Auto-calculate single product discount
              if (!prod.discount && prod.mrp && prod.price) {
                prod.discount = Math.round(((prod.mrp - prod.price) / prod.mrp) * 100);
              }
            }

            prod.stock = totalStock;
            
            // Client-side validations (No longer blocking on missing categories)
            const validationErrors = [];
            if (!prod.name) validationErrors.push("Name is required");
            if (prod.price <= 0) validationErrors.push("Price must be greater than 0");
            if (prod.stock < 0) validationErrors.push("Stock cannot be negative");

            return {
              ...prod,
              length: isSaree ? prod.length : null,
              withBlouse: isSaree ? prod.withBlouse : null,
              blouseMeter: isSaree ? prod.blouseMeter : null,
              silkType: isSaree ? prod.silkType : null,
              variants,
              isNewCategory: prod.categoryName && !categoryValid,
              validationErrors,
              isValid: validationErrors.length === 0,
            };
          });

          setParsedProducts(structuredProducts);
          toast.success("Excel parsed successfully. Review data below.");
        } catch (err) {
          console.error(err);
          toast.error("Failed to parse sheet data. Please ensure it follows the template format.");
        } finally {
          setIsParsing(false);
        }
      };

      reader.readAsBinaryString(file);
    } catch (err) {
      console.error(err);
      toast.error("Error reading file");
      setIsParsing(false);
    }
  };

  // 3. Quick Image Uploader Widget Handler
  const handleImageUpload = async (e) => {
    let file = e.target.files[0];
    if (!file) return;

    setIsImageUploading(true);
    const toastId = toast.loading("Uploading image helper...");

    // Compress image
    if (file.type.startsWith("image/")) {
      try {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        };
        const compressedFile = await imageCompression(file, options);
        file = compressedFile;
      } catch (error) {
        console.error("Compression error:", error);
      }
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (res.ok) {
        setImagesList((prev) => [
          ...prev,
          { name: file.name, url: data.url },
        ]);
        toast.success("Image uploaded successfully!", { id: toastId });
      } else {
        toast.error("Failed to upload image helper", { id: toastId });
      }
    } catch (error) {
      toast.error("Failed to upload image helper", { id: toastId });
    } finally {
      setIsImageUploading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const removeUploaderImage = (index) => {
    setImagesList((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit parsed data to backend
  const handleSubmitUpload = () => {
    const invalidCount = parsedProducts.filter((p) => !p.isValid).length;
    if (invalidCount > 0) {
      return toast.error("Please fix all validation errors before uploading!");
    }

    // Clean products payload to remove client-only attributes (like validationErrors, rowsList, isValid)
    const cleanPayload = parsedProducts.map((p) => {
      const { rowsList, validationErrors, isValid, categoryName, ...rest } = p;
      return {
        ...rest,
        categoryName, // Send categoryName so server resolves it
      };
    });

    bulkUploadMutation.mutate(cleanPayload);
  };

  if (!mounted) return null;

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <Link
            href="/admin/products"
            className="flex items-center gap-2 text-gray-500 hover:text-primary font-bold transition-colors mb-4"
          >
            <FiArrowLeft /> Back to products
          </Link>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900">Bulk Product Upload</h1>
          <p className="text-gray-500 mt-2">
            Upload multiple products using our Excel template, validate details, and sync to the store instantly.
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleDownloadTemplate}
            className="border-2 border-primary/20 hover:border-primary text-primary px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 bg-white shadow-sm"
          >
            <FiDownload size={18} /> Download Excel Template
          </button>
          {parsedProducts.length > 0 && (
            <button
              onClick={handleSubmitUpload}
              disabled={bulkUploadMutation.isPending || parsedProducts.some((p) => !p.isValid)}
              className="bg-primary hover:bg-secondary text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50"
            >
              <FiCheck size={18} /> {bulkUploadMutation.isPending ? "Uploading..." : "Confirm Upload"}
            </button>
          )}
        </div>
      </div>

      {/* Guidelines cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold flex-shrink-0">
            1
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-sm">Download Template</h4>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Start by downloading our formatted Excel file template.
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold flex-shrink-0">
            2
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-sm">Fill in Details</h4>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Only <b>Name</b>, <b>Price</b>, and <b>Stock</b> are required. Categories that don&apos;t exist yet will be auto-created!
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center font-bold flex-shrink-0">
            3
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-sm">Preview & Confirm</h4>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Drag your file below, inspect the live preview table, and confirm upload to sync.
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Image Helper & File Drag Uploader */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left/Middle Column: File Upload Area */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white rounded-[2.5rem] p-10 shadow-xl shadow-black/5 border border-gray-100 flex flex-col justify-center min-h-[300px]">
            <div className="border-2 border-dashed border-gray-200 rounded-3xl p-8 hover:border-primary/50 transition-all flex flex-col items-center justify-center bg-surface/30">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-[1.5rem] flex items-center justify-center mb-6">
                <FiUpload size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Upload Excel Spreadsheet</h3>
              <p className="text-gray-400 text-sm text-center max-w-sm mb-6">
                Select or drag-and-drop the filled Excel spreadsheet template to parse product records.
              </p>
              
              <label className="cursor-pointer bg-primary hover:bg-secondary text-white px-6 py-3.5 rounded-xl text-sm font-bold transition-all shadow-md shadow-primary/15 flex items-center gap-2 active:scale-95">
                Choose File
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  className="hidden"
                  onChange={handleExcelUpload}
                  disabled={isParsing}
                />
              </label>

              {fileName && (
                <p className="text-sm font-semibold text-gray-600 mt-6 bg-gray-100 px-4 py-2 rounded-xl">
                  Selected File: {fileName}
                </p>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Quick Image Uploader Helper */}
        <div className="space-y-6">
          <section className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-black/5 border border-gray-100 space-y-6 h-full flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-display font-bold flex items-center gap-2 text-gray-900">
                <FiImage className="text-primary" /> Image Assistant
              </h3>
              <p className="text-xs text-gray-400 mt-2">
                Need Cloudinary links for the Excel template? Upload images here to quickly copy URLs and paste them into the spreadsheet.
              </p>
              
              <div className="mt-4 border-2 border-dashed border-gray-200 hover:border-primary/50 rounded-2xl p-4 flex flex-col items-center justify-center transition-colors bg-surface/10 relative">
                <FiUpload className="text-gray-400 mb-2" size={24} />
                <span className="text-xs font-semibold text-gray-600">Drag or select image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isImageUploading}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>

              {/* Uploaded Helper Images List */}
              {imagesList.length > 0 && (
                <div className="mt-6 space-y-3 max-h-[200px] overflow-y-auto pr-2">
                  {imagesList.map((img, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-3 p-3 bg-gray-50 border border-gray-100 rounded-xl relative group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden border bg-white flex-shrink-0">
                          <Image src={img.url} alt="" fill className="object-cover" />
                        </div>
                        <div className="truncate max-w-[100px] md:max-w-[140px]">
                          <p className="text-xs font-bold text-gray-800 truncate" title={img.name}>
                            {img.name}
                          </p>
                          <p className="text-[10px] text-gray-400 font-mono truncate" title={img.url}>
                            {img.url}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => copyToClipboard(img.url)}
                          className="p-2 bg-white hover:bg-primary/5 text-gray-500 hover:text-primary rounded-lg border border-gray-200 transition-all shadow-sm"
                          title="Copy Link"
                        >
                          <FiCopy size={12} />
                        </button>
                        <button
                          onClick={() => removeUploaderImage(idx)}
                          className="p-2 bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg border border-gray-200 transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                          title="Remove Image"
                        >
                          <FiTrash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5 flex items-start gap-2.5">
              <FiInfo className="text-blue-500 mt-0.5 flex-shrink-0" size={16} />
              <p className="text-[10px] leading-relaxed text-blue-600">
                You can upload a single image for each product, copy the link, and paste it under the <b>Images</b> column in your Excel template. Separate multiple images using a comma.
              </p>
            </div>
          </section>
        </div>
      </div>

      {/* Parsing Loader */}
      {isParsing && (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] shadow-xl shadow-black/5 border border-gray-100 animate-pulse">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 font-bold">Parsing Excel Spreadsheet...</p>
        </div>
      )}

      {/* Server Validation Errors Panel */}
      {uploadErrors.length > 0 && (
        <section className="bg-red-50 border border-red-200 rounded-[2rem] p-8 space-y-4">
          <h3 className="text-lg font-bold text-red-700 flex items-center gap-2">
            <FiAlertCircle size={20} /> Server validation failed for some records
          </h3>
          <div className="divide-y divide-red-200/50 max-h-[300px] overflow-y-auto pr-2">
            {uploadErrors.map((err, idx) => (
              <div key={idx} className="py-3 flex items-start gap-3 text-sm text-red-600">
                <span className="font-bold bg-red-100 px-2.5 py-0.5 rounded-lg text-xs mt-0.5">
                  Row {err.row}
                </span>
                <div>
                  <p className="font-bold">{err.productName}</p>
                  <p className="text-xs text-red-500 mt-1">{err.message}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Real-time Spreadsheet Previews */}
      {parsedProducts.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-display font-bold text-gray-900">
              Parsed Spreadsheet Records ({parsedProducts.length})
            </h2>
            <div className="flex items-center gap-4 text-xs font-bold bg-white border border-gray-100 px-4 py-2 rounded-xl shadow-sm">
              <span className="text-green-600 flex items-center gap-1">
                <FiCheck /> {parsedProducts.filter((p) => p.isValid).length} Valid
              </span>
              <span className="text-gray-200 font-normal">|</span>
              <span className="text-red-500 flex items-center gap-1">
                <FiAlertCircle /> {parsedProducts.filter((p) => !p.isValid).length} Errors
              </span>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-black/5 border border-gray-100 overflow-hidden">
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-surface/50 text-gray-400 text-[10px] font-bold uppercase tracking-widest border-b border-gray-100">
                    <th className="px-8 py-6 w-20">Row</th>
                    <th className="px-8 py-6 w-24">Image</th>
                    <th className="px-8 py-6">Product details</th>
                    <th className="px-8 py-6">Category</th>
                    <th className="px-8 py-6">Price & MRP</th>
                    <th className="px-8 py-6">Stock & Type</th>
                    <th className="px-8 py-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 whitespace-nowrap text-sm text-gray-700">
                  {parsedProducts.map((p, idx) => {
                    const rowNum = idx + 1;
                    return (
                      <tr key={idx} className={`hover:bg-gray-50/50 transition-colors ${!p.isValid ? "bg-red-50/30" : ""}`}>
                        <td className="px-8 py-6 font-bold text-gray-400">#{rowNum}</td>
                        <td className="px-8 py-6">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-surface border border-gray-100 relative">
                            <Image
                              src={p.images?.[0] || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2070"}
                              alt=""
                              fill
                              className="object-cover"
                            />
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div>
                            <p className="font-bold text-gray-900 max-w-[200px] truncate" title={p.name}>
                              {p.name}
                            </p>
                            <p className="text-[10px] text-gray-400 font-mono truncate" title={p.sku}>
                              SKU: {p.sku || "Auto-Generated"}
                            </p>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          {p.categoryName ? (
                            <div className="flex flex-col gap-1 items-start">
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                p.isNewCategory
                                  ? "bg-blue-50 text-blue-600 border border-blue-100"
                                  : "bg-surface text-gray-600 border border-gray-150"
                              }`}>
                                {p.categoryName}
                              </span>
                              {p.isNewCategory && (
                                <span className="text-[9px] text-blue-500 font-bold select-none whitespace-nowrap">
                                  Will auto-create category
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-50 text-gray-400 border border-gray-100">
                              Uncategorized
                            </span>
                          )}
                        </td>
                        <td className="px-8 py-6">
                          <div>
                            <p className="font-bold text-gray-900">₹{p.price}</p>
                            {p.mrp && <p className="text-[10px] text-gray-400 line-through">₹{p.mrp}</p>}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div>
                            <p className="font-bold text-gray-900">{p.stock} units</p>
                            <span className="text-[10px] text-gray-400 font-semibold uppercase">
                              {p.hasVariants ? `${p.variants.length} Variants` : "Single Product"}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          {p.isValid ? (
                            <span className="inline-flex items-center gap-1 bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs font-bold">
                              <FiCheck size={12} /> Valid
                            </span>
                          ) : (
                            <div className="flex flex-col gap-1 items-start max-w-[250px]">
                              <span className="inline-flex items-center gap-1 bg-red-50 text-red-500 px-3 py-1 rounded-full text-xs font-bold">
                                <FiAlertCircle size={12} /> Invalid
                              </span>
                              <p className="text-[10px] leading-relaxed text-red-500 font-semibold whitespace-normal">
                                {p.validationErrors.join(", ")}
                              </p>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
