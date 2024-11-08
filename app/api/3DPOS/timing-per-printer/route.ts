import { NextRequest, NextResponse } from "next/server";
import { getJobInfo } from "../get-job-info/route";
import { getJobsPerPrinter } from "../print-jobs/route";
import { getOrganizationPrinters } from "../printers/route";

export const dynamic = "force-dynamic"; // Required because we're using headers
export const runtime = "edge"; // Optional: Choose edge or nodejs runtime

export async function GET(request: NextRequest) {
  try {
    const session = request.headers.get("x-printer-session");

    if (!session) {
      throw new Error("Session is not provided");
    }

    // Get an array of the list of printer ids
    const printersDict = await getOrganizationPrinters(session);
    const printers: string[] = [];
    for (const printer of printersDict) {
      printers.push(printer.id);
    }

    // Get map of printer ids to job ids per printer
    const jobsPerPrinterMap = await getJobsPerPrinter(session);
    const printerTimingMap: { [printer_id: string]: PrinterTimings } = {};

    for (const printer of printers) {
      printerTimingMap[printer] = {
        in_progess: [],
        in_queue: [],
      };

      const jobs = jobsPerPrinterMap[parseInt(printer)];

      for (const job_id of jobs) {
        try {
          const jobInfo = await getJobInfo(session, parseInt(job_id));

          if (jobInfo.result && jobInfo.message) {
            const job = jobInfo.message;

            if (job.status_id == "11") {
              printerTimingMap[printer].in_queue.push({
                job_id: job_id,
                print_time: job.print_time,
                printing_duration: job.printing_duration,
              });
            } else if (job.status_id == "21") {
              printerTimingMap[printer].in_progess.push({
                job_id: job_id,
                print_time: job.print_time,
                printing_duration: job.printing_duration,
              });
            }
          }
        } catch (error) {
          throw new Error(`Failed to fetch job info for job ${job_id}`);
        }
      }
    }

    return NextResponse.json(printerTimingMap);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

interface JobTiming {
  job_id: string;
  print_time: number;
  printing_duration: number;
}

interface PrinterTimings {
  in_progess: JobTiming[];
  in_queue: JobTiming[];
}
