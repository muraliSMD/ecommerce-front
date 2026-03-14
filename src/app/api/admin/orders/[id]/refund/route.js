import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import { getFullUserFromRequest, isAdmin } from '@/lib/auth';
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import logger from '@/lib/logger';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    
    // 1. Authenticate Admin
    await dbConnect();
    const user = await getFullUserFromRequest(request);
    
    if (!isAdmin(user)) {
      return NextResponse.json({ message: "Admin access required" }, { status: 403 });
    }

    // 2. Fetch Order
    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // 3. Verify Razorpay Payment Exists
    if (order.paymentMethod !== 'Online' && order.paymentMethod !== 'Razorpay') {
      return NextResponse.json({ message: "Order was not paid via Razorpay/Online" }, { status: 400 });
    }

    if (order.paymentStatus === 'Refunded') {
      return NextResponse.json({ message: "Order has already been refunded" }, { status: 400 });
    }

    if (!order.transactionId) {
      return NextResponse.json({ message: "No Razorpay Transaction ID found for this order" }, { status: 400 });
    }

    // 4. Initialize Razorpay Client
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      logger.error("Razorpay Keys Missing for Refund");
      return NextResponse.json({ message: "Server configuration error" }, { status: 500 });
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // 5. Trigger Refund via Razorpay API
    // If no amount is provided, Razorpay refunds the full captured amount automatically.
    const refundData = await razorpay.payments.refund(order.transactionId, {
      notes: {
        reason: 'Admin triggered refund from dashboard',
        order_internal_id: order.orderId || order._id.toString()
      }
    });

    logger.info(`Refund successful for order ${id}`, { refundId: refundData.id });

    // 6. Update Database
    order.paymentStatus = 'Refunded';
    order.razorpayRefundId = refundData.id;
    await order.save();

    return NextResponse.json({ 
        message: "Refund processed successfully", 
        order 
    });

  } catch (error) {
    console.error("Refund API Error:", error);
    logger.error("Refund API Error", { error: error.message || error });
    // Razorpay throws custom errors that we want to safely relay if possible
    const errorMessage = error.error?.description || error.message || "Failed to process refund";
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
