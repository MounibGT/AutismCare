import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectToDatabase from "@/lib/mongodb";
import Call from "@/models/Call";
import { authOptions } from "@/lib/auth";

// GET - Get ice candidates for the call (for polling)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const { id } = await params;
    const call = await Call.findById(id);

    if (!call) {
      return NextResponse.json({ error: "Call not found" }, { status: 404 });
    }

    // Check if user is part of the call
    if (
      call.callerId.toString() !== session.user.id &&
      call.receiverId.toString() !== session.user.id
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Return ice candidates
    return NextResponse.json({ iceCandidates: call.iceCandidates || [] });
  } catch (error: any) {
    console.error("Get ice candidates error:", error);
    return NextResponse.json({ error: "Failed to get ice candidates" }, { status: 500 });
  }
}

// POST - Add an ice candidate (for sending ice candidates)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string> > }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { candidate } = body;

    if (!candidate) {
      return NextResponse.json({ error: "Ice candidate is required" }, { status: 400 });
    }

    await connectToDatabase();

    const { id } = await params;
    const call = await Call.findById(id);

    if (!call) {
      return NextResponse.json({ error: "Call not found" }, { status: 404 });
    }

    // Check if user is part of the call
    if (
      call.callerId.toString() !== session.user.id &&
      call.receiverId.toString() !== session.user.id
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Add ice candidate to the call
    if (!call.iceCandidates) {
      call.iceCandidates = [];
    }
    call.iceCandidates.push(candidate);
    await call.save();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Add ice candidate error:", error);
    return NextResponse.json({ error: "Failed to add ice candidate" }, { status: 500 });
  }
}