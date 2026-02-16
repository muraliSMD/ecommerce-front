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

        const user = await User.findById(userId).populate('cart.product');
        
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json(user.cart);
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

        const { cartItems } = await request.json(); // Array of { product, quantity, variant }
        
        if (!Array.isArray(cartItems)) {
            return NextResponse.json({ message: "Invalid cart data" }, { status: 400 });
        }

        const user = await User.findById(userId);
        
        // Merge logic: simpler approach - replace or merge? 
        // Strategy: Add incoming items to DB cart. If item exists (same product + variant), update quantity.
        // For sync from local storage on login, we might want to merge local items into DB items.
        
        for (const item of cartItems) {
            // Robust ID extraction
            const incomingProductId = typeof item.product === 'object' ? item.product._id : item.product;
            const incomingVariant = item.variant || {};

            const existingItemIndex = user.cart.findIndex(cartItem => {
                // Determine if products match
                const existingProductId = cartItem.product.toString();
                const productsMatch = existingProductId === incomingProductId.toString();
                
                // Determine if variants match (treating null/undefined/empty string as same)
                const existingVariant = cartItem.variant || {};
                
                const normalize = (val) => (!val ? null : val);
                
                const colorMatch = normalize(existingVariant.color) === normalize(incomingVariant.color);
                const sizeMatch = normalize(existingVariant.size) === normalize(incomingVariant.size);
                
                return productsMatch && colorMatch && sizeMatch;
            });

            if (existingItemIndex > -1) {
                 user.cart[existingItemIndex].quantity += item.quantity;
            } else {
                user.cart.push({
                    product: incomingProductId,
                    quantity: item.quantity,
                    variant: item.variant
                });
            }
        }
        
        await user.save();
        const updatedUser = await User.findById(userId).populate('cart.product');
        return NextResponse.json(updatedUser.cart);

    } catch (error) {
        return NextResponse.json({ message: "Server Error", error: error.message }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        await dbConnect();
        const userId = await getUserId();
        
        if (!userId) {
             return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { product, quantity, variant } = await request.json();
        
        const user = await User.findById(userId);
        const itemIndex = user.cart.findIndex(item => 
            item.product.toString() === product._id && 
            item.variant?.color === variant?.color && 
            item.variant?.size === variant?.size
        );

        if (itemIndex > -1) {
            if (quantity <= 0) {
                user.cart.splice(itemIndex, 1);
            } else {
                user.cart[itemIndex].quantity = quantity;
            }
            await user.save();
        }

        const updatedUser = await User.findById(userId).populate('cart.product');
        return NextResponse.json(updatedUser.cart);

    } catch (error) {
        return NextResponse.json({ message: "Server Error", error: error.message }, { status: 500 });
    }
}
