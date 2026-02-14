import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await dbConnect();

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@grabszy.com' });
    if (existingAdmin) {
      return NextResponse.json({ message: "Admin user already exists" }, { status: 200 });
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = new User({
      name: 'Global Admin',
      email: 'admin@grabszy.com',
      password: hashedPassword,
      role: 'admin',
      isVerified: true
    });

    await adminUser.save();

    return NextResponse.json({ 
      message: "Admin user created successfully", 
      email: 'admin@grabszy.com',
      password: 'admin123' 
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Server Error", error: error.message }, { status: 500 });
  }
}
