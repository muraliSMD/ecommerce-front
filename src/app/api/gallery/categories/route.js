import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import GalleryCategory from "@/models/GalleryCategory";
import { getFullUserFromRequest, isAdmin } from "@/lib/auth";

export async function GET() {
  await dbConnect();
  try {
    const categories = await GalleryCategory.find().sort({ order: 1, name: 1 });
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching gallery categories" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const user = await getFullUserFromRequest(request);
    if (!isAdmin(user)) {
      return NextResponse.json({ message: "Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    
    if (!body.name || !body.slug) {
        return NextResponse.json({ 
            message: "Name and slug are required"
        }, { status: 400 });
    }

    const category = await GalleryCategory.create(body);
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}

export async function PUT(request) {
  try {
    await dbConnect();
    const user = await getFullUserFromRequest(request);
    if (!isAdmin(user)) {
      return NextResponse.json({ message: "Admin access required" }, { status: 403 });
    }

    const { _id, ...updateData } = await request.json();
    
    if (!_id) {
        return NextResponse.json({ message: "ID is required" }, { status: 400 });
    }

    const category = await GalleryCategory.findByIdAndUpdate(_id, updateData, { new: true });
    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}

export async function DELETE(request) {
    try {
        await dbConnect();
        const user = await getFullUserFromRequest(request);
        if (!isAdmin(user)) {
          return NextResponse.json({ message: "Admin access required" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        
        if (!id) {
            return NextResponse.json({ message: "ID is required" }, { status: 400 });
        }

        await GalleryCategory.findByIdAndDelete(id);
        return NextResponse.json({ message: "Category deleted" });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
}
