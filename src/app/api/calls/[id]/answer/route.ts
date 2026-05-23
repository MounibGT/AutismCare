import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectToDatabase from "@/lib/mongodb";
import Call from "@/models/Call";
import { authOptions } from "@/lib/auth";

// POST - Set the answer (for receiver to answer the call)
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
    const { answer } = body;

    if (!answer) {
      return NextResponse.json({ error: "Answer is required" }, { status: 400 });
    }

    await connectToDatabase();

    const { id } = await params;
    const call = await Call.findById(id);

    if (!call) {
      return NextResponse.json({ error: "Call not found" }, { status: 404 });
    }

    // Only the receiver can set the answer
    if (call.receiverId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Only the receiver can set the answer" }, { status: 403 });
    }

    // Update the answer and status
    call.answer = answer;
    call.status = "accepted";
    await call.save();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Create answer error:", error);
    return NextResponse.json({ error: "Failed to create answer" }, { status: 500 });
  }
}
