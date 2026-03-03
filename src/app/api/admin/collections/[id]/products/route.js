import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { getFullUserFromRequest, isAdmin } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const user = await getFullUserFromRequest(request);
    if (!isAdmin(user)) {
      return NextResponse.json({ message: "Admin access required" }, { status: 403 });
    }

    const { id: collectionId } = await params;

    // Fetch products that have this collection ID
    const products = await Product.find({ collections: collectionId }).select('_id').lean();
    
    // Return an array of just the product IDs as strings
    return NextResponse.json(products.map(p => p._id.toString()));
  } catch (error) {
    console.error("Error fetching collection products:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    
    const user = await getFullUserFromRequest(request);
    if (!isAdmin(user)) {
      return NextResponse.json({ message: "Admin access required" }, { status: 403 });
    }

    const { id: collectionId } = await params;
    const { productIds } = await request.json();

    if (!Array.isArray(productIds)) {
      return NextResponse.json({ message: "productIds must be an array" }, { status: 400 });
    }

    // Make sure productIds contains string representations
    const targetProductIds = productIds.map(id => id.toString());

    // Find all products currently in this collection
    const currentProducts = await Product.find({ collections: collectionId }).select('_id').lean();
    const currentProductIds = currentProducts.map(p => p._id.toString());

    // Products to add: in targetProductIds array but NOT in currentProductIds
    const toAdd = targetProductIds.filter(id => !currentProductIds.includes(id));
    
    // Products to remove: in currentProductIds but NOT in targetProductIds array
    const toRemove = currentProductIds.filter(id => !targetProductIds.includes(id));

    console.log("Collection sync:", { targetProductIds, currentProductIds, toAdd, toRemove });

    // Execute updates
    const updates = [];
    
    if (toAdd.length > 0) {
        updates.push(Product.updateMany(
            { _id: { $in: toAdd } },
            { $addToSet: { collections: collectionId } }
        ));
    }

    if (toRemove.length > 0) {
        updates.push(Product.updateMany(
            { _id: { $in: toRemove } },
            { $pull: { collections: collectionId } }
        ));
    }

    if (updates.length > 0) {
        await Promise.all(updates);
    }

    return NextResponse.json({ message: "Products synced successfully" });

  } catch (error) {
    console.error("Error syncing collection products:", error);
    return NextResponse.json({ message: error.message || "Internal Server Error" }, { status: 500 });
  }
}
