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
    const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

    const category = await Category.create({ 
        name, 
        slug,
        image, 
        parent: parent || null,
        level,
        ancestors,
        description
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 });
  }
}
