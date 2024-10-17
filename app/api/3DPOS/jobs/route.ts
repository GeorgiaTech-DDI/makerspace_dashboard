import { NextRequest, NextResponse } from 'next/server';

// Function to fetch printers from the API
async function getOrganizationPrinters(session: string) {
  const printerUrl = "https://cloud.3dprinteros.com/apiglobal/get_organization_printers_list";

  const response = await fetch(printerUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      'session': session,
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch printers');
  }

  return data.message; // Return the list of printers
}

// Function to fetch jobs for a specific printer
async function getPrinterJobs(session: string, printerId: string) {
  const jobsUrl = "https://cloud.3dprinteros.com/apiglobal/get_printer_jobs";

  const response = await fetch(jobsUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      'session': session,
      'printer_id': printerId, // Fetch jobs for specific printer
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch printer jobs');
  }

  return data.message || []; // Return the jobs data or an empty array
}

// GET request handler
export async function GET(request: NextRequest) {
  try {
    // Step 1: Get the session from the request headers
    const session = request.headers.get('x-printer-session');
    if (!session) {
      throw new Error('Session is not provided');
    }

    // Step 2: Fetch printers using the session
    const printers = await getOrganizationPrinters(session); // Now fetching actual printers

    // Step 3: Initialize variables for job tracking
    let totalJobs = 0;
    let successfulJobs = 0;
    let failedJobs = 0;

    // Step 4: Loop through each printer and fetch its jobs
    for (const printer of printers) {
      const printerId = printer.id; // Assuming printers have an ID property
      const jobs = await getPrinterJobs(session, printerId);

      // Step 5: Process each job if jobs array exists
      if (Array.isArray(jobs)) {
        for (const job of jobs) {
          totalJobs += 1;

          // Count successful jobs (status_id: 77)
          if (job.status_id === 77) {
            successfulJobs += 1;
          }

          // Count failed or aborted jobs (status_id: 43 - failed, 45 - aborted)
          if ([43, 45].includes(job.status_id)) {
            failedJobs += 1;
          }
        }
      }
    }

    // Step 6: Calculate percent successful, handle division by zero case
    const totalRelevantJobs = successfulJobs + failedJobs;
    const percentSuccessful = totalRelevantJobs > 0
      ? (successfulJobs / totalRelevantJobs) * 100
      : 0;

    // Step 7: Return the calculated results with status code 200
    return NextResponse.json({
      totalJobs,
      successfulJobs,
      failedJobs,
      percentSuccessful: `${percentSuccessful.toFixed(2)}%`
    }, { status: 200 });

  } catch (error: any) {
    // Handle errors and return error message with status 500
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
