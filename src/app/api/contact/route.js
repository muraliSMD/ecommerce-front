import dbConnect from "@/lib/db";
import Contact from "@/models/Contact";
import { NextResponse } from "next/server";
import logger from "@/lib/logger";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(request) {
  try {
    const rateLimitResponse = rateLimit(request, 3, 60000); // 3 requests per minute per IP
    if (rateLimitResponse) return rateLimitResponse;

    await dbConnect();
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    const newContact = new Contact({
      name,
      email,
      subject,
      message,
    });

    await newContact.save();

    return NextResponse.json(
      { message: "Message sent successfully! We'll get back to you soon." },
      { status: 201 }
    );
  } catch (error) {
    logger.error("Contact form submission error", { error: error.message });
    return NextResponse.json(
      { message: "Something went wrong. Please try again later." },
      { status: 500 }
    );
  }
}
