import dbConnect from '@/lib/db';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import { getFullUserFromRequest, isAuth } from '@/lib/auth';
import crypto from 'crypto';

export async function POST(request) {
    try {
        await dbConnect();
        const user = await getFullUserFromRequest(request);

        if (!isAuth(user)) {
            return NextResponse.json({ message: "Not authorized" }, { status: 401 });
        }

        const userDoc = await User.findById(user._id);
        
        if (!userDoc.wishlistShareId) {
            userDoc.wishlistShareId = crypto.randomBytes(4).toString('hex'); // 8 characters
            await userDoc.save();
        }

        return NextResponse.json({ shareId: userDoc.wishlistShareId });
    } catch (error) {
        return NextResponse.json({ message: "Server Error", error: error.message }, { status: 500 });
    }
}

export async function GET(request) {
    try {
        await dbConnect();
        const user = await getFullUserFromRequest(request);

        if (!isAuth(user)) {
            return NextResponse.json({ message: "Not authorized" }, { status: 401 });
        }

        const userDoc = await User.findById(user._id);
        return NextResponse.json({ shareId: userDoc.wishlistShareId || null });
    } catch (error) {
        return NextResponse.json({ message: "Server Error", error: error.message }, { status: 500 });
    }
}
