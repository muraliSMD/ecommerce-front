import dbConnect from '@/lib/db';
import Cart from '@/models/Cart';
import { getUserFromRequest } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    await dbConnect();
    const userPayload = await getUserFromRequest(request);
    
    if (userPayload) {
      const cart = await Cart.findOne({ user: userPayload.userId }).populate("items.product");
      return NextResponse.json(cart || { items: [] });
    } else {
      return NextResponse.json({ items: [] });
    }
  } catch (error) {
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const userPayload = await getUserFromRequest(request);
    if (!userPayload) {
      return NextResponse.json({ message: "Not authorized" }, { status: 401 });
    }

    const { product, quantity, variant } = await request.json();
    let cart = await Cart.findOne({ user: userPayload.userId });
    if (!cart) cart = new Cart({ user: userPayload.userId, items: [] });

    const existingItem = cart.items.find(
      (item) =>
        item.product.toString() === product._id &&
        item.variant?.color === variant?.color &&
        item.variant?.size === variant?.size
    );

    if (existingItem) {
      existingItem.quantity += quantity;
      if (existingItem.quantity <= 0) {
        cart.items = cart.items.filter(
          (i) =>
            !(
              i.product.toString() === product._id &&
              i.variant?.color === variant?.color &&
              i.variant?.size === variant?.size
            )
        );
      }
    } else if (quantity > 0) {
      cart.items.push({
        product: product._id,
        quantity,
        variant: {
          color: variant?.color,
          size: variant?.size,
          price: variant?.price || product.price,
        },
      });
    }

    await cart.save();
    await cart.populate("items.product");
    return NextResponse.json(cart);
  } catch (error) {
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}
