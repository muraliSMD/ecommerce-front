import dbConnect from '@/lib/db';
import Settings from '@/models/Settings';
import { getFullUserFromRequest, isAdmin } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await dbConnect();
    // Singleton behavior: Find the first document, if not exists, create one
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = await Settings.create({});
    }

    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

import { settingsSchema } from '@/lib/validations/settings';

export async function PUT(request) {
  try {
    await dbConnect();
    const user = await getFullUserFromRequest(request);
    if (!isAdmin(user)) {
      return NextResponse.json({ message: "Admin access required" }, { status: 403 });
    }

    const rawBody = await request.json();
    const validation = settingsSchema.safeParse(rawBody);
    
    if (!validation.success) {
        return NextResponse.json({ 
            message: "Validation failed", 
            errors: validation.error.format() 
        }, { status: 400 });
    }

    const body = validation.data;
    
    // Update the singleton document
    // upsert: true ensures it creates if somehow missing (though findOneAndUpdate usually needs a query)
    // using findOne to get ID or just update first found
    let settings = await Settings.findOne();
    if (!settings) {
        settings = await Settings.create(body);
    } else {
        settings = await Settings.findByIdAndUpdate(settings._id, body, { new: true, runValidators: true });
    }

    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
