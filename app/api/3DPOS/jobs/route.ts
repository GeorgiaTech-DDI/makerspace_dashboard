import { NextRequest, NextResponse } from "next/server";

// Status constants
const STATUS_COMPLETED = "DONE";
const STATUS_CANCELLED = "CANCELLED_WEB";

// Helper function to format date as YYYY-MM-DD
function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

// Helper function to get the start of the week for a given date
function getStartOfWeek(date: Date): Date {
  const d = new Date(date.getTime());
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay()); // Set to previous Sunday
  return d;
}

// Helper function to format week as YYYY-MM-DD/YYYY-MM-DD (start date / end date)
function formatWeek(startDate: Date): string {
  const endDate = new Date(startDate.getTime());
  endDate.setDate(endDate.getDate() + 6);
  return `${formatDate(startDate)}/${formatDate(endDate)}`;
}

// Function to fetch custom report from the API
async function getCustomReport(session: string, from: string, to: string) {
  const reportUrl = "https://cloud.3dprinteros.com/apiglobal/get_custom_report";

  const response = await fetch(reportUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      session: session,
      from: from,
      to: to,
      type: "json",
      all_fields: "1",
    }),
  });

  const data = await response.json();
  if (!response.ok || !data.result) {
    throw new Error(data.message || "Failed to fetch custom report");
  }

  return data.message;
}

// Function to calculate metrics for a specific period
function calculateMetrics(
  reportData: any[],
  period: "day" | "week",
  endDate: Date,
) {
  const [headers, ...rows] = reportData;
  const statusIndex = headers.indexOf("Status");
  const printDateIndex = headers.indexOf("Started Date/Time");

  let totalJobs = 0;
  let completedJobs = 0;
  let cancelledJobs = 0;

  const startDate = period === "week" ? getStartOfWeek(endDate) : endDate;
  const periodKey = formatDate(startDate);

  rows.forEach((row) => {
    const status = row[statusIndex];
    const printDate = new Date(row[printDateIndex]);

    if (
      (period === "week" && printDate >= startDate && printDate <= endDate) ||
      (period === "day" && formatDate(printDate) === periodKey)
    ) {
      totalJobs++;
      if (status === STATUS_COMPLETED) {
        completedJobs++;
      } else if (status === STATUS_CANCELLED) {
        cancelledJobs++;
      }
    }
  });

  const percentSuccessful =
    totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0;

  return {
    period: periodKey,
    percentSuccessful: percentSuccessful.toFixed(2) + "%",
    totalJobs,
    completedJobs,
    cancelledJobs,
  };
}

// Helper function to get the last 7 periods (days or weeks)
function getLast7Periods(period: "day" | "week", currentDate: Date) {
  const periods = [];
  for (let i = 0; i < 7; i++) {
    const tempDate = new Date(currentDate);
    if (period === "week") {
      tempDate.setDate(currentDate.getDate() - i * 7); // Go back by 7 days for each week
      periods.push(formatWeek(getStartOfWeek(tempDate)));
    } else {
      tempDate.setDate(currentDate.getDate() - i); // Go back by 1 day for each day
      periods.push(formatDate(tempDate));
    }
  }
  return periods.reverse();
}

export const dynamic = 'force-dynamic'; // Required because we're using headers
export const runtime = 'edge'; // Optional: Choose edge or nodejs runtime

// GET request handler for the /jobs route
export async function GET(request: NextRequest) {
  try {
    const session = request.headers.get("x-printer-session");
    if (!session) {
      throw new Error("Session is not provided");
    }

    const searchParams = request.nextUrl.searchParams;
    const periodParam = searchParams.get("period");
    const dateParam = searchParams.get("date");

    if (!periodParam || !dateParam) {
      throw new Error("Period and date parameters are required");
    }

    if (periodParam !== "day" && periodParam !== "week") {
      throw new Error('Invalid period parameter. Use "day" or "week"');
    }

    // Parse the current date from the date parameter
    const currentDate = new Date(dateParam);
    if (isNaN(currentDate.getTime())) {
      throw new Error("Invalid date parameter");
    }

    const periods = getLast7Periods(periodParam as "day" | "week", currentDate); // Get the last 7 periods
    const metricsArray = [];

    // Loop over each period and fetch the report
    for (const period of periods) {
      const [from, to] = period.includes("/")
        ? period.split("/")
        : [period, period]; // Week ranges or day
      const reportData = await getCustomReport(session, from, to);

      // Calculate and store the metrics for this period
      const metrics = calculateMetrics(
        reportData,
        periodParam as "day" | "week",
        new Date(to),
      );
      metricsArray.push(metrics);
    }

    return NextResponse.json(metricsArray); // Return an array of metrics for the last 7 periods
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
