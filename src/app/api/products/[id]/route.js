import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';
import { getFullUserFromRequest, isAdmin } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    
    let product;
    
    // Check if id is a valid ObjectId
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
        product = await Product.findById(id).populate({ path: 'category', select: 'name slug', strictPopulate: false });
    } 
    
    // If not found by ID or invalid ID, try slug
    if (!product) {
        product = await Product.findOne({ slug: id }).populate({ path: 'category', select: 'name slug', strictPopulate: false });
    }
    
    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }
    
    const { searchParams } = new URL(request.url);
    const isAdminFetch = searchParams.get('admin') === 'true';
    let isAdminUser = false;
    
    if (isAdminFetch) {
      const user = await getFullUserFromRequest(request);
      isAdminUser = !!user && isAdmin(user);
    }
    
    // If the product is disabled and the user is not an admin, return 404
    if (product.isActive === false && !isAdminUser) {
        return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }
    
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ message: "Server Error", error }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    
    // Auth check
    const user = await getFullUserFromRequest(request);
    if (!isAdmin(user)) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    
    const updatedProduct = await Product.findByIdAndUpdate(id, body, { new: true });
    
    if (!updatedProduct) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }
    
    return NextResponse.json(updatedProduct);
  } catch (error) {
    return NextResponse.json({ message: "Bad request", error }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();

    // Auth check
    const user = await getFullUserFromRequest(request);
    if (!isAdmin(user)) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    const { id } = await params;
    const deletedProduct = await Product.findByIdAndDelete(id);
    
    if (!deletedProduct) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }
    
    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    return NextResponse.json({ message: "Server Error", error }, { status: 500 });
  }
}
