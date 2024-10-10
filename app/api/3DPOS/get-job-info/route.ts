import { NextRequest, NextResponse } from "next/server";
import { getJobsPerPrinter } from "../print-jobs/route";

export async function getJobInfo(session: string, job_id: number) {
  const jobInfoURL = "https://cloud.3dprinteros.com/apiglobal/get_job_info";

  const response = await fetch(jobInfoURL, {
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

  return data;
}

export async function GET(request: NextRequest) {
  try {
    const session = request.headers.get("x-printer-session");
    const job_id = request.nextUrl.searchParams.get("job_id");

    if (!session || !job_id) {
      throw new Error("Session or Job ID is not provided");
    }

    const job_info = await getJobInfo(session, parseInt(job_id));

    return NextResponse.json(job_info);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
