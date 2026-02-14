import dbConnect from '@/lib/db';
import User from '@/models/User';
import { signToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request) {
  try {
    await dbConnect();
    const { name, email, password } = await request.json();

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
