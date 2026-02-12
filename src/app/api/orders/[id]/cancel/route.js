import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Notification from '@/models/Notification';
import User from '@/models/User';
import webpush from 'web-push';
import { getFullUserFromRequest } from '@/lib/auth';
import { NextResponse } from 'next/server';

if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || 'mailto:admin@example.com',
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const user = await getFullUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ message: "Not authorized" }, { status: 401 });
    }

    const { id } = await params;
    const { reason } = await request.json();

    const order = await Order.findById(id).populate("items.product");

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    if (order.user.toString() !== user._id.toString()) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    if (!['Pending', 'Processing'].includes(order.orderStatus)) {
        return NextResponse.json({ message: "Order cannot be cancelled at this stage" }, { status: 400 });
    }

    // Update Order
    order.orderStatus = 'Cancelled';
    order.cancellationReason = reason;
    await order.save();

    // Restore Stock
    for (const item of order.items) {
        if (item.variant && item.variant.color && item.variant.size) {
            await Product.findOneAndUpdate(
                { _id: item.product._id, "variants.color": item.variant.color, "variants.size": item.variant.size },
                { $inc: { "variants.$.stock": item.quantity } }
            );
        } else {
            await Product.findByIdAndUpdate(item.product._id, { $inc: { stock: item.quantity } });
        }
    }

    // Notify Admin
    try {
        await Notification.create({
            recipient: "admin",
            type: "order_status",
            title: "Order Cancelled",
            message: `Order #${order._id.toString().slice(-6)} was cancelled by user. Reason: ${reason}`,
            link: `/admin/orders/${order._id}`,
            isRead: false
        });

        // Push to Admin
        if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
            const admins = await User.find({ role: 'admin' });
             const payload = JSON.stringify({
                title: "Order Cancelled",
                body: `Order #${order._id.toString().slice(-6)} cancelled by user.`,
                url: `/admin/orders/${order._id}`
            });

            for (const admin of admins) {
                if (admin.pushSubscriptions?.length > 0) {
                    for (const sub of admin.pushSubscriptions) {
                        try { await webpush.sendNotification(sub, payload); } catch (e) {}
                    }
                }
            }
        }
    } catch (err) {
        console.error("Failed to notify admin about cancellation", err);
    }

    return NextResponse.json({ message: "Order cancelled successfully", order });

  } catch (error) {
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}
