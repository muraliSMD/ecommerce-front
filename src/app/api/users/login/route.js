import dbConnect from '@/lib/db';
import User from '@/models/User';
import { signToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    await dbConnect();
    const { email, password } = await request.json();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 400 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 400 });
    }

    if (user.isBanned) {
        return NextResponse.json({ message: "Your account has been suspended." }, { status: 403 });
    }

    if (!user.isVerified && user.role !== 'admin') {
        return NextResponse.json({ message: "Please verify your email to login." }, { status: 403 });
    }

    const token = signToken({ userId: user._id });

    // Return user without password
    const userResponse = user.toObject();
    delete userResponse.password;

    return NextResponse.json({ user: userResponse, token });
  } catch (error) {
    return NextResponse.json({ message: "Server Error", error: error.message }, { status: 500 });
  }
}
