// app/api/3DPOS/average-print-time/route.ts
import { NextRequest, NextResponse } from "next/server";

type PrinterTimeData = {
  totalTime: number;
  count: number;
  name: string;
};

async function getCustomReport(session: string, from: string, to: string) {
  const url = "https://cloud.3dprinteros.com/apiglobal/get_custom_report";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      session: session,
      from: from,
      to: to,
      type: "json",
      fields: "printer_id,printer_name,real_print_time",
      all_fields: "0",
    }),
  });

  const data = await response.json();

  if (!data.result) {
    console.error("API Error:", data.message);
    throw new Error(data.message || "Failed to fetch custom report");
  }
  return data.message;
}

function calculateAveragePrintTime(reportData: any[]) {
  const printerTimes: { [key: string]: PrinterTimeData } = {};

  // Skip the first two rows (headers and data types)
  for (let i = 2; i < reportData.length; i++) {
    const [printerId, printerName, realPrintTime] = reportData[i];

    const timeInMinutes = convertToMinutes(realPrintTime);

    if (!printerTimes[printerId]) {
      printerTimes[printerId] = { totalTime: 0, count: 0, name: printerName };
    }

    printerTimes[printerId].totalTime += timeInMinutes;
    printerTimes[printerId].count += 1;
  }
  return Object.entries(printerTimes).map(([printerId, data]) => ({
    printerId,
    printerName: data.name,
    averagePrintTime: (data.totalTime / data.count).toFixed(2),
  }));
}

function convertToMinutes(timeString: string): number {
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + minutes;
}

export async function GET(request: NextRequest) {
  try {
    const session = request.headers.get("x-printer-session");
    if (!session) {
      console.error("Session not provided");
      throw new Error("Session is not provided");
    }

    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from") || getDefaultFromDate();
    const to = searchParams.get("to") || getDefaultToDate();

    const reportData = await getCustomReport(session, from, to);

    const averagePrintTimes = calculateAveragePrintTime(reportData);

    return NextResponse.json(averagePrintTimes);
  } catch (error: any) {
    console.error("Error in GET request:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function getDefaultFromDate(): string {
  const date = new Date();
  date.setDate(date.getDate() - 31);
  return date.toISOString().split("T")[0];
}

function getDefaultToDate(): string {
  return new Date().toISOString().split("T")[0];
}
