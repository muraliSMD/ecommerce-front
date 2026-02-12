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
            const existingItemIndex = user.cart.findIndex(cartItem => {
                const sameProduct = cartItem.product.toString() === item.product._id;
                const sameVariant = (cartItem.variant?.color === item.variant?.color) && (cartItem.variant?.size === item.variant?.size);
                return sameProduct && sameVariant;
            });

            if (existingItemIndex > -1) {
                 // Optional: Decide whether to add quantity or replace. 
                 // If syncing from local, we might want to ensure at least that quantity exists.
                 // Let's assume we add qunatity if syncing, or just set it?
                 // For simplicity in a basic sync: if we receive the full cart state, strictly set it?
                 // But wait, if I have 5 items in DB and 2 in local, I want 7? Or just the 2?
                 // Best UX: Merge.
                 // If local=2, DB=5 -> result=7.
                 // However, "POST" here acts as "Sync/Merge".
                 // BUT, typically cart operations are: Add Item, Remove Item, Update Qty.
                 // Let's support "Bulk Sync" here.
                 // If the item comes from local storage, we can assume it's "new" to the session if we are just logging in.
                //  But simplest robust logic:
                //  Take max(local, db) or sum? Sum is safer.
                //  Let's simplisticly overwrite for now OR push. 
                //  Actually, let's make this endpoint "Update Cart" (replace entirely) or "Merge".
                //  Let's do "Merge".

                 user.cart[existingItemIndex].quantity += item.quantity;
            } else {
                user.cart.push({
                    product: item.product._id,
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
