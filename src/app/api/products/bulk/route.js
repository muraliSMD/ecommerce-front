import dbConnect from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { NextResponse } from "next/server";
import { getFullUserFromRequest, isAdmin } from "@/lib/auth";
import logger from "@/lib/logger";
import { productSchema } from "@/lib/validations/product";

export const maxDuration = 60; // 60 seconds
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    await dbConnect();

    // 1. Auth Check
    const user = await getFullUserFromRequest(request);
    if (!isAdmin(user)) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    const { products } = await request.json();
    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { message: "No products provided for upload" },
        { status: 400 }
      );
    }

    // 2. Fetch all categories to map category names to Object IDs
    const categories = await Category.find({}).lean();
    const categoryMap = {};
    const categoryNameMap = {};
    categories.forEach((cat) => {
      const key = cat.name.toLowerCase().trim();
      categoryMap[key] = cat._id.toString();
      categoryNameMap[cat._id.toString()] = cat.name;
    });

    const validatedProducts = [];
    const errors = [];

    // Keep track of slugs and SKUs in the current batch to avoid duplicate generation conflicts
    const usedSlugs = new Set();
    const usedSkus = new Set();

    // 3. Process and validate products
    for (let index = 0; index < products.length; index++) {
      const rawProduct = products[index];
      const rowNum = index + 1;

      // Map Category Name to ObjectId (Auto-create if not exists)
      let categoryId = null;
      let categoryName = "";
      if (rawProduct.categoryName) {
        const catNameLower = rawProduct.categoryName.toLowerCase().trim();
        categoryId = categoryMap[catNameLower] || null;
        if (!categoryId) {
          try {
            let catSlug = rawProduct.categoryName
              .toLowerCase()
              .trim()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)+/g, "");
            
            let existingCat = await Category.findOne({ slug: catSlug });
            let catSlugAttempts = 0;
            while (existingCat && catSlugAttempts < 10) {
              catSlug = `${catSlug}-${Math.floor(Math.random() * 1000)}`;
              existingCat = await Category.findOne({ slug: catSlug });
              catSlugAttempts++;
            }
            
            const newCat = new Category({
              name: rawProduct.categoryName.trim(),
              slug: catSlug,
              isActive: true
            });
            await newCat.save();
            
            categoryId = newCat._id.toString();
            categoryMap[catNameLower] = categoryId;
            categoryNameMap[categoryId] = newCat.name;
          } catch (catError) {
            errors.push({
              row: rowNum,
              productName: rawProduct.name || `Row ${rowNum}`,
              message: `Failed to auto-create category "${rawProduct.categoryName}": ${catError.message}`,
            });
            continue;
          }
        }
        categoryName = categoryNameMap[categoryId] || "";
      }

      const isSaree = categoryName.toLowerCase().includes("saree");

      // Generate unique slug
      let slug = rawProduct.slug;
      if (!slug || slug.trim() === "") {
        slug = (rawProduct.name || "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "");
      } else {
        slug = slug
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "");
      }

      // Make slug unique within DB and current batch
      let uniqueSlug = slug;
      let slugAttempts = 0;
      let existingSlug = await Product.findOne({ slug: uniqueSlug });
      while ((existingSlug || usedSlugs.has(uniqueSlug)) && slugAttempts < 10) {
        uniqueSlug = `${slug}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        existingSlug = await Product.findOne({ slug: uniqueSlug });
        slugAttempts++;
      }
      usedSlugs.add(uniqueSlug);

      // Generate unique SKU
      let sku = rawProduct.sku;
      if (!sku || sku.trim() === "") {
        const prefix = (rawProduct.name || "PROD")
          .substring(0, 3)
          .toUpperCase()
          .replace(/[^A-Z]/g, "PROD");
        let isUnique = false;
        let skuAttempts = 0;

        while (!isUnique && skuAttempts < 15) {
          const random = Math.floor(1000 + Math.random() * 9000);
          sku = `${prefix}-${random}`;
          const existingSku = await Product.findOne({ sku });
          if (!existingSku && !usedSkus.has(sku)) {
            isUnique = true;
          }
          skuAttempts++;
        }
      } else {
        // Verify user-provided SKU is unique
        const existingSku = await Product.findOne({ sku });
        if (existingSku || usedSkus.has(sku)) {
          errors.push({
            row: rowNum,
            productName: rawProduct.name || `Row ${rowNum}`,
            message: `SKU "${sku}" is already in use.`,
          });
          continue;
        }
      }
      usedSkus.add(sku);

      // Format clean product data matching validation expectations
      const productToValidate = {
        name: rawProduct.name,
        sku: sku,
        slug: uniqueSlug,
        description: rawProduct.description || "",
        manufacturerInfo: rawProduct.manufacturerInfo || "",
        category: categoryId,
        color: rawProduct.color || null,
        size: rawProduct.size || null,
        length: isSaree ? (rawProduct.length || null) : null,
        age: rawProduct.age || null,
        nSize: rawProduct.nSize || null,
        withBlouse: isSaree ? (rawProduct.withBlouse || null) : null,
        blouseMeter: isSaree ? (rawProduct.blouseMeter || null) : null,
        silkType: isSaree ? (rawProduct.silkType || null) : null,
        price: Number(rawProduct.price) || 0,
        mrp: rawProduct.mrp ? Number(rawProduct.mrp) : null,
        discount: rawProduct.discount ? Number(rawProduct.discount) : null,
        hasVariants: !!rawProduct.hasVariants,
        stock: Number(rawProduct.stock) || 0,
        images: Array.isArray(rawProduct.images) ? rawProduct.images : [],
        videos: Array.isArray(rawProduct.videos) ? rawProduct.videos : [],
        isFeatured: !!rawProduct.isFeatured,
        isActive: rawProduct.isActive !== false,
        isPreBook: !!rawProduct.isPreBook,
        preBookPrice: rawProduct.preBookPrice ? Number(rawProduct.preBookPrice) : null,
        preBookDeliveryDate: rawProduct.preBookDeliveryDate || "",
        metaTitle: rawProduct.metaTitle || "",
        metaDescription: rawProduct.metaDescription || "",
        metaKeywords: rawProduct.metaKeywords || "",
        variants: Array.isArray(rawProduct.variants)
          ? rawProduct.variants.map((v) => ({
              color: v.color || null,
              size: v.size || null,
              length: isSaree ? (v.length || null) : null,
              age: v.age || null,
              nSize: v.nSize || null,
              stock: Number(v.stock) || 0,
              price: Number(v.price) || 0,
              mrp: v.mrp ? Number(v.mrp) : null,
              discount: v.discount ? Number(v.discount) : null,
              images: Array.isArray(v.images) ? v.images : [],
              videos: Array.isArray(v.videos) ? v.videos : [],
              withBlouse: isSaree ? (v.withBlouse || null) : null,
              blouseMeter: isSaree ? (v.blouseMeter || null) : null,
              silkType: isSaree ? (v.silkType || null) : null,
              isPreBook: !!v.isPreBook,
              preBookPrice: v.preBookPrice ? Number(v.preBookPrice) : null,
              preBookDeliveryDate: v.preBookDeliveryDate || "",
            }))
          : [],
      };

      const validation = productSchema.safeParse(productToValidate);
      if (!validation.success) {
        const errorFormatted = validation.error.errors
          .map((err) => `${err.path.join(".")}: ${err.message}`)
          .join(", ");
        errors.push({
          row: rowNum,
          productName: rawProduct.name || `Row ${rowNum}`,
          message: errorFormatted,
        });
      } else {
        validatedProducts.push(validation.data);
      }
    }

    // 4. Report errors if any are found
    if (errors.length > 0) {
      return NextResponse.json(
        {
          message: "Validation failed for some products.",
          errors,
        },
        { status: 400 }
      );
    }

    // 5. Bulk insert products to database
    const savedProducts = [];
    for (const prodData of validatedProducts) {
      const newProduct = new Product(prodData);
      const saved = await newProduct.save();
      savedProducts.push(saved);
    }

    logger.info(`Successfully bulk uploaded ${savedProducts.length} products`);

    return NextResponse.json(
      {
        message: `Successfully uploaded ${savedProducts.length} products`,
        count: savedProducts.length,
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error("Bulk upload handler failed", {
      error: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { message: "Server error during bulk upload", error: error.message },
      { status: 500 }
    );
  }
}
