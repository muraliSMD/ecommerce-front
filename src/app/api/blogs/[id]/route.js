import dbConnect from '@/lib/db';
import Blog from '@/models/Blog';
import { NextResponse } from 'next/server';
import { getFullUserFromRequest, isAdmin } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { id } = await params; // id can be _id or slug

    let blog;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
        blog = await Blog.findById(id).populate('author', 'name');
    }
    
    if (!blog) {
        blog = await Blog.findOne({ slug: id }).populate('author', 'name');
    }

    if (!blog) {
        return NextResponse.json({ message: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json(blog);
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

    const blog = await Blog.findByIdAndUpdate(id, body, { new: true });
    
    if (!blog) {
        return NextResponse.json({ message: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json(blog);
  } catch (error) {
    return NextResponse.json({ message: "Server Error", error: error.message }, { status: 500 });
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
    const blog = await Blog.findByIdAndDelete(id);

    if (!blog) {
        return NextResponse.json({ message: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Blog deleted successfully" });
  } catch (error) {
    return NextResponse.json({ message: "Server Error", error: error.message }, { status: 500 });
  }
}
