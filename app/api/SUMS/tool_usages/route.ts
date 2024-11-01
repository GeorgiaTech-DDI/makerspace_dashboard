// app/api/SUMS/tool_usages/route.ts
import { NextRequest, NextResponse } from "next/server";

async function getToolUsages(
  egKey: string,
  egId: string,
  startDate: string,
  endDate: string,
) {
  const url = `https://sums.gatech.edu/SUMS_React_Shift_Scheduler/rest/EGInfo/DailyToolUsages?EGKey=${egKey}&EGId=${egId}&StartDate=${encodeURIComponent(startDate)}&EndDate=${encodeURIComponent(endDate)}`;
  const response = await fetch(url);
  if (!response.ok) {
    const errorText = await response.text();
    console.error("API Error:", errorText);
    throw new Error(
      `Failed to fetch tool usages: ${response.status} ${response.statusText}`,
    );
  }
  const data = await response.json();
  return data;
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = ("0" + (date.getMonth() + 1)).slice(-2);
  const day = ("0" + date.getDate()).slice(-2);
  return `${year}-${month}-${day}`;
}

export async function GET(request: NextRequest) {
  try {
    const egKey = process.env.EG_KEY;
    const egId = process.env.EG_ID;
    if (!egKey || !egId) {
      throw new Error("EGKey or EGId is not provided");
    }

    // Get URL parameters
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
          egKey,
          egId,
          formatDate(monthStart),
          formatDate(monthEnd),
        );
        const hours = aggregateUsageHours(data);
        trendData.push(hours);
      }

      // Calculate month-over-month change
      const currentMonth = trendData[trendData.length - 1];
      const previousMonth = trendData[trendData.length - 2];
      const percentChange =
        previousMonth === 0
          ? 0
          : ((currentMonth - previousMonth) / previousMonth) * 100;

      return NextResponse.json({
        currentHours: currentMonth.toFixed(2),
        previousHours: previousMonth.toFixed(2),
        percentChange:
          (percentChange > 0 ? "+" : "") + percentChange.toFixed(1) + "%",
        trend: trendData,
      });
    } else {
      // Original behavior
      const dayStartDate = formatDate(adjustedToday);
      const dayEndDate = formatDate(adjustedToday);

      const weekStart = new Date(
        adjustedToday.getFullYear(),
        adjustedToday.getMonth(),
        adjustedToday.getDate() - 6,
      );
      const weekStartDate = formatDate(weekStart);
      const weekEndDate = formatDate(adjustedToday);

      const monthStart = new Date(
        adjustedToday.getFullYear(),
        adjustedToday.getMonth(),
        1,
      );
      const monthStartDate = formatDate(monthStart);
      const monthEndDate = formatDate(adjustedToday);

      const [dayData, weekData, monthData] = await Promise.all([
        getToolUsages(egKey, egId, dayStartDate, dayEndDate),
        getToolUsages(egKey, egId, weekStartDate, weekEndDate),
        getToolUsages(egKey, egId, monthStartDate, monthEndDate),
      ]);

      return NextResponse.json({
        dayUsageHours: aggregateUsageHours(dayData).toFixed(2),
        weekUsageHours: aggregateUsageHours(weekData).toFixed(2),
        monthUsageHours: aggregateUsageHours(monthData).toFixed(2),
      });
    }
  } catch (error: any) {
    console.error("Error in /api/SUMS/tool_usages:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function aggregateUsageHours(data: any[]): number {
  const excludeTools = [
    "Hub Login",
    "EcoMake Login",
    "Metal Room Login",
    "Wood Room Login",
    "Shift Time Clock",
    "SUMS Environment",
    "Request Replacement PI",
    "Test Inventory Tool",
    "CAE Helpdesk",
    "SUMS Environment",
  ];

  const filteredData = data.filter(
    (item) => !excludeTools.includes(item.ToolName),
  );
  return filteredData.reduce(
    (sum, item) => sum + parseFloat(item.UsageHours),
    0,
  );
}
