import dbConnect from '@/lib/db';
import Collection from '@/models/Collection';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';

// Ensure the models are registered
import '@/models/Category';

export const revalidate = 0; // Disable caching for fresh data

export async function GET() {
  await dbConnect();
  try {
    // 1. Get active collections
    const collections = await Collection.find({ isActive: true }).sort({ createdAt: -1 }).lean();

    // 2. Fetch products for each collection
    const collectionsWithProducts = await Promise.all(
      collections.map(async (collection) => {
        // Fetch up to 10 products per collection for the slider
        const products = await Product.find({ 
          collections: collection._id, 
          isActive: true 
        })
        .populate('category', 'name slug')
        .limit(10)
        .sort({ createdAt: -1 })
        .lean();

        return {
          ...collection,
          products
        };
      })
    );

    // Only return collections that have at least one product
    const validCollections = collectionsWithProducts.filter(c => c.products && c.products.length > 0);

    return NextResponse.json(validCollections);
  } catch (error) {
    console.error("Error fetching collections:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
