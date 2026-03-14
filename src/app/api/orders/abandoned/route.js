import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Counter from '@/models/Counter';
import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import logger from '@/lib/logger';

export async function POST(request) {
  try {
    await dbConnect();
    const userPayload = await getUserFromRequest(request);
    const body = await request.json();
    
    const userId = userPayload ? userPayload.userId : null;

    // --- Generate Sequential Order ID (same as regular orders but maybe different prefix if desired, 
    // but user wanted it in general orders list, so same sequence is fine) ---
    let orderId = `GRY-ABD-${Date.now().toString().slice(-6)}`; 
    try {
        const counter = await Counter.findOneAndUpdate(
            { id: 'orderNumber' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        const sequence = counter.seq.toString().padStart(5, '0');
        orderId = `GRY-ABD-${sequence}`; // Using ABD prefix for abandoned
    } catch (counterError) {
        logger.error("Failed to generate sequential orderId for abandoned checkout", { error: counterError.message });
    }

    const order = await new Order({
      orderId,
      user: userId,
      items: body.items,
      totalAmount: body.totalAmount || 0,
      shippingCharge: body.shippingCharge || 0,
      taxAmount: body.taxAmount || 0,
      discountAmount: body.discountAmount || 0,
      couponCode: body.couponCode || null,
      paymentMethod: body.paymentMethod || "Online",
      shippingAddress: body.shippingAddress,
      paymentStatus: "Failed",
      orderStatus: body.reason === "failed" ? "Payment Failed" : "Abandoned",
    }).save();

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    logger.error("Failed to log abandoned checkout", { error: error.message, stack: error.stack });
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}
