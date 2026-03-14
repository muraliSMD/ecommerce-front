import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Gallery from "@/models/Gallery";
import GalleryCategory from "@/models/GalleryCategory";
import { getFullUserFromRequest, isAdmin } from "@/lib/auth";

export async function GET(request) {
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("category");
    const activeOnly = searchParams.get("activeOnly") === "true";

    let query = {};
    if (categoryId && categoryId !== "All") {
      query.category = categoryId;
    }
    if (activeOnly) {
      query.isActive = true;
    }

    const items = await Gallery.find(query)
      .populate("category", "name slug")
      .sort({ order: 1, createdAt: -1 })
      .lean();
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching gallery items" },
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
    
    // Simple validation
    if (!body.imageUrl || !body.category) {
        return NextResponse.json({ 
            message: "Image URL and category are required"
        }, { status: 400 });
    }

    const item = await Gallery.create(body);
    const populatedItem = await Gallery.findById(item._id).populate("category", "name slug");
    return NextResponse.json(populatedItem, { status: 201 });
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

    const item = await Gallery.findByIdAndUpdate(_id, updateData, { new: true });
    return NextResponse.json(item);
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

        await Gallery.findByIdAndDelete(id);
        return NextResponse.json({ message: "Gallery item deleted" });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
}
