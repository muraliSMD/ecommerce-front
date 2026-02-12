import dbConnect from '@/lib/db';
import { Category, Subcategory } from '@/models/Category';
import { getFullUserFromRequest, isAdmin } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  await dbConnect();
  try {
    const categories = await Category.find().lean();
    const subcategories = await Subcategory.find().lean();

    const categoriesWithSubs = categories.map(cat => ({
      ...cat,
      subcategories: subcategories.filter(sub => sub.categoryId.toString() === cat._id.toString())
    }));

    return NextResponse.json(categoriesWithSubs);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  await dbConnect();
  try {
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
