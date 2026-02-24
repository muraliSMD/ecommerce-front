
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { sendPasswordResetEmail } from "@/lib/email";
import crypto from "crypto";
import { NextResponse } from "next/server";

import { rateLimit } from "@/lib/rateLimit";
import logger from "@/lib/logger";

export async function POST(request) {
  try {
    // Rate limit: 2 requests per 10 minutes per IP
    const rateLimitResponse = rateLimit(request, 2, 600000);
    if (rateLimitResponse) return rateLimitResponse;

    await dbConnect();
    const { email } = await request.json();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Generate token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Set expire
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    try {
      await sendPasswordResetEmail(user, resetToken);
      return NextResponse.json({ success: true, data: "Email sent" });
    } catch (err) {
      console.error(err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      return NextResponse.json({ message: "Email could not be sent" }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ message: "Server Error", error }, { status: 500 });
  }
}
