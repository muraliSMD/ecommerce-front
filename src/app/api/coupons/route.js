import dbConnect from '@/lib/db';
import Coupon from '@/models/Coupon';
import CouponUsage from '@/models/CouponUsage';
import { NextResponse } from 'next/server';
import { getFullUserFromRequest, isAdmin, getUserFromRequest } from '@/lib/auth';

export async function GET(request) {
  try {
    await dbConnect();
    const user = await getFullUserFromRequest(request);

    const { searchParams } = new URL(request.url);
    const availableOnly = searchParams.get('available') === 'true';

    // 1. Admin Request: Return all coupons
    if (user && isAdmin(user) && !availableOnly) {
      const coupons = await Coupon.find({}).sort({ createdAt: -1 });
      return NextResponse.json(coupons);
    }

    // 2. User Request: Return only available coupons
    // Logic: Active, Not Expired, Not Fully Used, AND Not used by this specific user
    const now = new Date();
    let query = {
        isActive: true,
        $or: [
            { expiryDate: { $gt: now } },
            { expiryDate: null } // No expiry
        ]
    };

    let coupons = await Coupon.find(query).sort({ createdAt: -1 });

    // Filter by global usage limit
    coupons = coupons.filter(c => c.usageLimit === null || c.usedCount < c.usageLimit);

    // Filter by User Usage (if user is logged in)
    if (user) {
        const usedCoupons = await CouponUsage.find({ userId: user._id }).select('couponCode');
        const usedCodes = new Set(usedCoupons.map(u => u.couponCode));
        coupons = coupons.filter(c => !usedCodes.has(c.code));
    }

    return NextResponse.json(coupons);

  } catch (error) {
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
    try {
        await dbConnect();
        const user = await getFullUserFromRequest(request);

        if (!user || !isAdmin(user)) {
            return NextResponse.json({ message: "Not authorized" }, { status: 403 });
        }

        const body = await request.json();

        // Basic Validation
        if (!body.code || !body.discountType || !body.value) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        const existingCookie = await Coupon.findOne({ code: body.code.toUpperCase() });
        if (existingCookie) {
             return NextResponse.json({ message: "Coupon code already exists" }, { status: 400 });
        }

        const coupon = await Coupon.create({
            ...body,
            code: body.code.toUpperCase()
        });

        return NextResponse.json(coupon, { status: 201 });

    } catch (error) {
        return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
    }
}
