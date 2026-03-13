import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Product from '@/models/Product'; // Ensure Product is registered
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

// Helper to get user ID from token
async function getUserId() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return null;
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded.userId;
    } catch (error) {
        return null;
    }
}

export async function GET(request) {
    try {
        await dbConnect();
        const userId = await getUserId();
        
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const user = await User.findById(userId).populate('wishlist');
        
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json(user.wishlist);
    } catch (error) {
        return NextResponse.json({ message: "Server Error", error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await dbConnect();
        const userId = await getUserId();
        
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        
        let productIdsToAdd = [];
        if (body.productIds && Array.isArray(body.productIds)) {
            productIdsToAdd = body.productIds;
        } else if (body.productId) {
            productIdsToAdd = [body.productId];
        }

        if (productIdsToAdd.length === 0) {
            return NextResponse.json({ message: "Product ID(s) required" }, { status: 400 });
        }

        const user = await User.findById(userId);
        let updated = false;

        for (const pid of productIdsToAdd) {
             if (!user.wishlist.includes(pid)) {
                 user.wishlist.push(pid);
                 updated = true;
             }
        }

        if (updated) {
            await user.save();
        }

        const updatedUser = await User.findById(userId).populate('wishlist');
        return NextResponse.json(updatedUser.wishlist);
    } catch (error) {
        return NextResponse.json({ message: "Server Error", error: error.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        await dbConnect();
        const userId = await getUserId();
        
        if (!userId) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('productId');
        
        if (!productId) {
            return NextResponse.json({ message: "Product ID required" }, { status: 400 });
        }

        const user = await User.findById(userId);
        user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
        await user.save();

        const updatedUser = await User.findById(userId).populate('wishlist');
        return NextResponse.json(updatedUser.wishlist);
    } catch (error) {
        return NextResponse.json({ message: "Server Error", error: error.message }, { status: 500 });
    }
}
