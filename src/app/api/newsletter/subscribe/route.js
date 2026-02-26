import dbConnect from "@/lib/db";
import Subscriber from "@/models/Subscriber";
import { NextResponse } from "next/server";
import logger from "@/lib/logger";

export async function POST(request) {
  try {
    await dbConnect();
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    // Check if search for existing active subscription
    const existingSubscriber = await Subscriber.findOne({ email });

    if (existingSubscriber) {
      if (existingSubscriber.status === "active") {
        return NextResponse.json(
          { message: "You are already subscribed to our club!" },
          { status: 400 }
        );
      } else {
        // Reactivate subscription
        existingSubscriber.status = "active";
        await existingSubscriber.save();
        return NextResponse.json(
          { message: "Welcome back! Your subscription has been reactivated." },
          { status: 200 }
        );
      }
    }

    const newSubscriber = new Subscriber({ email });
    await newSubscriber.save();

    return NextResponse.json(
      { message: "Thank you for joining the GRABSZY Club!" },
      { status: 201 }
    );
  } catch (error) {
    logger.error("Newsletter subscription error", { error: error.message });
    return NextResponse.json(
      { message: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
