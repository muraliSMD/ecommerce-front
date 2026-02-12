import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Notification from "@/models/Notification";
import { getFullUserFromRequest, isAdmin } from "@/lib/auth";

export async function GET(request) {
  await dbConnect();
  try {
    const user = await getFullUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    let query = { recipient: user._id };
    
    // If admin, also fetch "admin" broadcast notifications
    if (isAdmin(user)) {
      query = { 
        $or: [
            { recipient: user._id },
            { recipient: "admin" }
        ]
      };
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(20);

    const unreadCount = await Notification.countDocuments({
        ...query,
        isRead: false
    });

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  await dbConnect();
  try {
    const user = await getFullUserFromRequest(request);
    if (!user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, markAllRead } = body;

    let result;
    
    // Construct query to ensure user only updates their own notifications
    let query = { recipient: user._id };
    if (isAdmin(user)) {
         query = { 
            $or: [
                { recipient: user._id },
                { recipient: "admin" }
            ]
          };
    }

    if (markAllRead) {
        // Mark all as read for this user
        // Note: For "admin" broadcast messages, marking as read is tricky in a shared model without a "readBy" array.
        // For simplicity in this iteration, we'll just mark them read. 
        // A better approach for "admin" broadcasts would be a separate user-specific tracking, but let's stick to simple first.
        result = await Notification.updateMany({ ...query, isRead: false }, { isRead: true });
    } else if (id) {
        // Mark specific as read
        // We need to verify the notification belongs to the user or is an admin broadcast
        const notif = await Notification.findById(id);
        if (!notif) return NextResponse.json({ message: "Not found" }, { status: 404 });
        
        // Simple check: if it's admin broadcast and user is admin, allow. Or if it matches user ID.
        if (notif.recipient === 'admin' && !isAdmin(user)) {
             return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
        }
        if (notif.recipient !== 'admin' && notif.recipient.toString() !== user._id.toString()) {
             return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
        }

        notif.isRead = true;
        await notif.save();
        result = notif;
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
