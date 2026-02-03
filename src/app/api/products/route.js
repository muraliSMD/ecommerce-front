import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sort = searchParams.get('sort') || 'newest';
    const search = searchParams.get('search');

    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 0; // 0 means all
    const skip = (page - 1) * limit;

    let filter = {};
    if (category && category !== "All") filter.category = category;
    if (search) filter.name = { $regex: search, $options: "i" };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    if (sort === 'price_desc') sortOption = { price: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };

    let query = Product.find(filter).sort(sortOption);
    
    if (limit > 0) {
      query = query.skip(skip).limit(limit);
    }
    
    // Use .lean() for performance since we don't need mongoose document checks here
    const products = await query.lean();
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ message: "Server Error", error }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    // TODO: Add auth middleware equivalent for admin protection
    const body = await request.json();
    const newProduct = new Product(body);
    const savedProduct = await newProduct.save();
    return NextResponse.json(savedProduct, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Bad request", error }, { status: 400 });
  }
}
