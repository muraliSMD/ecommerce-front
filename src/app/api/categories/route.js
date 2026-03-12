import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import { getFullUserFromRequest, isAdmin } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  await dbConnect();
  try {
    // Return all categories as a flat list. Frontend will build the tree.
    // Populate parent for easier debugging if needed, but simple find is enough
    const categories = await Category.find().populate({ path: 'parent', select: 'name', strictPopulate: false }).sort({ level: 1, name: 1 }).lean();
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

import { categorySchema } from '@/lib/validations/category';

export async function POST(request) {
  try {
    await dbConnect();
    
    const user = await getFullUserFromRequest(request);
    if (!isAdmin(user)) {
      return NextResponse.json({ message: "Admin access required" }, { status: 403 });
    }

    const rawBody = await request.json();
    const validation = categorySchema.safeParse(rawBody);
    
    if (!validation.success) {
        return NextResponse.json({ 
            message: "Validation failed", 
            errors: validation.error.format() 
        }, { status: 400 });
    }

    const { name, image, parent, description } = validation.data;

    let level = 0;
    let ancestors = [];

    if (parent) {
        // Validate parent ObjectId format
        if (!parent.match(/^[0-9a-fA-F]{24}$/)) {
             return NextResponse.json({ message: "Invalid parent category ID" }, { status: 400 });
        }

        const parentCategory = await Category.findById(parent);
        if (!parentCategory) {
            return NextResponse.json({ message: "Parent category not found" }, { status: 400 });
        }
        level = parentCategory.level + 1;
        ancestors = [...(parentCategory.ancestors || []), parentCategory._id];
    }

    // Generate slug safely
    let slug = validation.data.slug;
    if (!slug || slug.trim() === "") {
        slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    } else {
        slug = slug.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    }

    // Ensure slug uniqueness
    let existingSlug = await Category.findOne({ slug });
    if (existingSlug) {
        slug = `${slug}-${Date.now()}`;
    }

    // Auto-generate SKU if not provided
    let sku = validation.data.sku;
    if (!sku || sku.trim() === "") {
        sku = `CAT-${name.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`;
    }

    const category = await Category.create({ 
        name, 
        slug, 
        sku,
        image, 
        parent: parent || null,
        level,
        ancestors,
        description,
        isActive: validation.data.isActive ?? true
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 });
  }
}
