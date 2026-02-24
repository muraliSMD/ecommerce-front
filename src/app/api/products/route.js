import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { NextResponse } from 'next/server';
import { getFullUserFromRequest, isAdmin } from '@/lib/auth';

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
    
    // Admin checking for disabled products visibility
    const isAdminFetch = searchParams.get('admin') === 'true';
    let isAdminUser = false;
    
    if (isAdminFetch) {
      const user = await getFullUserFromRequest(request);
      isAdminUser = !!user && isAdmin(user);
    }
    
    if (!isAdminUser) {
      filter.isActive = { $ne: false }; // Show only true or undefined (legacy)
    }
    if (category && category !== "All") {
        // 1. Check if it's a valid ObjectId
        if (category.match(/^[0-9a-fA-F]{24}$/)) {
            filter.category = category;
        } else {
            // 2. Try looking up by slug first, then name
            const catDoc = await Category.findOne({ 
              $or: [
                { slug: category },
                { name: { $regex: new RegExp(`^${category}$`, 'i') } }
              ]
            });

            if (catDoc) {
                // Find all categories that are descendants of this category
                const descendants = await Category.find({ ancestors: catDoc._id });
                
                // Include the selected category and all its descendants in the filter
                const categoryIds = [catDoc._id, ...descendants.map(d => d._id)];
                
                filter.category = { $in: categoryIds };
            } else {
                 // Category not found
                 filter.category = null; 
            }
        }
    }
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
    const products = await query.populate({ path: 'category', select: 'name slug', strictPopulate: false }).lean();
    
    // Debugging: Check if population worked for the first few items
    if (products.length > 0) {
        console.log("Debug: First product category:", products[0].category);
    }

    return NextResponse.json(products);
  } catch (error) {
    logger.error("Failed to fetch products", { error: error.message, stack: error.stack });
    return NextResponse.json({ message: "Server Error", error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    
    // Auth check
    const user = await getFullUserFromRequest(request);
    if (!isAdmin(user)) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

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
