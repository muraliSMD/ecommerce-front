import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Notification from '@/models/Notification';
import User from '@/models/User';
import { getFullUserFromRequest, isAdmin } from '@/lib/auth';
import { NextResponse } from 'next/server';
import webpush from 'web-push';

if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || 'mailto:admin@example.com',
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
}

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const user = await getFullUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ message: "Not authorized" }, { status: 401 });
    }

    const { id } = await params;
    const order = await Order.findById(id).populate("items.product");
    
    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // Check if user owns the order or is admin
    if (order.user.toString() !== user._id.toString() && !isAdmin(user)) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const user = await getFullUserFromRequest(request);
    if (!isAdmin(user)) {
      return NextResponse.json({ message: "Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    const { orderStatus } = await request.json();
    
    const order = await Order.findByIdAndUpdate(id, { orderStatus }, { new: true });
    
    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // Trigger User Notification
    if (order.user) {
        try {
            await Notification.create({
                recipient: order.user,
                type: "order_status",
                title: "Order Update",
                message: `Your order #${order._id.toString().slice(-6)} is now ${orderStatus}`,
                link: `/account/orders/${order._id}`,
                isRead: false
            });

            // Push to User
            if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
                const userDoc = await User.findById(order.user);
                if (userDoc && userDoc.pushSubscriptions && userDoc.pushSubscriptions.length > 0) {
                    const payload = JSON.stringify({
                        title: "Order Update",
                        body: `Your order #${order._id.toString().slice(-6)} is now ${orderStatus}`,
                        url: `/account/orders/${order._id}`
                    });

                    for (const sub of userDoc.pushSubscriptions) {
                        try {
                            await webpush.sendNotification(sub, payload);
                        } catch (error) {
                            console.error("Error sending push to user", error);
                        }
                    }
                }
            }

        } catch (err) {
            console.error("Failed to create notification", err);
        }
    }

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const user = await getFullUserFromRequest(request);
    
    if (!isAdmin(user)) {
      return NextResponse.json({ message: "Admin access required" }, { status: 403 });
    }

    const { id } = await params;
    const order = await Order.findByIdAndDelete(id);

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Order deleted successfully" });
  } catch (error) {
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}
