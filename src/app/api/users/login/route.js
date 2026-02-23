import dbConnect from '@/lib/db';
import User from '@/models/User';
import { signToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { rateLimit } from '@/lib/rateLimit';
import { loginSchema } from '@/lib/validations/auth';

import logger from '@/lib/logger';

export async function POST(request) {
  try {
    // 1. Rate Limiting (Max 5 login attempts per minute per IP)
    const rateLimitResponse = rateLimit(request, 5, 60000);
    if (rateLimitResponse) return rateLimitResponse;

    await dbConnect();
    const body = await request.json();
    
    // 2. Schema Validation
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
        return NextResponse.json(
            { message: "Validation failed", errors: validation.error.format() }, 
            { status: 400 }
        );
    }

    const { email, password } = validation.data;

    const user = await User.findOne({ email });
    if (!user) {
      logger.warn(`Failed login attempt: User not found`, { email });
      return NextResponse.json({ message: "Invalid credentials" }, { status: 400 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      logger.warn(`Failed login attempt: Invalid password`, { email, userId: user._id });
      return NextResponse.json({ message: "Invalid credentials" }, { status: 400 });
    }

    if (user.isBanned) {
        logger.warn(`Login attempt for banned user`, { email, userId: user._id });
        return NextResponse.json({ message: "Your account has been suspended." }, { status: 403 });
    }

    if (!user.isVerified && user.role !== 'admin') {
        return NextResponse.json({ message: "Please verify your email to login." }, { status: 403 });
    }

    const token = signToken({ userId: user._id });

    // Set HttpOnly Cookie
    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    logger.info(`User logged in successfully`, { email, userId: user._id, role: user.role });
    return NextResponse.json({ user: userResponse, token }); // Token still sent for client store but cookie is primary
  } catch (error) {
    logger.error("Login Error:", { error: error.message, stack: error.stack });
    return NextResponse.json({ message: "Server Error", error: error.message }, { status: 500 });
  }
}
