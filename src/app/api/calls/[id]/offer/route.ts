import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectToDatabase from "@/lib/mongodb";
import Call from "@/models/Call";
import { authOptions } from "@/lib/auth";

// GET - Get the offer (for receiver to get offer from caller)
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

    // Return the offer if it exists
    if (call.offer) {
      return NextResponse.json({ offer: call.offer });
    }

    return NextResponse.json({ offer: null });
  } catch (error: any) {
    console.error("Get offer error:", error);
    return NextResponse.json({ error: "Failed to get offer" }, { status: 500 });
  }
}

// POST - Create/update the offer (for caller to set offer)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { offer } = body;

    if (!offer) {
      return NextResponse.json({ error: "Offer is required" }, { status: 400 });
    }

    await connectToDatabase();

    const { id } = await params;
    const call = await Call.findById(id);

    if (!call) {
      return NextResponse.json({ error: "Call not found" }, { status: 404 });
    }

    // Only the caller can set the offer
    if (call.callerId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Only the caller can set the offer" }, { status: 403 });
    }

    // Update the offer
    call.offer = offer;
    await call.save();

    // Check if there's already an answer, if so return it
    if (call.answer) {
      return NextResponse.json({ answer: call.answer });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Create offer error:", error);
    return NextResponse.json({ error: "Failed to create offer" }, { status: 500 });
  }
}
