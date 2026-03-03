import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';

export async function GET() {
  await dbConnect();
  const products = await Product.find({ "images": { $not: /cloudinary/ } }).select('images name').limit(10);
  return NextResponse.json(products);
}
