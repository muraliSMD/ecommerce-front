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
      const coupons = await Coupon.find({}).sort({ createdAt: -1 }).lean();
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

    let coupons = await Coupon.find(query).sort({ createdAt: -1 }).lean();

    // Get usage for the current user to handle both isUsed flag and visibility for exhausted coupons
    let usedCodes = new Set();
    if (user) {
        const userIdStr = user._id.toString();
        const usedCoupons = await CouponUsage.find({ 
            $or: [
                { userId: user._id },
                { userId: userIdStr }
            ]
        }).select('couponCode');
        usedCodes = new Set(usedCoupons.map(u => u.couponCode.toUpperCase().trim()));
    }

    // Filter by global usage limit OR if already used by current user
    // (We show exhausted coupons as "Already Used" if the user has redeemed them)
    coupons = coupons.filter(c => 
        c.usageLimit === null || 
        c.usedCount < c.usageLimit || 
        usedCodes.has(c.code.toUpperCase().trim())
    );

    // Add isUsed flag
    coupons = coupons.map(c => ({
        ...c,
        isUsed: usedCodes.has(c.code.toUpperCase().trim())
    }));

    return NextResponse.json(coupons);

  } catch (error) {
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}

import { couponSchema } from '@/lib/validations/coupon';

export async function POST(request) {
    try {
        await dbConnect();
        const user = await getFullUserFromRequest(request);

        if (!user || !isAdmin(user)) {
            return NextResponse.json({ message: "Not authorized" }, { status: 403 });
        }

        const rawBody = await request.json();
        const validation = couponSchema.safeParse(rawBody);
        
        if (!validation.success) {
            return NextResponse.json({ 
                message: "Validation failed", 
                errors: validation.error.format() 
            }, { status: 400 });
        }

        const body = validation.data;

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
