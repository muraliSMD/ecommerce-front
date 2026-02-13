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

    const colors = searchParams.get('colors');
    const sizes = searchParams.get('sizes');
    const minRating = searchParams.get('minRating');

    let filter = {};
    if (category && category !== "All") filter.category = category;
    if (search) filter.name = { $regex: search, $options: "i" };
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Advanced Filtering
    if (colors) {
        const colorArray = colors.split(',');
        filter['variants.color'] = { $in: colorArray.map(c => new RegExp(c, 'i')) };
    }

    if (sizes) {
        const sizeArray = sizes.split(',');
        filter['variants.size'] = { $in: sizeArray.map(s => new RegExp(s, 'i')) };
    }

    if (minRating) {
        filter.averageRating = { $gte: Number(minRating) };
    }

    const isFeatured = searchParams.get('isFeatured');
    if (isFeatured === 'true') {
      filter.isFeatured = true;
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    if (sort === 'price_desc') sortOption = { price: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };

    let query = Product.find(filter).sort(sortOption);

    // Optimize: Return lean data for lists by default
    const type = searchParams.get('type');
    if (type !== 'detail') {
       query = query.select('-description -reviews');
    }
    
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
    
    // Generate slug from name
    let slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    // Check if slug exists
    let existingProduct = await Product.findOne({ slug });
    if (existingProduct) {
        slug = `${slug}-${Date.now()}`;
    }
    
    const newProduct = new Product({ ...body, slug });
    const savedProduct = await newProduct.save();
    return NextResponse.json(savedProduct, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Bad request", error }, { status: 400 });
  }
}
