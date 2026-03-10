import dbConnect from "@/lib/db";
import FAQ from "@/models/FAQ";
import { NextResponse } from "next/server";
import { getFullUserFromRequest, isAdmin } from "@/lib/auth";

// Public: Get active FAQs | Admin: Get all
export async function GET(request) {
  try {
    await dbConnect();
    const user = await getFullUserFromRequest(request);
    
    let query = { isActive: true };
    if (isAdmin(user)) {
      query = {};
    }

    const faqs = await FAQ.find(query).sort({ order: 1, createdAt: -1 });
    return NextResponse.json(faqs);
  } catch (error) {
    return NextResponse.json({ message: "Server Error", error: error.message }, { status: 500 });
  }
}

// Admin: Create FAQ
export async function POST(request) {
  try {
    await dbConnect();
    const user = await getFullUserFromRequest(request);

    if (!isAdmin(user)) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const faq = await FAQ.create(body);
    return NextResponse.json(faq, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Server Error", error: error.message }, { status: 500 });
  }
}
