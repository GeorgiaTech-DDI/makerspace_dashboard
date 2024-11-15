import { NextRequest, NextResponse } from "next/server";

interface UserSession {
  Name: string;
  EndDateTime?: string;
  StartDateTime: string;
}

interface Usage {
  InUseBy: UserSession[];
  ToolName?: string;
}

interface ToolUsageResponse {
  UsageList: Usage[];
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function getToolUsages(
  token: string,
  startDate: string,
  endDate: string,
) {
  const [egKey, egId] = token.split(":");
  const toolUsageUrl = `https://sums.gatech.edu/SUMS_React_Shift_Scheduler/rest/EGInfo/IndividualToolUsages?EGKey=${egKey}&EGId=${egId}&StartDate=${startDate}&EndDate=${endDate}`;

  try {
    const response = await fetch(toolUsageUrl);
    if (!response.ok) {
      let errorDetail;
      try {
        errorDetail = await response.text();
      } catch (e) {
        errorDetail = "Could not read error response";
      }
      throw new Error(
        `Failed to fetch tool usages: ${response.status} ${response.statusText}. Details: ${errorDetail}`,
      );
    }
    return await response.json();
  } catch (error) {
    console.error("Error in getToolUsages");
    throw error;
  }
}

function getMonthlyActiveUsers(
  users: UserSession[] | null | undefined,
): number {
  if (!users || !Array.isArray(users)) {
    return 0;
  }

  const uniqueUsers = new Set<string>();

  users.forEach((user) => {
    if (!user || !user.StartDateTime || !user.Name) return;

    try {
      const startTime = new Date(user.StartDateTime);
      if (isNaN(startTime.getTime())) {
        return;
      }
      uniqueUsers.add(user.Name);
    } catch (error) {
      console.error("Error processing user session:", error);
    }
  });

  return uniqueUsers.size;
}

export const dynamic = "force-dynamic";
export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("x-sums-token");
    if (!token) {
      throw new Error("SUMS token is not provided");
    }

    const url = new URL(request.url);
    const mode = url.searchParams.get("mode") || "default";

    // Get today's date
    const today = new Date();
    const adjustedToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - 1,
    );

    if (mode === "trend") {
      // Get 7 months of data for the trend view
      const trendData = [];

      for (let i = 6; i >= 0; i--) {
        const monthStart = new Date(
          adjustedToday.getFullYear(),
          adjustedToday.getMonth() - i,
          1,
        );
        const monthEnd =
          i === 0
            ? adjustedToday
            : new Date(
                adjustedToday.getFullYear(),
                adjustedToday.getMonth() - i + 1,
                0,
              );

        const data = await getToolUsages(
          token,
          formatDate(monthStart),
          formatDate(monthEnd),
        );

        const hubLoginUsage = data.UsageList.find(
          (usage: Usage) => usage.ToolName === "Hub Login",
        );

        const activeUsers = hubLoginUsage
          ? getMonthlyActiveUsers(hubLoginUsage.InUseBy)
          : 0;

        trendData.push(activeUsers);
      }

      // Get previous month's same day for comparison
      const previousMonthDate = new Date(adjustedToday);
      previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);

      // Get current day and previous month's same day data
      const [currentDayData, previousMonthDayData] = await Promise.all([
        getToolUsages(
          token,
          formatDate(adjustedToday),
          formatDate(adjustedToday),
        ),
        getToolUsages(
          token,
          formatDate(previousMonthDate),
          formatDate(previousMonthDate),
        ),
      ]);

      // Get counts for current and previous day
      const currentDayCount = getMonthlyActiveUsers(
        currentDayData.UsageList.find((u: Usage) => u.ToolName === "Hub Login")
          ?.InUseBy,
      );
      const previousDayCount = getMonthlyActiveUsers(
        previousMonthDayData.UsageList.find(
          (u: Usage) => u.ToolName === "Hub Login",
        )?.InUseBy,
      );

      // Calculate day-over-day month change
      const percentChange =
        previousDayCount === 0
          ? 0
          : ((currentDayCount - previousDayCount) / previousDayCount) * 100;

      // Get current month's total (will be the last item in trendData)
      const currentMonthCount = trendData[trendData.length - 1];

      return NextResponse.json({
        currentUsers: currentMonthCount.toFixed(2),
        previousUsers: previousDayCount.toFixed(2),
        percentChange:
          (percentChange > 0 ? "+" : "") + percentChange.toFixed(1) + "%",
        currentDayUsers: currentDayCount.toFixed(2),
        trend: trendData,
      });
    } else {
      // Default mode - current month data
      const monthStart = new Date(
        adjustedToday.getFullYear(),
        adjustedToday.getMonth(),
        1,
      );

      const dayStartDate = formatDate(adjustedToday);
      const dayEndDate = formatDate(adjustedToday);

      const weekStart = new Date(
        adjustedToday.getFullYear(),
        adjustedToday.getMonth(),
        adjustedToday.getDate() - 6,
      );
      const weekStartDate = formatDate(weekStart);
      const weekEndDate = formatDate(adjustedToday);

      const monthStartDate = formatDate(monthStart);
      const monthEndDate = formatDate(adjustedToday);

      const [dayData, weekData, monthData] = await Promise.all([
        getToolUsages(token, dayStartDate, dayEndDate),
        getToolUsages(token, weekStartDate, weekEndDate),
        getToolUsages(token, monthStartDate, monthEndDate),
      ]);

      return NextResponse.json({
        dayActiveUsers: getMonthlyActiveUsers(
          dayData.UsageList.find((u: Usage) => u.ToolName === "Hub Login")
            ?.InUseBy,
        ),
        weekActiveUsers: getMonthlyActiveUsers(
          weekData.UsageList.find((u: Usage) => u.ToolName === "Hub Login")
            ?.InUseBy,
        ),
        monthActiveUsers: getMonthlyActiveUsers(
          monthData.UsageList.find((u: Usage) => u.ToolName === "Hub Login")
            ?.InUseBy,
        ),
      });
    }
  } catch (error: any) {
    console.error("Error in GET request:", {
      message: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        error: error.message,
        currentUsers: "0",
        previousUsers: "0",
        percentChange: "0%",
        currentDayUsers: "0",
        trend: [0, 0, 0, 0, 0, 0, 0],
      },
      { status: 500 },
    );
  }
}
