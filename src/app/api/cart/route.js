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

    // Fetch the actual product document from DB to verify stock limits
    const Product = require('@/models/Product').default || require('@/models/Product');
    const actualProduct = await Product.findById(product._id);
    if (!actualProduct) {
        return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }
    
    // Find the matching variant in the DB product, if one was provided
    let stockLimit = actualProduct.stock;
    if (variant && actualProduct.variants && actualProduct.variants.length > 0) {
        const dbVariant = actualProduct.variants.find(
            v => v.color === variant.color && v.size === variant.size
        );
        if (dbVariant) {
            stockLimit = dbVariant.stock;
        }
    }

    if (existingItem) {
      if (existingItem.quantity + quantity > stockLimit) {
        return NextResponse.json({ message: "Requested quantity exceeds available stock" }, { status: 400 });
      }

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
      if (quantity > stockLimit) {
        return NextResponse.json({ message: "Requested quantity exceeds available stock" }, { status: 400 });
      }

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
