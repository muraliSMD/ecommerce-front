import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import HeroSlide from "@/models/HeroSlide";
import { getFullUserFromRequest, isAdmin } from "@/lib/auth";
import { heroSlideSchema } from "@/lib/validations/hero-slide";

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
    const user = await getFullUserFromRequest(request);
    if (!isAdmin(user)) {
      return NextResponse.json({ message: "Admin access required" }, { status: 403 });
    }

    const rawBody = await request.json();
    const validation = heroSlideSchema.safeParse(rawBody);
    
    if (!validation.success) {
        return NextResponse.json({ 
            message: "Validation failed", 
            errors: validation.error.format() 
        }, { status: 400 });
    }

    const slide = await HeroSlide.create(validation.data);
    return NextResponse.json(slide, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}

export async function PUT(request) {
  try {
    await dbConnect();
    const user = await getFullUserFromRequest(request);
    if (!isAdmin(user)) {
      return NextResponse.json({ message: "Admin access required" }, { status: 403 });
    }

    const { _id, ...updateData } = await request.json();
    
    const validation = heroSlideSchema.partial().safeParse(updateData);
    if (!validation.success) {
        return NextResponse.json({ 
            message: "Validation failed", 
            errors: validation.error.format() 
        }, { status: 400 });
    }

    const slide = await HeroSlide.findByIdAndUpdate(_id, validation.data, { new: true });
    return NextResponse.json(slide);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}

export async function DELETE(request) {
    try {
        await dbConnect();
        const user = await getFullUserFromRequest(request);
        if (!isAdmin(user)) {
          return NextResponse.json({ message: "Admin access required" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        await HeroSlide.findByIdAndDelete(id);
        return NextResponse.json({ message: "Slide deleted" });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
}
