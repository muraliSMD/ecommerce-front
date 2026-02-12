import dbConnect from '@/lib/db';
import Coupon from '@/models/Coupon';
import { NextResponse } from 'next/server';

export async function GET() {
  await dbConnect();
  
  const existing = await Coupon.findOne({ code: "WELCOME10" });
  if (existing) {
    return NextResponse.json({ message: "WELCOME10 already exists" });
  }

  await Coupon.create({
    code: "WELCOME10",
    discountType: "percentage",
    value: 10,
    minOrderAmount: 0,
    isActive: true
  });

  return NextResponse.json({ message: "Created WELCOME10 coupon" });
}
