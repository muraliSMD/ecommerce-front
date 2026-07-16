import { NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import logger from "@/lib/logger";

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    const signatureBuffer = Buffer.from(razorpay_signature || "", "utf-8");
    const expectedBuffer = Buffer.from(expectedSignature, "utf-8");

    let isSignatureValid = false;
    if (signatureBuffer.length === expectedBuffer.length) {
      isSignatureValid = crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
    }

    if (isSignatureValid) {
      // Find the order and update it atomically
      const order = await Order.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { 
          $set: { 
            paymentStatus: "Paid", 
            transactionId: razorpay_payment_id,
            orderStatus: "Paid" 
          } 
        },
        { new: true }
      );

      if (!order) {
        logger.error("Order not found during payment verification", { razorpay_order_id });
        return NextResponse.json({ 
            success: false, 
            message: "Order record not found" 
        }, { status: 404 });
      }

      return NextResponse.json({ success: true, message: "Payment verified and order updated" });
    } else {
      return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 400 });
    }
  } catch (error) {
    logger.error("Verification Error", { error: error.message });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
