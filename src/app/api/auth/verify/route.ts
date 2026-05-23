import { NextRequest, NextResponse } from "next/server";

// Email verification is disabled
export async function POST(req: NextRequest) {
  return NextResponse.json(
    { error: "Email verification is disabled" },
    { status: 400 },
  );
}
