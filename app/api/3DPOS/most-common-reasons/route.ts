import { NextRequest, NextResponse } from 'next/server';

// Status constants
const STATUS_CANCELLED = 'CANCELLED_WEB';

// Helper function to format date as YYYY-MM-DD
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Helper function to get the default date range (last 3 months)
function getDefaultDateRange() {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(endDate.getMonth() - 3); // Go back 3 months
  return { from: formatDate(startDate), to: formatDate(endDate) };
}

// Function to fetch custom report from the API
async function getCustomReport(session: string, from: string, to: string) {
  const reportUrl = "https://cloud.3dprinteros.com/apiglobal/get_custom_report";

  const response = await fetch(reportUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      'session': session,
      'from': from,
      'to': to,
      'type': 'json',
      'all_fields': '1',
    }),
  });

  const data = await response.json();
  if (!response.ok || !data.result) {
    throw new Error(data.message || 'Failed to fetch custom report');
  }

  return data.message;
}

// Function to count and group cancellation reasons
function countCancelReasons(reportData: any[]): Record<string, number> {
  const [headers, ...rows] = reportData;
  const statusIndex = headers.indexOf('Status');
  const reasonIndex = headers.indexOf('Cancel Reason');

  const categoryMapping = {
    "3D model/job issues": "3D Model/Job Issues",
    "Hardware issues": "Hardware Issues",
    "Slicing issues": "Slicing Issues",
    "Calibration issues": "Calibration Issues",
    "User cancelled": "User Cancellation",
  };

  const cancelReasonsCount: Record<string, number> = {};

  rows.forEach(row => {
    const status = row[statusIndex];
    const rawReason = row[reasonIndex];

    if (status === STATUS_CANCELLED && rawReason) {
      // Remove leading '- ' and get the first category part
      const cleanReason = rawReason.replace(/^- /, '').split(':')[0].trim();
      // Group the reason into a broader category
      const category = categoryMapping[cleanReason as keyof typeof categoryMapping] || "Other";

      // Count the occurrence of the category
      if (!cancelReasonsCount[category]) {
        cancelReasonsCount[category] = 0;
      }
      cancelReasonsCount[category]++;
    }
  });

  return cancelReasonsCount;
}

// Helper function to convert count object to percentage for visualization
function convertToPercentage(countData: Record<string, number>): Array<{ reason: string, percentage: number }> {
  const total = Object.values(countData).reduce((sum, count) => sum + count, 0);
  return Object.entries(countData).map(([reason, count]) => ({
    reason,
    percentage: parseFloat(((count / total) * 100).toFixed(2)),
  }));
}

// GET request handler for the /reasons route
export async function GET(request: NextRequest) {
  try {
    const session = request.headers.get('x-printer-session');
    if (!session) {
      throw new Error('Session is not provided');
    }

    const searchParams = request.nextUrl.searchParams;
    const fromDate = searchParams.get('from');
    const toDate = searchParams.get('to');

    // Default to the last 3 months if date range is not provided
    const { from, to } = fromDate && toDate ? { from: fromDate, to: toDate } : getDefaultDateRange();

    // Fetch data from the custom report API
    const reportData = await getCustomReport(session, from, to);

    // Count and group the most common cancellation reasons
    const reasonsCount = countCancelReasons(reportData);

    // Convert data to percentages for visualization
    const formattedData = convertToPercentage(reasonsCount);

    return NextResponse.json({ mostCommonReasons: formattedData });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}