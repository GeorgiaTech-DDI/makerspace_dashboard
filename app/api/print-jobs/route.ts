import { NextRequest, NextResponse } from "next/server";
import { getOrganizationPrinters } from "@/app/api/3DPOS/printers/route";
import { getPrinterJobCounts } from "@/app/api/3DPOS/printer-job-counts/route";

async function getTimingPerPrinter(session: string, job_id: number) {
  const jobInfoUrl = "https://cloud.3dprinteros.com/apiglobal/get_job_info";

  const response = await fetch(jobInfoUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      session: session,
      job_id: job_id.toString(),
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch job info");
  }

  const jobArray = {
    job_id: job_id,
    status: "",
    print_time: "n/a",
    printing_duration: "n/a",
  };

  switch (data.message.status_id) {
    case "11":
      jobArray.status = "in_queue";
      jobArray.printing_duration = data.message.printing_duration;
      break;
    case "21":
      jobArray.status = "in_queue";
      jobArray.printing_duration = data.message.printing_duration;
      break;
  }

  if (data.message.status_id == "11" || data.message.status_id == "21") {
    return jobArray;
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = request.headers.get("x-printer-session");
    const limit = request.nextUrl.searchParams.get("limit") || "20";
    const offset = request.nextUrl.searchParams.get("offset") || "0";

    if (!session) {
      throw new Error("Session Printer ID is not provided");
    }

    const printers = await getOrganizationPrinters(session);

    const printerJobStatusMap: { [key: number]: any } = {};
    for (const printer of printers) {
      const printerID = printer.id;
      const jobCounts = await getPrinterJobCounts(
        session,
        parseInt(printerID),
        parseInt(limit),
        parseInt(offset)
      );
      printerJobStatusMap[printerID] = jobCounts;
    }
    return NextResponse.json(printerJobStatusMap);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
