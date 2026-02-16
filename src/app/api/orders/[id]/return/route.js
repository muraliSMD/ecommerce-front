import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import { getFullUserFromRequest } from "@/lib/auth";

export async function PUT(req, { params }) {
  try {
    const { id } = await params; // Await params for Next.js 15+
    
    // Parse body early to get reason
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
    }
    const { reason } = body;

    if (!reason) {
      return NextResponse.json({ message: "Return reason is required" }, { status: 400 });
    }

    await dbConnect();

    const user = await getFullUserFromRequest(req);
    
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // Check if user is authorized (order owner or admin)
    // user._id is an objectId, convert to string for comparison
    const isOwner = order.user && order.user.toString() === user._id.toString();
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ message: "Not authorized to return this order" }, { status: 403 });
    }

    if (order.orderStatus !== 'Delivered') {
      return NextResponse.json({ message: "Only delivered orders can be returned." }, { status: 400 });
    }

    order.orderStatus = 'Return Requested';
    order.returnReason = reason;
    await order.save();

    return NextResponse.json({ message: "Return requested successfully", order }, { status: 200 });

  } catch (error) {
    console.error("Return request error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
