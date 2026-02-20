import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import Notification from '@/models/Notification';
import User from '@/models/User';
import Coupon from '@/models/Coupon';
import CouponUsage from '@/models/CouponUsage';
import { NextResponse } from 'next/server';
import { getFullUserFromRequest, isAdmin, getUserFromRequest } from '@/lib/auth';
import webpush from 'web-push';

if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || 'mailto:admin@example.com',
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );
}

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

import { sendWhatsAppMessage } from "@/lib/whatsapp";

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
    
    // --- Server-Side Coupon Validation & Discount Calculation ---
    let discountAmount = 0;
    let usedCoupon = null;
    const couponCode = body.paymentInfo?.couponCode;

    if (couponCode) {
        const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
        
        if (coupon) {
            // 1. Check Expiry
            if (coupon.expiryDate && new Date() > new Date(coupon.expiryDate)) {
                 return NextResponse.json({ message: "Coupon has expired" }, { status: 400 });
            }

            // 2. Check Global Usage Limit
            if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
                 return NextResponse.json({ message: "Coupon global usage limit reached" }, { status: 400 });
            }

            // 3. Check User Usage (One-time use)
            if (userId) {
                const usage = await CouponUsage.findOne({ userId, couponCode: coupon.code });
                if (usage) {
                    return NextResponse.json({ message: "You have already used this coupon" }, { status: 400 });
                }
            }

            // 4. Check Min Order Amount
            if (totalAmount < coupon.minOrderAmount) {
                 return NextResponse.json({ message: `Minimum order of $${coupon.minOrderAmount} required for this coupon` }, { status: 400 });
            }

            // 5. Calculate Discount
            if (coupon.discountType === 'percentage') {
                discountAmount = (totalAmount * coupon.value) / 100;
                if (coupon.maxDiscountAmount) {
                    discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
                }
            } else {
                discountAmount = coupon.value;
            }

            // Cap discount at total amount
            discountAmount = Math.min(discountAmount, totalAmount);
            usedCoupon = coupon;
        } else {
            // Coupon provided but invalid/not found
            return NextResponse.json({ message: "Invalid coupon code" }, { status: 400 });
        }
    }
    
    // Calculate Final Amount
    const finalAmount = Math.max(0, totalAmount + (body.shippingCharge || 0) + (body.taxAmount || 0) - discountAmount);
    
    const order = await new Order({
      user: userId,
      items,
      totalAmount: finalAmount, 
      discountAmount: discountAmount,
      couponCode: usedCoupon ? usedCoupon.code : null,
      paymentMethod: body.paymentMethod || "COD",
      shippingAddress: body.shippingAddress,
      paymentStatus: body.paymentMethod === 'COD' ? 'pending' : 'Paid'
    }).save();

    // --- Post-Order Extensions ---
    
    // 1. Record Coupon Usage & Increment Count
    if (usedCoupon) {
        await Coupon.findByIdAndUpdate(usedCoupon._id, { $inc: { usedCount: 1 } });
        if (userId) {
            await CouponUsage.create({
                userId,
                couponCode: usedCoupon.code,
                orderId: order._id
            });
        }
    }

    // 2. Reduce stock
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

    // 3. Trigger Admin Notification
    try {
        await Notification.create({
            recipient: "admin",
            type: "order_new",
            title: "New Order Received",
            message: `Order #${order._id.toString().slice(-6)} placed by ${body.shippingAddress?.name || "Guest"}`,
            link: `/admin/orders/${order._id}`,
            isRead: false
        });
        
        // Push to Admins
        if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
            const admins = await User.find({ role: 'admin' });
            const payload = JSON.stringify({
                title: "New Order Received",
                body: `Order #${order._id.toString().slice(-6)} placed by ${body.shippingAddress?.name || "Guest"}`,
                url: `/admin/orders/${order._id}`
            });

            for (const admin of admins) {
                if (admin.pushSubscriptions && admin.pushSubscriptions.length > 0) {
                    for (const sub of admin.pushSubscriptions) {
                        try {
                            await webpush.sendNotification(sub, payload);
                        } catch (error) {
                            console.error("Error sending push to admin", error);
                            // Optional: remove invalid subscription logic here
                        }
                    }
                }
            }
        }

    } catch (err) {
        console.error("Failed to create notification", err);
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}
