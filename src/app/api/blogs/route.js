import dbConnect from '@/lib/db';
import Blog from '@/models/Blog';
import { NextResponse } from 'next/server';
import { getFullUserFromRequest, isAdmin } from '@/lib/auth';

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const publishedOnly = searchParams.get('published') === 'true';
    
    let query = {};
    if (publishedOnly) {
        query.isPublished = true;
    }

    const blogs = await Blog.find(query)
      .populate('author', 'name')
      .sort({ createdAt: -1 });

    return NextResponse.json(blogs);
  } catch (error) {
    return NextResponse.json({ message: "Server Error", error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    
    // Auth Check
    const user = await getFullUserFromRequest(request);
    if (!isAdmin(user)) {
        return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    
    // Basic validation
    if (!body.title || !body.content || !body.slug) {
        return NextResponse.json({ message: "Title, Content and Slug are required" }, { status: 400 });
    }

    // Check slug uniqueness
    const existing = await Blog.findOne({ slug: body.slug });
    if (existing) {
        return NextResponse.json({ message: "Slug already exists" }, { status: 400 });
    }

    const blog = await Blog.create({
        ...body,
        author: user._id
    });

    return NextResponse.json(blog, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Server Error", error: error.message }, { status: 500 });
  }
}
