import dbConnect from "@/lib/db";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET() {
  const healthData = {
    status: "ok",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    checks: {
      database: "unknown",
      environment: {
        MONGODB_URI: !!process.env.MONGODB_URI,
        JWT_SECRET: !!process.env.JWT_SECRET,
        CLOUDINARY_NAME: !!process.env.CLOUDINARY_NAME,
      },
    },
  };

  try {
    // 1. Check Database
    await dbConnect();
    const dbState = mongoose.connection.readyState;
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    healthData.checks.database = dbState === 1 ? "connected" : `state_${dbState}`;
    
    if (dbState !== 1) {
      healthData.status = "error";
    }

    // 2. Return Response
    return NextResponse.json(healthData, { 
      status: healthData.status === "ok" ? 200 : 500 
    });

  } catch (error) {
    healthData.status = "error";
    healthData.error = error.message;
    return NextResponse.json(healthData, { status: 500 });
  }
}
