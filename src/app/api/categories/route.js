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

export async function POST(request) {
  try {
    await dbConnect();
    
    const user = await getFullUserFromRequest(request);
    if (!isAdmin(user)) {
      return NextResponse.json({ message: "Admin access required" }, { status: 403 });
    }

    // Debugging: Log the raw request info
    console.log("POST /api/categories - Method:", request.method);
    console.log("Headers:", Object.fromEntries(request.headers));

    // Cloning the request to read text without consuming the original stream for json() if needed, 
    // BUT strictly speaking we can just read text() and parse it manually to be safe and debug.
    const bodyText = await request.text();
    console.log("Raw Body:", bodyText);
    
    if (!bodyText) {
        return NextResponse.json({ message: "Empty request body" }, { status: 400 });
    }

    const { name, image, parent, description } = JSON.parse(bodyText);
    
    if (!name) {
        return NextResponse.json({ message: "Name is required" }, { status: 400 });
    }

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
