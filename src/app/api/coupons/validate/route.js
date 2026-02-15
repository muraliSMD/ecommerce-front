import dbConnect from '@/lib/db';
import Coupon from '@/models/Coupon';
import CouponUsage from '@/models/CouponUsage';
import { NextResponse } from 'next/server';
import { getFullUserFromRequest } from '@/lib/auth';

export async function POST(request) {
  try {
    await dbConnect();
    const { code, cartTotal } = await request.json();
    const user = await getFullUserFromRequest(request);

    if (!code) {
      return NextResponse.json({ message: "Code is required" }, { status: 400 });
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

    if (!coupon) {
      return NextResponse.json({ message: "Invalid or inactive coupon" }, { status: 404 });
    }

    // Check expiry
    if (coupon.expiryDate && new Date() > new Date(coupon.expiryDate)) {
      return NextResponse.json({ message: "Coupon has expired" }, { status: 400 });
    }

    // Check usage limit
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
        return NextResponse.json({ message: "Coupon usage limit reached" }, { status: 400 });
    }

    // Check if user has already used this coupon
    if (user) {
        const usage = await CouponUsage.findOne({ userId: user._id, couponCode: coupon.code });
        if (usage) {
            return NextResponse.json({ message: "You have already used this coupon" }, { status: 400 });
        }
    }

    // Check min order amount
    if (cartTotal < coupon.minOrderAmount) {
        return NextResponse.json({ message: `Minimum order of $${coupon.minOrderAmount} required` }, { status: 400 });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
        discountAmount = (cartTotal * coupon.value) / 100;
        if (coupon.maxDiscountAmount) {
            discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
        }
    } else {
        discountAmount = coupon.value;
    }

    // Ensure discount doesn't exceed total
    discountAmount = Math.min(discountAmount, cartTotal);

    return NextResponse.json({
        success: true,
        code: coupon.code,
        discountAmount,
        discountType: coupon.discountType,
        value: coupon.value
    });

  } catch (error) {
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}
