
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail', // Use 'gmail' or configure host/port for other providers
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'Support'}" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log("Message sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Error sending email: ", error);
    throw new Error("Email could not be sent");
  }
};

export const sendWelcomeEmail = async (user) => {
    const html = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h1>Welcome to GRABSZY, ${user.name}!</h1>
        <p>We're thrilled to have you on board. Start shopping now for the best deals!</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="display: inline-block; padding: 10px 20px; color: #fff; background-color: #007bff; text-decoration: none; border-radius: 5px;">Shop Now</a>
      </div>
    `;
    await sendEmail({ to: user.email, subject: "Welcome to GRABSZY! 🎉", html });
};

export const sendPasswordResetEmail = async (user, token) => {
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password/${token}`;
    const html = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h1>Reset Your Password</h1>
        <p>You requested a password reset. Click the button below to reset it (valid for 1 hour):</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; color: #fff; background-color: #dc3545; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `;
    await sendEmail({ to: user.email, subject: "Password Reset Request 🔒", html });
};

export const sendOrderConfirmationEmail = async (order, user) => {
    const html = `
        <div style="font-family: Arial, sans-serif; color: #333;">
            <h1>Order Confirmed! 📦</h1>
            <p>Hi ${user.name}, your order <strong>#${order._id}</strong> has been received.</p>
            <p>Total: <strong>${order.totalPrice}</strong></p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/account/orders/${order._id}" style="display: inline-block; padding: 10px 20px; color: #fff; background-color: #28a745; text-decoration: none; border-radius: 5px;">View Order</a>
        </div>
    `;
    await sendEmail({ to: user.email, subject: `Order Confirmation #${order._id}`, html });
};
