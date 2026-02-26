import dbConnect from "@/lib/db";
import Contact from "@/models/Contact";
import { NextResponse } from "next/server";
import logger from "@/lib/logger";

export async function POST(request) {
  try {
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
