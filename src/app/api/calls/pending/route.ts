import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectToDatabase from "@/lib/mongodb";
import Call from "@/models/Call";
import { authOptions } from "@/lib/auth";

// GET - Get pending incoming call for current user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    // Find pending incoming call
    const call = await Call.findOne({
      receiverId: session.user.id,
      status: "pending",
    }).sort({ createdAt: -1 });

    if (!call) {
      return NextResponse.json({ call: null });
    }

    return NextResponse.json({
      call: {
        id: call._id,
        callerId: call.callerId,
        callerName: call.callerName,
        callerImage: call.callerImage,
        type: call.type,
        createdAt: call.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Get pending call error:", error);
    return NextResponse.json(
      { error: "Failed to get pending call" },
      { status: 500 }
    );
  }
}
