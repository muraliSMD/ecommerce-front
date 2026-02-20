import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('category');
    const excludeId = searchParams.get('exclude');
    
    if (!categoryId) {
        return NextResponse.json({ message: "Category ID required" }, { status: 400 });
    }

    // Find products in the same category, excluding the current one
    // Limit to 4 related products
    const relatedProducts = await Product.find({
        category: categoryId,
        _id: { $ne: excludeId }
    })
    .limit(4)
    .populate('category', 'name slug')
    .lean();

    return NextResponse.json(relatedProducts);
  } catch (error) {
    console.error("Error fetching related products:", error);
    return NextResponse.json({ message: "Server Error", error }, { status: 500 });
  }
}
