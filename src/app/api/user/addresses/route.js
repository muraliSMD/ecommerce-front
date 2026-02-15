import dbConnect from '@/lib/db';
import User from '@/models/User';
import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request) {
    try {
        await dbConnect();
        const userPayload = await getUserFromRequest(request);
        if (!userPayload) {
            return NextResponse.json({ message: "Not authorized" }, { status: 401 });
        }

        const user = await User.findById(userPayload.userId);
        if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

        return NextResponse.json(user.address);
    } catch (error) {
        return NextResponse.json({ message: "Server error", error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
  try {
    await dbConnect();
    const userPayload = await getUserFromRequest(request);
    if (!userPayload) {
      return NextResponse.json({ message: "Not authorized" }, { status: 401 });
    }

    const body = await request.json(); 

    const user = await User.findById(userPayload.userId);
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    // If first address, make it default
    const isDefault = user.address.length === 0;

    user.address.push({
        name: body.name,
        address: body.address || `${body.address1}, ${body.address2}, ${body.city}, ${body.pincode}`, // Populate legacy field
        email: body.email,
        phone: body.phone,
        address1: body.address1,
        address2: body.address2,
        address3: body.address3,
        city: body.city,
        state: body.state,
        pincode: body.pincode,
        landmark: body.landmark,
        label: body.label,
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
