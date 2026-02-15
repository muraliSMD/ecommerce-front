import dbConnect from '@/lib/db';
import Coupon from '@/models/Coupon';
import { NextResponse } from 'next/server';
import { getFullUserFromRequest, isAdmin } from '@/lib/auth';

export async function GET(request, { params }) {
    try {
        await dbConnect();
        const user = await getFullUserFromRequest(request);

        if (!user || !isAdmin(user)) {
             return NextResponse.json({ message: "Not authorized" }, { status: 403 });
        }

        const coupon = await Coupon.findById(params.id);
        if (!coupon) {
             return NextResponse.json({ message: "Coupon not found" }, { status: 404 });
        }

        return NextResponse.json(coupon);

    } catch (error) {
        return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    try {
        await dbConnect();
        const user = await getFullUserFromRequest(request);

        if (!user || !isAdmin(user)) {
             return NextResponse.json({ message: "Not authorized" }, { status: 403 });
        }

        const body = await request.json();
        const coupon = await Coupon.findByIdAndUpdate(params.id, body, { new: true });

        if (!coupon) {
             return NextResponse.json({ message: "Coupon not found" }, { status: 404 });
        }

        return NextResponse.json(coupon);

    } catch (error) {
        return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        await dbConnect();
        const user = await getFullUserFromRequest(request);

        if (!user || !isAdmin(user)) {
             return NextResponse.json({ message: "Not authorized" }, { status: 403 });
        }

        const coupon = await Coupon.findByIdAndDelete(params.id);

        if (!coupon) {
             return NextResponse.json({ message: "Coupon not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Coupon deleted" });

    } catch (error) {
        return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
    }
}
