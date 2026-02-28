import dbConnect from '@/lib/db';
import User from '@/models/User';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    try {
        await dbConnect();
        const { shareId } = await params;

        const owner = await User.findOne({ wishlistShareId: shareId })
            .populate({
                path: 'wishlist',
                populate: { path: 'category', select: 'name slug' }
            });

        if (!owner) {
            return NextResponse.json({ message: "Wishlist not found" }, { status: 404 });
        }

        return NextResponse.json({
            name: owner.name,
            wishlist: owner.wishlist
        });
    } catch (error) {
        return NextResponse.json({ message: "Server Error", error: error.message }, { status: 500 });
    }
}
