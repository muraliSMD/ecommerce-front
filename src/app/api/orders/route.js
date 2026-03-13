import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import Notification from '@/models/Notification';
import User from '@/models/User';
import Coupon from '@/models/Coupon';
import CouponUsage from '@/models/CouponUsage';
import Counter from '@/models/Counter';
import { NextResponse } from 'next/server';
import { getFullUserFromRequest, isAdmin, getUserFromRequest } from '@/lib/auth';
import webpush from 'web-push';
import logger from '@/lib/logger';

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
    } else {
      // Auto-link any previous guest orders with the same email
      await Order.updateMany(
        { 
          $or: [{ user: { $exists: false } }, { user: null }], 
          "shippingAddress.email": user.email 
        },
        { $set: { user: user._id } }
      );
    }

    const orders = await Order.find(query)
      .populate("items.product")
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(orders);
  } catch (error) {
    logger.error("Failed to fetch orders", { error: error.message, stack: error.stack });
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}

import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { rateLimit } from '@/lib/rateLimit';
import { checkoutSchema } from '@/lib/validations/order';
import { sendOrderConfirmationEmail, sendLowStockAlert } from '@/lib/email';

export async function POST(request) {
  try {
    // 1. Rate Limiting (Max 5 orders per minute per IP to prevent spam/card testing)
    const rateLimitResponse = rateLimit(request, 5, 60000);
    if (rateLimitResponse) return rateLimitResponse;

    await dbConnect();
    const userPayload = await getUserFromRequest(request);
    
    // Parse JSON
    const rawBody = await request.json();

    // 2. Schema Validation
    const validation = checkoutSchema.safeParse(rawBody);
    if (!validation.success) {
         return NextResponse.json(
            { message: "Validation failed", errors: validation.error.format() }, 
            { status: 400 }
         );
    }
    
    const body = validation.data;
    
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
    
    // --- Generate Sequential Order ID ---
    let orderId = `GRY-ORD-${Date.now().toString().slice(-6)}`; // Fallback
    try {
        const counter = await Counter.findOneAndUpdate(
            { id: 'orderNumber' },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );
        const sequence = counter.seq.toString().padStart(5, '0');
        orderId = `GRY-ORD-${sequence}`;
    } catch (counterError) {
        logger.error("Failed to generate sequential orderId", { error: counterError.message });
    }

    // Calculate final total
    const shippingCharge = body.shippingCharge || 0;
    const taxAmount = body.taxAmount || 0;
    const finalAmount = Math.max(0, totalAmount - discountAmount + shippingCharge + taxAmount);

    const order = await new Order({
      orderId,
      user: userId,
      items,
      totalAmount: finalAmount, 
      shippingCharge: shippingCharge,
      taxAmount: taxAmount,
      discountAmount: discountAmount,
      couponCode: usedCoupon ? usedCoupon.code : null,
      transactionId: body.paymentInfo?.transactionId,
      razorpayOrderId: body.paymentInfo?.razorpayOrderId,
      paymentMethod: body.paymentMethod || "COD",
      shippingAddress: body.shippingAddress,
      paymentStatus: 'pending', // SANITIZED: Always start as pending. Online orders updated via verification.
      orderStatus: 'Processing' // Force initial status
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

    // 2. Reduce stock & Check for Low Stock
    for (const item of items) {
        try {
            const product = await Product.findById(item.product);
            if (!product) continue;

            let updatedProduct;
            let currentStock = 0;
            let targetVariant = null;

            if (product.hasVariants && item.variant) {
                // Determine which variant fields were actually provided
                const queryConditions = { _id: item.product };
                const validKeys = ['color', 'size', 'length', 'age', 'nSize', 'withBlouse', 'blouseMeter', 'silkType'];
                
                for (const key of validKeys) {
                    if (item.variant[key] !== undefined && item.variant[key] !== null && item.variant[key] !== "") {
                        queryConditions[`variants.${key}`] = item.variant[key];
                    }
                }

                // Find and update specific variant stock AND parent stock
                updatedProduct = await Product.findOneAndUpdate(
                    queryConditions,
                    { 
                        $inc: { 
                            "variants.$.stock": -item.quantity,
                            "stock": -item.quantity 
                        } 
                    },
                    { new: true }
                );

                if (updatedProduct) {
                    targetVariant = updatedProduct.variants.find(v => {
                        return validKeys.every(k => {
                            if (item.variant[k]) return v[k] === item.variant[k];
                            return true; // Ignore keys not in the order
                        });
                    });
                    currentStock = targetVariant ? targetVariant.stock : 0;
                }
            } else {
                // Update top-level stock
                updatedProduct = await Product.findByIdAndUpdate(
                    item.product,
                    { $inc: { stock: -item.quantity } },
                    { new: true }
                );
                currentStock = updatedProduct ? updatedProduct.stock : 0;
            }

            // Trigger Low Stock Alert (Threshold: 5)
            if (updatedProduct && currentStock <= 5 && currentStock >= 0) {
                await sendLowStockAlert(updatedProduct, targetVariant);
            }
        } catch (stockError) {
            logger.error("Failed to update stock or send alert", { 
                error: stockError.message, 
                productId: item.product 
            });
        }
    }

    // 3. Trigger Admin Notification & Push in Background
    (async () => {
        try {
            await Notification.create({
                recipient: "admin",
                type: "order_new",
                title: "New Order Received",
                message: `Order #${order.orderId} placed by ${body.shippingAddress?.name || "Guest"}`,
                link: `/admin/orders/${order._id}`,
                isRead: false
            });
            
            // Push to Admins
            if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
                const admins = await User.find({ role: 'admin' });
                const payload = JSON.stringify({
                    title: "New Order Received",
                    body: `Order #${order.orderId} placed by ${body.shippingAddress?.name || "Guest"}`,
                    url: `/admin/orders/${order._id}`
                });

                for (const admin of admins) {
                    if (admin.pushSubscriptions && admin.pushSubscriptions.length > 0) {
                        let updatedSubscriptions = [...admin.pushSubscriptions];
                        let needsUpdate = false;

                        for (const sub of admin.pushSubscriptions) {
                            try {
                                await webpush.sendNotification(sub, payload);
                            } catch (error) {
                                if (error.statusCode === 410 || error.statusCode === 404) {
                                    updatedSubscriptions = updatedSubscriptions.filter(s => s.endpoint !== sub.endpoint);
                                    needsUpdate = true;
                                    logger.info(`Pruning expired push subscription for admin ${admin._id}`);
                                } else {
                                    logger.error("Error sending push to admin", { error: error.message, adminId: admin._id });
                                }
                            }
                        }

                        if (needsUpdate) {
                            await User.findByIdAndUpdate(admin._id, { pushSubscriptions: updatedSubscriptions });
                        }
                    }
                }
            }
        } catch (err) {
            logger.error("Failed to execute background push notifications", { error: err.message });
        }
    })();

    // 4. Send Order Confirmation Email in Background
    (async () => {
        try {
            // Fetch the full order with populated products for the email
            const populatedOrder = await Order.findById(order._id).populate('items.product').lean();
            
            let recipientEmail = body.shippingAddress?.email;
            let recipientName = body.shippingAddress?.name;

            // If no email in shipping address, try to get from user object
            if (!recipientEmail && userId) {
                const user = await User.findById(userId).lean();
                if (user) {
                    recipientEmail = user.email;
                    recipientName = recipientName || user.name;
                }
            }

            if (recipientEmail) {
                await sendOrderConfirmationEmail(populatedOrder, { 
                    email: recipientEmail, 
                    name: recipientName 
                });
            }
        } catch (emailError) {
            logger.error("Failed to send background order confirmation email", { 
                orderId: order._id, 
                error: emailError.message 
            });
        }
    })();

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}
