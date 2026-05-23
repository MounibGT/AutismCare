import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectToDatabase from "@/lib/mongodb";
import Call from "@/models/Call";
import User from "@/models/User";
import { authOptions } from "@/lib/auth";

// POST - Initiate a new call
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { receiverId, type = "video" } = body;

    if (!receiverId) {
      return NextResponse.json(
        { error: "Receiver ID is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Get caller info
    const caller = await User.findById(session.user.id);
    if (!caller) {
      return NextResponse.json({ error: "Caller not found" }, { status: 404 });
    }

    // Get receiver info
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return NextResponse.json(
        { error: "Receiver not found" },
        { status: 404 }
      );
    }

    // Removed availability check - allow calls regardless of online status
    // for scheduled appointments

    // Check if there's already a pending call
    const existingCall = await Call.findOne({
      $or: [
        { callerId: session.user.id, receiverId, status: "pending" },
        { callerId: receiverId, receiverId: session.user.id, status: "pending" },
      ],
    });

    if (existingCall) {
      return NextResponse.json(
        { error: "There's already a pending call" },
        { status: 400 }
      );
    }

    // Create the call
    const call = await Call.create({
      callerId: session.user.id,
      callerName: `${caller.firstName} ${caller.lastName}`,
      callerImage: caller.image,
      receiverId,
      receiverName: `${receiver.firstName} ${receiver.lastName}`,
      receiverImage: receiver.image,
      type,
      status: "pending",
    });

    // Update caller's status to busy
    await User.findByIdAndUpdate(session.user.id, {
      callStatus: "busy",
      isOnline: true,
    });

    // Update receiver's status (they might not be updated in real-time yet)
    // but this will be handled by the WebSocket/notification system

    return NextResponse.json({
      success: true,
      call: {
        id: call._id,
        callerId: call.callerId,
        receiverId: call.receiverId,
        status: call.status,
        type: call.type,
        createdAt: call.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Initiate call error:", error);
    return NextResponse.json(
      { error: "Failed to initiate call" },
      { status: 500 }
    );
  }
}

// GET - Get user's calls
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "all"; // incoming, outgoing, all

    await connectToDatabase();

    let query: any = {
      $or: [
        { callerId: session.user.id },
        { receiverId: session.user.id },
      ],
    };

    if (type === "incoming") {
      query = { receiverId: session.user.id };
    } else if (type === "outgoing") {
      query = { callerId: session.user.id };
    }

    const calls = await Call.find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return NextResponse.json({ calls });
  } catch (error: any) {
    console.error("Get calls error:", error);
    return NextResponse.json(
      { error: "Failed to get calls" },
      { status: 500 }
    );
  }
}
