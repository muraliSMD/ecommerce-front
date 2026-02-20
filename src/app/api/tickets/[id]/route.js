import dbConnect from '@/lib/db';
import Ticket from '@/models/Ticket';
import { NextResponse } from 'next/server';
import { getFullUserFromRequest, isAdmin } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const user = await getFullUserFromRequest(request);
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const ticket = await Ticket.findById(id).populate('user', 'name email').populate('order', 'totalAmount createdAt');

    if (!ticket) {
        return NextResponse.json({ message: "Ticket not found" }, { status: 404 });
    }

    // Access Control
    if (!isAdmin(user) && ticket.user._id.toString() !== user._id.toString()) {
        return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    return NextResponse.json(ticket);
  } catch (error) {
    return NextResponse.json({ message: "Server Error", error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const user = await getFullUserFromRequest(request);
    if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json(); // { message: "Reply", status: "Closed" }

    const ticket = await Ticket.findById(id);
    if (!ticket) return NextResponse.json({ message: "Ticket not found" }, { status: 404 });

    // Access Control
    const isUserAdmin = isAdmin(user);
    if (!isUserAdmin && ticket.user.toString() !== user._id.toString()) {
        return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    // Add Message
    if (body.message) {
        ticket.messages.push({
            sender: isUserAdmin ? 'admin' : 'user',
            message: body.message
        });
        
        // Auto-reopen if user replies
        if (!isUserAdmin && ticket.status === 'Closed') {
            ticket.status = 'Open';
        }
    }

    // Update Status (Admin Only or User closing own ticket)
    if (body.status) {
        if (isUserAdmin || body.status === 'Closed') {
             ticket.status = body.status;
        }
    }

    // Update Priority (Admin Only)
    if (body.priority && isUserAdmin) {
        ticket.priority = body.priority;
    }
    
    ticket.updatedAt = Date.now();
    await ticket.save();

    return NextResponse.json(ticket);
  } catch (error) {
    return NextResponse.json({ message: "Server Error", error: error.message }, { status: 500 });
  }
}
