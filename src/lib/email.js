import nodemailer from 'nodemailer';
import logger from '@/lib/logger';
import Settings from '@/models/Settings';
import dbConnect from '@/lib/db';

const getBaseUrl = () => {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
};

async function getEmailSettings() {
  await dbConnect();
  const settings = await Settings.findOne().lean();
  return settings || { 
    siteName: 'GRABSZY', 
    supportEmail: 'support@grabszy.com' 
  };
}

const isSecure = process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: isSecure,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async ({ to, subject, html, text, fromAddress, replyTo }) => {
  try {
    const settings = await getEmailSettings();
    const fromName = process.env.SMTP_FROM_NAME || settings.siteName || 'GRABSZY';
    const finalFrom = fromAddress 
      ? `"${fromName}" <${fromAddress}>` 
      : `"${fromName}" <${process.env.SMTP_USER}>`;

    const info = await transporter.sendMail({
      from: finalFrom,
      to,
      subject,
      html,
      text: text || "Please view this email in an HTML-compatible client.", // Fallback
      replyTo: replyTo || settings.supportEmail || "support@grabszy.com",
    });
    logger.info("Email sent successfully", { messageId: info.messageId, to, subject });
    return info;
  } catch (error) {
    logger.error("Error sending email", { error: error.message, to, subject });
    throw new Error("Email could not be sent");
  }
};

export const sendWelcomeEmail = async (user) => {
    const settings = await getEmailSettings();
    const siteName = settings.siteName || 'GRABSZY';
    
    const html = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h1>Welcome to ${siteName}, ${user.name}!</h1>
        <p>We're thrilled to have you on board. Start shopping now for the best deals!</p>
        <a href="${getBaseUrl()}" style="display: inline-block; padding: 10px 20px; color: #fff; background-color: #007bff; text-decoration: none; border-radius: 5px;">Shop Now</a>
      </div>
    `;
    const text = `Welcome to ${siteName}, ${user.name}!\n\nWe're thrilled to have you on board. Start shopping now for the best deals at ${getBaseUrl()}`;
    
    await sendEmail({ 
      to: user.email, 
      subject: `Welcome to ${siteName}! 🎉`, 
      html,
      text,
      fromAddress: `noreply@${siteName.toLowerCase()}.com`
    });
};

export const sendPasswordResetEmail = async (user, token) => {
    const settings = await getEmailSettings();
    const siteName = settings.siteName || 'GRABSZY';
    const resetUrl = `${getBaseUrl()}/reset-password/${token}`;
    const html = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h1>Reset Your Password</h1>
        <p>You requested a password reset. Click the button below to reset it (valid for 1 hour):</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; color: #fff; background-color: #dc3545; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `;
    const text = `Reset Your Password\n\nYou requested a password reset. Please use the following link to reset it (valid for 1 hour):\n\n${resetUrl}\n\nIf you didn't request this, please ignore this email.`;

    await sendEmail({ 
      to: user.email, 
      subject: "Password Reset Request 🔒", 
      html,
      text,
      fromAddress: `noreply@${siteName.toLowerCase()}.com`
    });
};

export const sendOrderConfirmationEmail = async (order, user) => {
    const settings = await getEmailSettings();
    const siteName = settings.siteName || 'GRABSZY';
    const supportEmail = settings.supportEmail || "support@grabszy.com";

    const itemsHtml = order.items.map(item => `
        <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">
                ${item.product?.name || 'Product'} ${item.variant ? `(${item.variant.color}/${item.variant.size})` : ''}
            </td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price.toFixed(2)}</td>
        </tr>
    `).join('');

    const itemsText = order.items.map(item => `- ${item.product?.name || 'Product'}: ${item.quantity} x ₹${item.price.toFixed(2)}`).join('\n');

    const html = `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
            <div style="background-color: #000; color: #fff; padding: 30px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px;">Order Confirmed! 📦</h1>
                <p style="margin: 10px 0 0; opacity: 0.8;">Thank you for shopping with ${siteName}</p>
            </div>
            
            <div style="padding: 30px;">
                <p style="font-size: 16px;">Hi ${user.name || 'Customer'},</p>
                <p>Your order <strong>#${order.orderId || order._id}</strong> has been successfully placed and is being prepared for shipment.</p>
                
                <h3 style="border-bottom: 2px solid #000; padding-bottom: 10px; margin-top: 30px;">Order Details</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background-color: #f9f9f9;">
                            <th style="padding: 10px; text-align: left;">Item</th>
                            <th style="padding: 10px; text-align: center;">Qty</th>
                            <th style="padding: 10px; text-align: right;">Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>
                
                <div style="margin-top: 20px; text-align: right;">
                    <p style="margin: 5px 0;">Subtotal: ₹${(order.totalAmount - (order.shippingCharge || 0) - (order.taxAmount || 0) + (order.discountAmount || 0)).toFixed(2)}</p>
                    ${order.taxAmount > 0 ? `<p style="margin: 5px 0;">Tax: ₹${order.taxAmount.toFixed(2)}</p>` : ''}
                    ${order.discountAmount > 0 ? `<p style="margin: 5px 0; color: #dc3545;">Discount: -₹${order.discountAmount.toFixed(2)}</p>` : ''}
                    <p style="margin: 5px 0;">Shipping: ${order.shippingCharge > 0 ? `₹${order.shippingCharge.toFixed(2)}` : 'FREE'}</p>
                    <h2 style="margin: 10px 0; color: #000;">Total: ₹${order.totalAmount.toFixed(2)}</h2>
                </div>

                <div style="margin-top: 40px; text-align: center;">
                    <a href="${getBaseUrl()}/account/orders/${order._id}" style="display: inline-block; padding: 15px 30px; color: #fff; background-color: #000; text-decoration: none; border-radius: 8px; font-weight: bold;">View Order Status</a>
                </div>
            </div>
            
            <div style="background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999;">
                <p>If you have any questions, contact us at ${supportEmail}</p>
                <p>&copy; ${new Date().getFullYear()} ${siteName}. All rights reserved.</p>
            </div>
        </div>
    `;

    const text = `Order Confirmed!\n\nHi ${user.name || 'Customer'},\n\nYour order #${order.orderId || order._id} has been successfully placed.\n\nItems:\n${itemsText}\n\nTotal: ₹${order.totalAmount.toFixed(2)}\n\nView Status: ${getBaseUrl()}/account/orders/${order._id}`;

    await sendEmail({ 
      to: user.email, 
      subject: `Order Confirmation #${order.orderId || order._id} - ${siteName}`, 
      html,
      text,
      fromAddress: `order@${siteName.toLowerCase()}.com`
    });
};

export const sendVerificationEmail = async (user, token) => {
    const settings = await getEmailSettings();
    const siteName = settings.siteName || 'GRABSZY';
    const verifyUrl = `${getBaseUrl()}/verify-email?token=${token}`;
    const html = `
        <div style="font-family: Arial, sans-serif; color: #333;">
            <h1>Verify Your Email 📧</h1>
            <p>Hi ${user.name}, please verify your email address to complete your registration.</p>
            <a href="${verifyUrl}" style="display: inline-block; padding: 10px 20px; color: #fff; background-color: #007bff; text-decoration: none; border-radius: 5px;">Verify Email</a>
            <p>This link will expire in 24 hours.</p>
        </div>
    `;
    const text = `Verify Your Email\n\nHi ${user.name}, please verify your email address to complete your registration by clicking this link:\n\n${verifyUrl}\n\nThis link will expire in 24 hours.`;

    await sendEmail({ 
      to: user.email, 
      subject: `Verify Your Email - ${siteName} 📧`, 
      html,
      text,
      fromAddress: `noreply@${siteName.toLowerCase()}.com`
    });
};

export const sendLowStockAlert = async (product, variant = null) => {
    try {
        const settings = await getEmailSettings();
        const siteName = settings.siteName || 'GRABSZY';
        const adminEmail = settings.supportEmail || process.env.SMTP_USER;
        
        const itemName = variant 
            ? `${product.name} (${variant.color}${variant.size ? ` / ${variant.size}` : ''}${variant.length ? ` / ${variant.length}` : ''})`
            : product.name;
        
        const stockCount = variant ? variant.stock : product.stock;

        const html = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #dc3545; border-radius: 10px; overflow: hidden;">
                <div style="background-color: #dc3545; color: #fff; padding: 25px; text-align: center;">
                    <h1 style="margin: 0; font-size: 22px;">⚠️ Low Stock Alert</h1>
                    <p style="margin: 5px 0; opacity: 0.9;">Inventory threshold reached</p>
                </div>
                <div style="padding: 30px;">
                    <p style="font-size: 16px;">Hello Admin,</p>
                    <p>The following item is running low on stock and needs your attention:</p>
                    
                    <div style="background-color: #fff5f5; padding: 20px; border-left: 4px solid #dc3545; border-radius: 4px; margin: 25px 0;">
                        <p style="margin: 5px 0;"><strong>Product:</strong> ${product.name}</p>
                        ${variant ? `<p style="margin: 5px 0;"><strong>Variant:</strong> ${variant.color || 'N/A'} ${variant.size ? `/ ${variant.size}` : ''} ${variant.length ? `/ ${variant.length}` : ''}</p>` : ''}
                        <p style="margin: 5px 0;"><strong>Remaining Stock:</strong> <span style="color: #dc3545; font-weight: 800; font-size: 18px;">${stockCount}</span></p>
                        <p style="margin: 5px 0;"><strong>SKU:</strong> ${product.sku || 'N/A'}</p>
                    </div>
                    
                    <p>To avoid "Out of Stock" status for customers, we recommend restocking this item soon.</p>
                    
                    <div style="text-align: center; margin-top: 35px;">
                        <a href="${getBaseUrl()}/admin/products/edit/${product._id}" style="display: inline-block; padding: 15px 30px; color: #fff; background-color: #000; text-decoration: none; border-radius: 8px; font-weight: bolder;">Manage Inventory</a>
                    </div>
                </div>
                <div style="background-color: #f9f9f9; padding: 20px; text-align: center; font-size: 12px; color: #999;">
                    <p>This is an automated inventory alert from ${siteName}.</p>
                </div>
            </div>
        `;

        await sendEmail({ 
            to: adminEmail, 
            subject: `[STOCK ALERT] ${itemName} is low!`, 
            html,
            text: `Low Stock Alert: ${itemName} currently has ${stockCount} items left. Update inventory at: ${getBaseUrl()}/admin/products/edit/${product._id}`,
            fromAddress: `alerts@${siteName.toLowerCase()}.com`
        });
    } catch (error) {
        logger.error("Failed to send low stock alert email", { error: error.message });
    }
};

