import dbConnect from '@/lib/db';
import User from '@/models/User';
import { signToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { sendVerificationEmail } from '@/lib/email';
import { rateLimit } from '@/lib/rateLimit';
import { registerSchema } from '@/lib/validations/auth';

export async function POST(request) {
  try {
    // 1. Rate Limiting (Max 3 registrations per minute per IP)
    const rateLimitResponse = rateLimit(request, 3, 60000);
    if (rateLimitResponse) return rateLimitResponse;

    await dbConnect();
    const body = await request.json();

    // 2. Schema Validation
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
        return NextResponse.json(
            { message: "Validation failed", errors: validation.error.format() }, 
            { status: 400 }
        );
    }

    const { name, email, password } = validation.data;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 });
    }

    const verificationToken = crypto.randomBytes(20).toString('hex');
    const verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ 
        name, 
        email, 
        password: hashedPassword,
        isVerified: false,
        verificationToken,
        verificationTokenExpire
    });
    await newUser.save();

    await sendVerificationEmail(newUser, verificationToken);

    const token = signToken({ userId: newUser._id });
    
    // Return user without password
    const userResponse = newUser.toObject();
    delete userResponse.password;
    delete userResponse.verificationToken;
    delete userResponse.verificationTokenExpire;

    return NextResponse.json({ 
        message: "Registration successful. Please verify your email.",
        user: userResponse, 
        token 
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Server Error", error: error.message }, { status: 500 });
  }
}
