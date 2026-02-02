import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import { getUserFromRequest } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    await dbConnect();
    const userPayload = await getUserFromRequest(request);
    if (!userPayload) {
      return NextResponse.json({ message: "Not authorized" }, { status: 401 });
    }

    const orders = await Order.find({ user: userPayload.userId }).populate("items.product");
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

    if (userId) {
      const cart = await Cart.findOne({ user: userId }).populate("items.product");
      if (!cart || cart.items.length === 0) {
        return NextResponse.json({ message: "Cart is empty" }, { status: 400 });
      }

      items = cart.items.map((i) => ({
        product: i.product._id,
        quantity: i.quantity,
        variant: i.variant,
        price: i.product.price,
      }));

      // Clear cart
      cart.items = [];
      await cart.save();
    } else {
      if (!body.items || body.items.length === 0) {
        return NextResponse.json({ message: "Cart is empty" }, { status: 400 });
      }
      items = body.items.map((i) => ({
        product: i.product,
        quantity: i.quantity,
        variant: i.variant,
        price: i.price,
      }));
    }

    const totalAmount = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const order = await new Order({
      user: userId,
      items,
      totalAmount,
      paymentMethod: body.paymentMethod || "COD",
      shippingAddress: body.shippingAddress,
      pymentStatus: body.paymentMethod === 'COD' ? 'pending' : 'Paid'
    }).save();

    // Reduce stock
    for (const i of items) {
      await Product.findByIdAndUpdate(i.product, { $inc: { stock: -i.quantity } });
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}
