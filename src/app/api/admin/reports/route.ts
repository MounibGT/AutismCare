import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Appointment from "@/models/Appointment";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "month";

    // Calculate date ranges based on period
    const now = new Date();
    let startDate: Date;
    let previousStartDate: Date;

    switch (period) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        previousStartDate = new Date(
          startDate.getTime() - 7 * 24 * 60 * 60 * 1000,
        );
        break;
      case "quarter":
        startDate = new Date(
          now.getFullYear(),
          Math.floor(now.getMonth() / 3) * 3,
          1,
        );
        previousStartDate = new Date(startDate);
        previousStartDate.setMonth(previousStartDate.getMonth() - 3);
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        previousStartDate = new Date(now.getFullYear() - 1, 0, 1);
        break;
      case "month":
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        previousStartDate = new Date(startDate);
        previousStartDate.setMonth(previousStartDate.getMonth() - 1);
        break;
    }

    // Get current period metrics
    const [currentMetrics, previousMetrics] = await Promise.all([
      // Current period
      Promise.all([
        User.countDocuments({
          role: "professional",
          status: { $ne: "inactive" },
          createdAt: { $gte: startDate },
        }),
        User.countDocuments({
          role: "client",
          status: { $ne: "inactive" },
          createdAt: { $gte: startDate },
        }),
        Appointment.countDocuments({
          status: "completed",
          createdAt: { $gte: startDate },
        }),
        Appointment.aggregate([
          {
            $match: {
              status: "completed",
              createdAt: { $gte: startDate },
            },
          },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: 80 }, // Assuming $80 per session
            },
          },
        ]),
      ]),
      // Previous period
      Promise.all([
        User.countDocuments({
          role: "professional",
          status: { $ne: "inactive" },
          createdAt: { $gte: previousStartDate, $lt: startDate },
        }),
        User.countDocuments({
          role: "client",
          status: { $ne: "inactive" },
          createdAt: { $gte: previousStartDate, $lt: startDate },
        }),
        Appointment.countDocuments({
          status: "completed",
          createdAt: { $gte: previousStartDate, $lt: startDate },
        }),
        Appointment.aggregate([
          {
            $match: {
              status: "completed",
              createdAt: { $gte: previousStartDate, $lt: startDate },
            },
          },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: 80 },
            },
          },
        ]),
      ]),
    ]);

    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100 * 100) / 100;
    };

    const currentRevenue = currentMetrics[3][0]?.totalRevenue || 0;
    const previousRevenue = previousMetrics[3][0]?.totalRevenue || 0;

    const metrics = {
      totalRevenue: currentRevenue,
      revenueChange: calculateChange(currentRevenue, previousRevenue),
      totalSessions: currentMetrics[2],
      sessionsChange: calculateChange(currentMetrics[2], previousMetrics[2]),
      activeProfessionals: currentMetrics[0],
      professionalsChange: calculateChange(
        currentMetrics[0],
        previousMetrics[0],
      ),
      activePatients: currentMetrics[1],
      patientsChange: calculateChange(currentMetrics[1], previousMetrics[1]),
    };

    // Get revenue breakdown
    const revenueBreakdown = await Appointment.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: null,
          sessionFees: { $sum: 80 },
          subscriptionPlans: { $sum: 0 }, // Not implemented yet
          resourceSales: { $sum: 0 }, // Not implemented yet
        },
      },
    ]);

    const breakdown = revenueBreakdown[0] || {
      sessionFees: 0,
      subscriptionPlans: 0,
      resourceSales: 0,
    };
    const totalRevenue =
      breakdown.sessionFees +
      breakdown.subscriptionPlans +
      breakdown.resourceSales;

    // Get top issue types
    const issueTypes = await Appointment.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: { $gte: startDate },
          issueType: { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: "$issueType",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 5,
      },
    ]);

    // Get professional performance data
    const professionalPerformance = await Appointment.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: "$professionalId",
          sessionsCount: { $sum: 1 },
          totalRevenue: { $sum: 80 },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "professional",
        },
      },
      {
        $unwind: "$professional",
      },
      {
        $project: {
          name: {
            $concat: ["$professional.firstName", " ", "$professional.lastName"],
          },
          totalSessions: "$sessionsCount",
          activeClients: { $literal: 0 }, // This would need more complex aggregation
          revenueGenerated: "$totalRevenue",
          avgRating: { $literal: 4.5 }, // Mock rating
        },
      },
      {
        $sort: { totalSessions: -1 },
      },
      {
        $limit: 5,
      },
    ]);

    return NextResponse.json({
      metrics,
      revenueBreakdown: {
        sessionFees: breakdown.sessionFees,
        subscriptionPlans: breakdown.subscriptionPlans,
        resourceSales: breakdown.resourceSales,
        total: totalRevenue,
      },
      topIssueTypes: issueTypes.map((item) => ({
        type: item._id,
        sessions: item.count,
      })),
      professionalPerformance,
    });
  } catch (error: any) {
    console.error("Admin reports API error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch reports data",
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 },
    );
  }
}
