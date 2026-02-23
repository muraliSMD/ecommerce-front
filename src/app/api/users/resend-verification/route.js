import dbConnect from '@/lib/db';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { sendVerificationEmail } from '@/lib/email';

import { rateLimit } from '@/lib/rateLimit';
import logger from '@/lib/logger';

export async function POST(request) {
  try {
    // Rate limit: 2 requests per 10 minutes per IP
    const rateLimitResponse = rateLimit(request, 2, 600000);
    if (rateLimitResponse) return rateLimitResponse;

    await dbConnect();
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (user.isVerified) {
      return NextResponse.json({ message: "Email is already verified" }, { status: 400 });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(20).toString('hex');
    user.verificationToken = verificationToken;
    user.verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    await user.save();

    // Send verification email
    try {
        await sendVerificationEmail(user, verificationToken);
    } catch (emailError) {
        user.verificationToken = undefined;
        user.verificationTokenExpire = undefined;
        await user.save();
        return NextResponse.json({ message: "Email could not be sent" }, { status: 500 });
    }

    return NextResponse.json({ message: "Verification email sent" }, { status: 200 });

  } catch (error) {
    console.error("Resend Verification Error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
