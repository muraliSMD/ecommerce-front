import dbConnect from '@/lib/db';
import Collection from '@/models/Collection';
import { getFullUserFromRequest, isAdmin } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  await dbConnect();
  try {
    const collections = await Collection.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(collections);
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

    const { name, description, isActive } = await request.json();

    if (!name) {
      return NextResponse.json({ message: "Name is required" }, { status: 400 });
    }

    // Generate slug safely
    const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

    // Check if slug already exists
    const existing = await Collection.findOne({ slug });
    if (existing) {
        return NextResponse.json({ message: "A collection with this name already exists" }, { status: 400 });
    }

    const collection = await Collection.create({ 
        name, 
        slug,
        description,
        isActive: isActive !== undefined ? isActive : true
    });

    return NextResponse.json(collection, { status: 201 });
  } catch (error) {
    console.error("Error creating collection:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 });
  }
}
