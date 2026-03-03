import dbConnect from '@/lib/db';
import Collection from '@/models/Collection';
import { getFullUserFromRequest, isAdmin } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    
    const user = await getFullUserFromRequest(request);
    if (!isAdmin(user)) {
      return NextResponse.json({ message: "Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const collection = await Collection.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!collection) {
      return NextResponse.json({ message: "Collection not found" }, { status: 404 });
    }

    return NextResponse.json(collection);
  } catch (error) {
    console.error("Error updating collection:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    
    const user = await getFullUserFromRequest(request);
    if (!isAdmin(user)) {
      return NextResponse.json({ message: "Admin access required" }, { status: 403 });
    }

    const { id } = await params;

    const collection = await Collection.findByIdAndDelete(id);

    if (!collection) {
      return NextResponse.json({ message: "Collection not found" }, { status: 404 });
    }

    // Also remove this collection from any products that have it
    const Product = (await import('@/models/Product')).default;
    await Product.updateMany(
        { collections: id },
        { $pull: { collections: id } }
    );

    return NextResponse.json({ message: "Collection deleted successfully" });
  } catch (error) {
    console.error("Error deleting collection:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 });
  }
}
