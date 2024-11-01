import { NextRequest, NextResponse } from "next/server";
import { getOrganizationPrinters } from "../printers/route";

async function getPrinterJobCounts(
  session: string,
  printer_id: number,
  limit = 20,
  offset = 0,
) {
  const printJobsUrl =
    "https://cloud.3dprinteros.com/apiglobal/get_printer_jobs";

  const response = await fetch(printJobsUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      session: session,
      printer_id: printer_id.toString(),
      limit: limit.toString(),
      offset: offset.toString(),
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch printer jobs");
  }

  let jobCounts = {
    in_queue: 0,
    in_progress: 0,
    failed: 0,
    finished: 0,
    aborted: 0,
  };

  if (Array.isArray(data.message)) {
    data.message.forEach((job: any) => {
      switch (job.status_id) {
        case "11":
          jobCounts.in_queue++;
          break;
        case "21":
          jobCounts.in_progress++;
          break;
        case "43":
          jobCounts.failed++;
          break;
        case "45":
          jobCounts.aborted++;
          break;
        case "77":
          jobCounts.finished++;
          break;
      }
    });
  }

  return jobCounts;
}

export async function GET(request: NextRequest) {
  try {
    const session = request.headers.get("x-printer-session");
    const limit = request.nextUrl.searchParams.get("limit") || "20";
    const offset = request.nextUrl.searchParams.get("offset") || "0";

    if (!session) {
      throw new Error("Session or Printer ID is not provided");
    }

    const printers = await getOrganizationPrinters(session);
    const printerJobStatusMap: { [key: number]: any } = {};
    for (const printer of printers) {
      const printerID = printer.id;
      const jobCounts = await getPrinterJobCounts(
        session,
        parseInt(printerID),
        parseInt(limit),
        parseInt(offset),
      );
      printerJobStatusMap[printerID] = jobCounts;
    }
    return NextResponse.json(printerJobStatusMap);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
