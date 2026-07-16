import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Obsolete endpoint. Payments must be initiated via the secure order creation endpoint." },
    { status: 410 }
  );
}
