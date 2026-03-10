import dbConnect from "@/lib/db";
import FAQ from "@/models/FAQ";
import { NextResponse } from "next/server";
import { getFullUserFromRequest, isAdmin } from "@/lib/auth";

export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const user = await getFullUserFromRequest(request);

    if (!isAdmin(user)) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const faq = await FAQ.findByIdAndUpdate(params.id, body, { new: true });
    
    if (!faq) return NextResponse.json({ message: "FAQ not found" }, { status: 404 });
    return NextResponse.json(faq);
  } catch (error) {
    return NextResponse.json({ message: "Server Error", error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const user = await getFullUserFromRequest(request);

    if (!isAdmin(user)) {
      return NextResponse.json({ message: "Access denied" }, { status: 403 });
    }

    const faq = await FAQ.findByIdAndDelete(params.id);
    if (!faq) return NextResponse.json({ message: "FAQ not found" }, { status: 404 });
    
    return NextResponse.json({ message: "FAQ deleted successfully" });
  } catch (error) {
    return NextResponse.json({ message: "Server Error", error: error.message }, { status: 500 });
  }
}
