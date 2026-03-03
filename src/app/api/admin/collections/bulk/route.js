import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { getFullUserFromRequest, isAdmin } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    await dbConnect();
    
    const user = await getFullUserFromRequest(request);
    if (!isAdmin(user)) {
      return NextResponse.json({ message: "Admin access required" }, { status: 403 });
    }

    const { productIds, collectionId, action = 'add' } = await request.json();

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ message: "No products selected" }, { status: 400 });
    }

    if (!collectionId) {
       return NextResponse.json({ message: "Collection ID is required" }, { status: 400 });
    }

    if (action === 'add') {
        await Product.updateMany(
            { _id: { $in: productIds } },
            { $addToSet: { collections: collectionId } }
        );
    } else if (action === 'remove') {
        await Product.updateMany(
            { _id: { $in: productIds } },
            { $pull: { collections: collectionId } }
        );
    }

    return NextResponse.json({ message: `Products successfully ${action}ed.` }, { status: 200 });

  } catch (error) {
    console.error("Error bulk updating collections:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 });
  }
}
