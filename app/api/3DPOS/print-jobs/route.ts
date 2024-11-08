import { NextRequest, NextResponse } from "next/server";
import { getOrganizationPrinters } from "../printers/route";

export async function getJobsPerPrinter(session: string) {
  const printJobsUrl =
    "https://cloud.3dprinteros.com/apiglobal/get_printer_jobs";

  const printers = await getOrganizationPrinters(session);
  const jobsPerPrinterMap: { [key: number]: any } = {};

  for (const printer of printers) {
    const printerID = printer.id;
    const response = await fetch(printJobsUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        session: session,
        printer_id: printerID.toString(),
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to fetch printer jobs");
    }

    var printJobs: number[] = [];

    if (Array.isArray(data.message)) {
      data.message.forEach((job: any) => {
        printJobs.push(job.id);
      });
      jobsPerPrinterMap[printerID] = printJobs;
    }
  }

  return jobsPerPrinterMap;
}

export const dynamic = 'force-dynamic'; // Required because we're using headers
export const runtime = 'edge'; // Optional: Choose edge or nodejs runtime

export async function GET(request: NextRequest) {
  try {
    const session = request.headers.get("x-printer-session");

    if (!session) {
      throw new Error("Session is not provided");
    }

    const map = await getJobsPerPrinter(session);

    return NextResponse.json(map);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
