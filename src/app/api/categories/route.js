import dbConnect from '@/lib/db';
import { Category } from '@/models/Category';
import { getFullUserFromRequest, isAdmin } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await dbConnect();
    const categories = await Category.find();
    return NextResponse.json(categories);
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

    const { name, image } = await request.json();
    const category = await Category.create({ name, image });
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
