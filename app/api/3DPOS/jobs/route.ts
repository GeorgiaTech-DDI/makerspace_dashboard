import { NextRequest, NextResponse } from 'next/server';

// Status constants
const STATUS_COMPLETED = 'DONE';
const STATUS_CANCELLED = 'CANCELLED_WEB';

// Helper function to format date as YYYY-MM-DD
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
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

// Updated function to calculate metrics for a specific period
function calculateMetrics(reportData: any[], period: 'day' | 'week', endDate: Date) {
  const [headers, types, ...rows] = reportData;

  const statusIndex = headers.indexOf('Status');
  const printDateIndex = headers.indexOf('Print Date/Time');

  let totalJobs = 0;
  let completedJobs = 0;
  let cancelledJobs = 0;
  const jobsByPeriod: { [key: string]: number } = {};

  const startDate = period === 'week' ? getStartOfWeek(endDate) : endDate;
  const periodKey = period === 'week' 
    ? formatWeek(startDate)
    : formatDate(startDate);

  rows.forEach(row => {
    const status = row[statusIndex];
    const printDate = new Date(row[printDateIndex]);

    if (period === 'week' && printDate >= startDate && printDate <= endDate) {
      totalJobs++;
      if (status === STATUS_COMPLETED) {
        completedJobs++;
        jobsByPeriod[periodKey] = (jobsByPeriod[periodKey] || 0) + 1;
      } else if (status === STATUS_CANCELLED) {
        cancelledJobs++;
      }
    } else if (period === 'day' && formatDate(printDate) === periodKey) {
      totalJobs++;
      if (status === STATUS_COMPLETED) {
        completedJobs++;
        jobsByPeriod[periodKey] = (jobsByPeriod[periodKey] || 0) + 1;
      } else if (status === STATUS_CANCELLED) {
        cancelledJobs++;
      }
    }
  });

  const percentSuccessful = totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0;

  return {
    period: periodKey,
    percentSuccessful: percentSuccessful.toFixed(2) + '%',
    totalJobs,
    completedJobs,
    cancelledJobs,
    jobsCount: jobsByPeriod[periodKey] || 0
  };
}

// GET request handler for the /jobs route
export async function GET(request: NextRequest) {
  try {
    const session = request.headers.get('x-printer-session');
    if (!session) {
      throw new Error('Session is not provided');
    }

    const searchParams = request.nextUrl.searchParams;
    const periodParam = searchParams.get('period');
    const dateParam = searchParams.get('date');

    if (!periodParam || !dateParam) {
      throw new Error('Period and date parameters are required');
    }

    if (periodParam !== 'day' && periodParam !== 'week') {
      throw new Error('Invalid period parameter. Use "day" or "week"');
    }

    const endDate = new Date(dateParam);
    if (isNaN(endDate.getTime())) {
      throw new Error('Invalid date parameter');
    }

    const startDate = periodParam === 'week' ? getStartOfWeek(endDate) : endDate;
    const from = formatDate(startDate);
    const to = formatDate(endDate);

    const reportData = await getCustomReport(session, from, to);
    const metrics = calculateMetrics(reportData, periodParam, endDate);

    return NextResponse.json(metrics);

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}