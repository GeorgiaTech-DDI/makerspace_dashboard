import { NextRequest, NextResponse } from 'next/server';

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

// Helper function to get date in "YYYY-MM-DD" format
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Helper function to fetch attendance data from SUMS API
async function fetchToolUsages(token: string, from: string, to: string): Promise<ToolUsageResponse> {
  const [egKey, egId] = token.split(":");
  const toolUsageUrl = `https://sums.gatech.edu/SUMS_React_Shift_Scheduler/rest/EGInfo/IndividualToolUsages?EGKey=${egKey}&EGId=${egId}&StartDate=${from}&EndDate=${to}`;

  const response = await fetch(toolUsageUrl);
  if (!response.ok) {
    const errorDetail = await response.text();
    throw new Error(`Failed to fetch tool usages: ${errorDetail}`);
  }

  const data = await response.json();
  return data;
}


export const dynamic = 'force-dynamic'; // Required because we're using headers
export const runtime = 'edge'; // Optional: Choose edge or nodejs runtime
// Main function to handle GET requests and process attendance data
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('x-sums-token');
    if (!token) {
      throw new Error('SUMS token is not provided');
    }

    const searchParams = request.nextUrl.searchParams;
    const fromDate = searchParams.get('from');
    const toDate = searchParams.get('to');

    if (!fromDate || !toDate) {
      throw new Error('Date range is required');
    }

    const usageData = await fetchToolUsages(token, fromDate, toDate);

    const attendanceMap: Record<string, Set<string>> = {}; // Stores unique users per day

    usageData.UsageList.forEach((usage) => {
      usage.InUseBy.forEach((session) => {
        const sessionDate = formatDate(new Date(session.StartDateTime));

        // Initialize a set for each date to store unique users
        if (!attendanceMap[sessionDate]) {
          attendanceMap[sessionDate] = new Set();
        }
        attendanceMap[sessionDate].add(session.Name); // Add user to set to avoid double-counting
      });
    });

    // Transform attendanceMap to desired output format
    const attendanceData = Object.keys(attendanceMap).map((date) => ({
      date,
      uniqueUsers: attendanceMap[date].size, // Count of unique users per day
    }));

    return NextResponse.json({ attendanceData });
  } catch (error: any) {
    console.error("Error in GET request:", error.message);
    return NextResponse.json(
      {
        error: error.message,
        attendanceData: [],
      },
      { status: 500 },
    );
  }
}