import dbConnect from '@/lib/db';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request) {
  try {
    await dbConnect();
    const userPayload = await getUserFromRequest(request);
    if (!userPayload) {
      return NextResponse.json({ message: "Not authorized" }, { status: 401 });
    }

    const body = await request.json(); // { name, address, phone }

    const user = await User.findById(userPayload.userId);
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    // If first address, make it default
    const isDefault = user.address.length === 0;

    user.address.push({
        name: body.name,
        address: body.address,
        phone: body.phone,
        isDefault
    });

    await user.save();
    return NextResponse.json(user.address);
  } catch (error) {
    return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
    try {
        await dbConnect();
        const userPayload = await getUserFromRequest(request);
        if (!userPayload) {
          return NextResponse.json({ message: "Not authorized" }, { status: 401 });
        }
    
        const { searchParams } = new URL(request.url);
        const addressId = searchParams.get('id');

        const user = await User.findById(userPayload.userId);
        if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

        user.address = user.address.filter(a => a._id.toString() !== addressId);
        await user.save();
        
        return NextResponse.json(user.address);
      } catch (error) {
        return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
      }
}
