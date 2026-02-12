import dbConnect from '@/lib/db';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import { getFullUserFromRequest, isAdmin } from '@/lib/auth';

export async function GET(request) {
  try {
    await dbConnect();
    const currentUser = await getFullUserFromRequest(request);

    if (!currentUser || !isAdmin(currentUser)) {
      return NextResponse.json({ message: "Not authorized" }, { status: 403 });
    }

    const users = await User.find({})
      .select("-password") // Exclude passwords
      .sort({ createdAt: -1 });

    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
    try {
        await dbConnect();
        const currentUser = await getFullUserFromRequest(request);
    
        if (!currentUser || !isAdmin(currentUser)) {
          return NextResponse.json({ message: "Not authorized" }, { status: 403 });
        }
    
        const { userId, isBanned } = await request.json();
        
        // Prevent self-ban
        if (userId === currentUser._id.toString()) {
            return NextResponse.json({ message: "Cannot ban yourself" }, { status: 400 });
        }

        const user = await User.findByIdAndUpdate(
            userId, 
            { isBanned }, // Assuming we need to add isBanned schema field or use a role trick.
            // Let's stick to a new field 'isBanned' or 'isActive'. User model had 'role'.
            // I'll assume we need to add isBanned to User model or just use it.
            { new: true }
        ).select("-password");

        if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

        return NextResponse.json(user);

      } catch (error) {
        return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
      }
}
