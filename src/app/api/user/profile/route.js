import dbConnect from '@/lib/db';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET(request) {
  try {
    await dbConnect();
    const userPayload = await getUserFromRequest(request);
    if (!userPayload) {
      return NextResponse.json({ message: "Not authorized" }, { status: 401 });
    }

    const user = await User.findById(userPayload.userId).select("-password -role");
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
    try {
      await dbConnect();
      const userPayload = await getUserFromRequest(request);
      if (!userPayload) {
        return NextResponse.json({ message: "Not authorized" }, { status: 401 });
      }
  
      const body = await request.json();
      const updateData = { name: body.name, email: body.email };
  
      if (body.password) {
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(body.password, salt);
      }
  
      const user = await User.findByIdAndUpdate(userPayload.userId, updateData, { new: true }).select("-password");
      
      return NextResponse.json(user);
    } catch (error) {
      return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
    }
  }
