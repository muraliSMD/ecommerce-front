import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';
import { getFullUserFromRequest, isAdmin } from '@/lib/auth';
import logger from '@/lib/logger';

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    await dbConnect();
    
    // Auth check
    const user = await getFullUserFromRequest(request);
    if (!isAdmin(user)) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    const sourceProduct = await Product.findById(id);
    if (!sourceProduct) {
      return NextResponse.json({ message: "Source product not found" }, { status: 404 });
    }

    // Prepare duplicated data
    const productData = sourceProduct.toObject();
    delete productData._id;
    delete productData.createdAt;
    delete productData.updatedAt;
    delete productData.__v;
    delete productData.reviews;
    
    productData.name = `${productData.name} (Copy)`;
    productData.averageRating = 0;
    productData.numReviews = 0;
    
    // Generate new unique slug
    let slug = productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    let existingProduct = await Product.findOne({ slug });
    if (existingProduct) {
        slug = `${slug}-${Date.now()}`;
    }
    productData.slug = slug;
    
    // Unique SKU handling if exists
    if (productData.sku) {
      productData.sku = `${productData.sku}-COPY-${Date.now().toString().slice(-4)}`;
    }

    const duplicatedProduct = new Product(productData);
    const savedProduct = await duplicatedProduct.save();

    logger.info(`Product duplicated`, { sourceId: id, newId: savedProduct._id });
    
    return NextResponse.json(savedProduct, { status: 201 });
  } catch (error) {
    logger.error("Duplication Error", { error: error.message, stack: error.stack });
    return NextResponse.json({ message: "Server Error", error: error.message }, { status: 500 });
  }
}
