import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectToDatabase from "@/lib/mongodb";
import Call from "@/models/Call";
import User from "@/models/User";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await connectToDatabase();

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

    // Return call with all fields including WebRTC signaling
    return NextResponse.json({
      call: {
        id: call._id,
        callerId: call.callerId,
        callerName: call.callerName,
        callerImage: call.callerImage,
        receiverId: call.receiverId,
        receiverName: call.receiverName,
        receiverImage: call.receiverImage,
        status: call.status,
        type: call.type,
        offer: call.offer,
        answer: call.answer,
        startedAt: call.startedAt,
        endedAt: call.endedAt,
        duration: call.duration,
      },
    });
  } catch (error: any) {
    console.error("Get call error:", error);
    return NextResponse.json(
      { error: "Failed to get call" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { action } = body; // accept, reject, end

    await connectToDatabase();

    const call = await Call.findById(id);

    if (!call) {
      return NextResponse.json({ error: "Call not found" }, { status: 404 });
    }

    // Verify user is the receiver
    if (call.receiverId.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "You can only respond to calls you receive" },
        { status: 401 }
      );
    }

    if (action === "accept") {
      if (call.status !== "pending") {
        return NextResponse.json(
          { error: "Call is no longer pending" },
          { status: 400 }
        );
      }

      call.status = "accepted";
      call.startedAt = new Date();

      // Update both users' status
      await User.findByIdAndUpdate(call.callerId, {
        callStatus: "busy",
        isOnline: true,
      });
      await User.findByIdAndUpdate(call.receiverId, {
        callStatus: "busy",
        isOnline: true,
      });
    } else if (action === "reject") {
      if (call.status !== "pending") {
        return NextResponse.json(
          { error: "Call is no longer pending" },
          { status: 400 }
        );
      }

      call.status = "rejected";

      // Reset caller's status
      await User.findByIdAndUpdate(call.callerId, {
        callStatus: "available",
      });
    } else if (action === "end") {
      // Any participant can end the call
      if (
        call.callerId.toString() !== session.user.id &&
        call.receiverId.toString() !== session.user.id
      ) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      call.status = "ended";
      call.endedAt = new Date();

      if (call.startedAt) {
        call.duration = Math.floor(
          (call.endedAt.getTime() - call.startedAt.getTime()) / 1000
        );
      }

      // Reset both users' status
      await User.findByIdAndUpdate(call.callerId, {
        callStatus: "available",
      });
      await User.findByIdAndUpdate(call.receiverId, {
        callStatus: "available",
      });
    } else {
      return NextResponse.json(
        { error: "Invalid action. Use: accept, reject, or end" },
        { status: 400 }
      );
    }

    await call.save();

    return NextResponse.json({
      success: true,
      call: {
        id: call._id,
        status: call.status,
        startedAt: call.startedAt,
        endedAt: call.endedAt,
        duration: call.duration,
      },
    });
  } catch (error: any) {
    console.error("Update call error:", error);
    return NextResponse.json(
      { error: "Failed to update call" },
      { status: 500 }
    );
  }
}

// PATCH - Alternative way to update call status (used by video call page)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    await connectToDatabase();

    const call = await Call.findById(id);

    if (!call) {
      return NextResponse.json({ error: "Call not found" }, { status: 404 });
    }

    // Any participant can end the call
    if (
      call.callerId.toString() !== session.user.id &&
      call.receiverId.toString() !== session.user.id
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (status === "ended") {
      call.status = "ended";
      call.endedAt = new Date();

      if (call.startedAt) {
        call.duration = Math.floor(
          (call.endedAt.getTime() - call.startedAt.getTime()) / 1000
        );
      }

      // Reset both users' status
      await User.findByIdAndUpdate(call.callerId, {
        callStatus: "available",
      });
      await User.findByIdAndUpdate(call.receiverId, {
        callStatus: "available",
      });

      await call.save();
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Patch call error:", error);
    return NextResponse.json(
      { error: "Failed to update call" },
      { status: 500 }
    );
  }
}
