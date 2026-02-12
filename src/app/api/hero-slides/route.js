import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import HeroSlide from "@/models/HeroSlide";

export async function GET() {
  await dbConnect();
  try {
    const slides = await HeroSlide.find().sort({ order: 1 });
    return NextResponse.json(slides);
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching hero slides" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const slide = await HeroSlide.create(body);
    return NextResponse.json(slide, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}

export async function PUT(request) {
  try {
    await dbConnect();
    const { _id, ...updateData } = await request.json();
    const slide = await HeroSlide.findByIdAndUpdate(_id, updateData, { new: true });
    return NextResponse.json(slide);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}

export async function DELETE(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        await HeroSlide.findByIdAndDelete(id);
        return NextResponse.json({ message: "Slide deleted" });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
}
