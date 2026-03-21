import dbConnect from '@/lib/db';
import CouponUsage from '@/models/CouponUsage';
import { NextResponse } from 'next/server';
import { getFullUserFromRequest, isAdmin } from '@/lib/auth';

export async function GET(request, { params }) {
    try {
        await dbConnect();
        const user = await getFullUserFromRequest(request);

        if (!user || !isAdmin(user)) {
             return NextResponse.json({ message: "Not authorized" }, { status: 403 });
        }

        const { code } = await params;

        // Fetch usage and populate user details
        const usage = await CouponUsage.find({ couponCode: code.toUpperCase() })
            .populate('userId', 'name email image')
            .populate('orderId', 'orderId totalAmount createdAt')
            .sort({ createdAt: -1 });

        const formattedUsage = usage.map(u => ({
            _id: u._id,
            user: u.userId,
            order: u.orderId,
            usedAt: u.createdAt
        }));

        return NextResponse.json(formattedUsage);

    } catch (error) {
        console.error("Coupon usage fetch error:", error);
        return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
    }
}
