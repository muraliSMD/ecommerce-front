import dbConnect from '@/lib/db';
import Ticket from '@/models/Ticket';
import { NextResponse } from 'next/server';
import { getFullUserFromRequest, isAdmin } from '@/lib/auth';

export async function GET(request) {
  try {
    await dbConnect();
    const user = await getFullUserFromRequest(request);
    
    if (!user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    let query = {};
    if (!isAdmin(user)) {
        query.user = user._id; // Users see only their tickets
    }

    const tickets = await Ticket.find(query)
      .populate('user', 'name email')
      .sort({ updatedAt: -1 });

    return NextResponse.json(tickets);
  } catch (error) {
    return NextResponse.json({ message: "Server Error", error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const user = await getFullUserFromRequest(request);
    
    if (!user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    
    if (!body.subject || !body.message) {
        return NextResponse.json({ message: "Subject and Message are required" }, { status: 400 });
    }

    const ticket = await Ticket.create({
        user: user._id,
        subject: body.subject,
        order: body.orderId || undefined, // Optional
        priority: body.priority || 'Medium',
        messages: [{
            sender: 'user',
            message: body.message
        }]
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Server Error", error: error.message }, { status: 500 });
  }
}
