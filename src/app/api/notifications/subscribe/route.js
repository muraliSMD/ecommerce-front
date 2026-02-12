import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { getFullUserFromRequest } from "@/lib/auth";

export async function POST(request) {
  await dbConnect();
  try {
    const user = await getFullUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const subscription = await request.json();

    // Add subscription if not already exists (check by endpoint)
    // We use $addToSet but with object it might be tricky if fields vary slightly. 
    // Manual check is better or ensuring exact match.
    // Actually, endpoint is unique per device/browser profile.

    const exists = user.pushSubscriptions.some(sub => sub.endpoint === subscription.endpoint);
    
    if (!exists) {
        await User.findByIdAndUpdate(user._id, {
            $push: { pushSubscriptions: subscription }
        });
    }

    return NextResponse.json({ message: "Subscribed successfully" });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
