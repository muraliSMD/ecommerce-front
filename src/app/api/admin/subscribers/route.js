import dbConnect from "@/lib/db";
import Subscriber from "@/models/Subscriber";
import { NextResponse } from "next/server";
import { getFullUserFromRequest, isAdmin } from "@/lib/auth";
import logger from "@/lib/logger";

export async function GET(request) {
  try {
    await dbConnect();

    // Auth check
    const user = await getFullUserFromRequest(request);
    if (!isAdmin(user)) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    const subscribers = await Subscriber.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(subscribers);
  } catch (error) {
    logger.error("Fetch subscribers error", { error: error.message });
    return NextResponse.json(
      { message: "Server Error", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    await dbConnect();

    // Auth check
    const user = await getFullUserFromRequest(request);
    if (!isAdmin(user)) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: "ID is required" }, { status: 400 });
    }

    const deletedSubscriber = await Subscriber.findByIdAndDelete(id);
    if (!deletedSubscriber) {
      return NextResponse.json({ message: "Subscriber not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Subscriber deleted successfully" });
  } catch (error) {
    logger.error("Delete subscriber error", { error: error.message });
    return NextResponse.json(
      { message: "Server Error", error: error.message },
      { status: 500 }
    );
  }
}
