// app/api/average-print-time/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Function to get custom report using session
async function getCustomReport(session: string) {
  const reportUrl = "https://cloud.3dprinteros.com/apiglobal/get_custom_report";

  const response = await fetch(reportUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      'session': session,
      'from': '2023-01-01', // Adjust the date range as needed
      'to': '2024-01-01',
      'type': 'json', // Request JSON response
      'all_fields': '1' // Include all fields in the report
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch custom report');
  }

  return data.message;
}

// GET request handler
export async function GET(request: NextRequest) {
  try {
    // Step 1: Authenticate and get session from header
    const session = request.headers.get('x-printer-session');
    if (!session) {
      throw new Error('Session is not provided');
    }

    // Step 2: Fetch custom report data using session
    const reportData = await getCustomReport(session);

    // Step 3: Calculate average print time per printer
    const printerTimes: { [key: string]: { name: string, totalPrintTime: number, count: number } } = {};

    reportData.forEach((entry: any) => {
      const printerId = entry['Printer ID'];
      const printerName = entry['Printer Name'];
      const realPrintTime = parseFloat(entry['Real Print Time']) || 0;

      if (!printerTimes[printerId]) {
        printerTimes[printerId] = {
          name: printerName,
          totalPrintTime: realPrintTime,
          count: 1
        };
      } else {
        printerTimes[printerId].totalPrintTime += realPrintTime;
        printerTimes[printerId].count += 1;
      }
    });

    // Calculate average print time per printer
    const averagePrintTimes = Object.keys(printerTimes).map((printerId) => {
      const { name, totalPrintTime, count } = printerTimes[printerId];
      return {
        printerId,
        printerName: name,
        averagePrintTime: totalPrintTime / count
      };
    });

    // Return the average print times as JSON
    return NextResponse.json(averagePrintTimes);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
