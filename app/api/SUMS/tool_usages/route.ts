import { NextRequest, NextResponse } from "next/server";

async function getToolUsages(
  token: string,
  startDate: string,
  endDate: string,
) {
  const [egKey, egId] = token.split(":");
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
    // Get token from header
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
        const hours = aggregateUsageHours(data);
        trendData.push(hours);
      }

      // Get previous month's same day
      const previousMonthDate = new Date(adjustedToday);
      previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);
      
      // Get current day and previous month's same day data
      const [currentDayData, previousMonthDayData] = await Promise.all([
        getToolUsages(
          token,
          formatDate(adjustedToday),
          formatDate(adjustedToday)
        ),
        getToolUsages(
          token,
          formatDate(previousMonthDate),
          formatDate(previousMonthDate)
        )
      ]);

      // Get current month's total hours (will be the last item in trendData)
      const currentMonthHours = trendData[trendData.length - 1];

      const currentDayHours = aggregateUsageHours(currentDayData);
      const previousMonthDayHours = aggregateUsageHours(previousMonthDayData);

      // Calculate day-over-day month change
      const percentChange =
        previousMonthDayHours === 0
          ? 0
          : ((currentDayHours - previousMonthDayHours) / previousMonthDayHours) * 100;

      return NextResponse.json({
        currentHours: currentMonthHours.toFixed(2),
        previousHours: previousMonthDayHours.toFixed(2),
        percentChange:
          (percentChange > 0 ? "+" : "") + percentChange.toFixed(1) + "%",
        currentDayHours: currentDayHours.toFixed(2),
        trend: trendData,
      });
    } else {
      // Original behavior for default mode
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
        getToolUsages(token, dayStartDate, dayEndDate),
        getToolUsages(token, weekStartDate, weekEndDate),
        getToolUsages(token, monthStartDate, monthEndDate),
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