import dbConnect from '@/lib/db';
import { Category } from '@/models/Category';
import { NextResponse } from 'next/server';
import { getFullUserFromRequest, isAdmin } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    const category = await Category.findById(id);
    
    if (!category) {
      return NextResponse.json({ message: "Category not found" }, { status: 404 });
    }
    
    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json({ message: "Server Error", error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    
    const user = await getFullUserFromRequest(request);
    if (!isAdmin(user)) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    
    const updatedCategory = await Category.findByIdAndUpdate(id, body, { new: true });
    
    if (!updatedCategory) {
      return NextResponse.json({ message: "Category not found" }, { status: 404 });
    }
    
    return NextResponse.json(updatedCategory);
  } catch (error) {
    return NextResponse.json({ message: "Bad request", error: error.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();

    const user = await getFullUserFromRequest(request);
    if (!isAdmin(user)) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    const { id } = await params;
    const deletedCategory = await Category.findByIdAndDelete(id);
    
    if (!deletedCategory) {
      return NextResponse.json({ message: "Category not found" }, { status: 404 });
    }
    
    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    return NextResponse.json({ message: "Server Error", error: error.message }, { status: 500 });
  }
}
