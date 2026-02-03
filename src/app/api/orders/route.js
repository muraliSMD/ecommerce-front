import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import { NextResponse } from 'next/server';
import { getFullUserFromRequest, isAdmin, getUserFromRequest } from '@/lib/auth';

export async function GET(request) {
  try {
    await dbConnect();
    const user = await getFullUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ message: "Not authorized" }, { status: 401 });
    }

    let query = { user: user._id };
    
    // Admin can see all orders
    if (isAdmin(user)) {
      query = {};
    }

    const orders = await Order.find(query)
      .populate("items.product")
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const userPayload = await getUserFromRequest(request);
    const body = await request.json();
    
    let items = [];
    const userId = userPayload ? userPayload.userId : null;

    // Priority: Use items from request body (Client-side cart source of truth)
    if (body.items && body.items.length > 0) {
      items = body.items.map((i) => ({
        product: i.product,
        quantity: i.quantity,
        variant: i.variant,
        price: i.price,
      }));
    } 
    // Fallback: Check Server-side DB cart if body items missing (Legacy/Backup)
    else if (userId) {
      const cart = await Cart.findOne({ user: userId }).populate("items.product");
      if (cart && cart.items.length > 0) {
        items = cart.items.map((i) => ({
          product: i.product._id,
          quantity: i.quantity,
          variant: i.variant,
          price: i.product.price,
        }));
        
        // Clear server cart
        cart.items = [];
        await cart.save();
      }
    }

    if (items.length === 0) {
       return NextResponse.json({ message: "Cart is empty" }, { status: 400 });
    }

    let totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    // Apply Discount if any
    const discountAmount = body.paymentInfo?.discountAmount ? Number(body.paymentInfo.discountAmount) : 0;
    const finalAmount = Math.max(0, totalAmount + (body.shippingCharge || 0) + (body.taxAmount || 0) - discountAmount);
    
    // Note: In real app, re-validate coupon here backend-side to prevent tampering. 
    // For now taking client value but ensure we implement server-side re-calc later.

    const order = await new Order({
      user: userId,
      items,
      totalAmount: finalAmount, // Saved as the discounted final total
      discountAmount: discountAmount,
      couponCode: body.paymentInfo?.couponCode,
      paymentMethod: body.paymentMethod || "COD",
      shippingAddress: body.shippingAddress,
      paymentStatus: body.paymentMethod === 'COD' ? 'pending' : 'Paid'
    }).save();

    // Reduce stock
    for (const i of items) {
      if (i.variant && i.variant.color && i.variant.size) {
        // Reduce stock from specific variant
        await Product.findOneAndUpdate(
          { _id: i.product, "variants.color": i.variant.color, "variants.size": i.variant.size },
          { $inc: { "variants.$.stock": -i.quantity } }
        );
      } else {
        // Fallback: Reduce global stock if no variant
        await Product.findByIdAndUpdate(i.product, { $inc: { stock: -i.quantity } });
      }
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}
