import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const user = await User.findById(session.user.id).select(
      "isOnline callStatus lastSeen"
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      isOnline: user.isOnline,
      callStatus: user.callStatus,
      lastSeen: user.lastSeen,
    });
  } catch (error: any) {
    console.error("Call status GET error:", error);
    return NextResponse.json(
      { error: "Failed to get call status" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { isOnline, callStatus } = body;

    // Validate callStatus
    if (callStatus && !["available", "busy", "offline"].includes(callStatus)) {
      return NextResponse.json(
        { error: "Invalid call status" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const updateData: any = {
      lastSeen: new Date(),
    };

    if (typeof isOnline === "boolean") {
      updateData.isOnline = isOnline;
    }

    if (callStatus) {
      updateData.callStatus = callStatus;
    }

    const user = await User.findByIdAndUpdate(
      session.user.id,
      updateData,
      { new: true }
    ).select("isOnline callStatus lastSeen");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      isOnline: user.isOnline,
      callStatus: user.callStatus,
      lastSeen: user.lastSeen,
    });
  } catch (error: any) {
    console.error("Call status PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update call status" },
      { status: 500 }
    );
  }
}
