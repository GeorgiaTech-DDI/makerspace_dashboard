import { NextRequest, NextResponse } from 'next/server';

// Function to fetch printer jobs from the API
async function getPrinterJobs(session: string, printerId: string, limit: number = 20, offset: number = 0, prevTime: number = 0) {
  const jobsUrl = "https://cloud.3dprinteros.com/apiglobal/get_printer_jobs";

  const response = await fetch(jobsUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      'session': session,
      'printer_id': printerId, // Fetch jobs for the specific printer
      'limit': limit.toString(), // Max job count
      'offset': offset.toString(), // Offset for pagination
      'prev_time': prevTime.toString() // Used for live updates
    }),
  });

  const data = await response.json();
  if (!response.ok || !data.result) {
    throw new Error(data.message || 'Failed to fetch printer jobs');
  }

  return data.message || []; // Return the jobs data or empty array if none
}

// Function to calculate percent successful jobs
async function calculatePercentSuccessful(session: string, printers: any[]) {
  let totalJobs = 0;
  let successfulJobs = 0;
  let failedJobs = 0;

  // Loop through each printer and fetch its jobs
  for (const printer of printers) {
    const printerId = printer.id;
    const jobs = await getPrinterJobs(session, printerId);

    // Process the jobs if they exist
    if (jobs && jobs.length > 0) {
      for (const job of jobs) {
        totalJobs += 1;

        // Count successful jobs (status_id: 77)
        if (job.status_id === '77') {
          successfulJobs += 1;
        }

        // Count failed jobs (status_id: 43 - failed, 45 - aborted)
        if (['43', '45'].includes(job.status_id)) {
          failedJobs += 1;
        }
      }
    }
  }

  // Calculate percent successful
  const percentSuccessful = totalJobs > 0 ? (successfulJobs / totalJobs) * 100 : 0;

  return {
    totalJobs,
    successfulJobs,
    failedJobs,
    percentSuccessful: `${percentSuccessful.toFixed(2)}%`,
  };
}

// Helper function to group jobs by day or week, handling "YYYY-MM-DD HH:MM:SS" format
function groupJobsByPeriod(jobs: any[], period: 'day' | 'week') {
  const jobGroups: { [key: string]: any[] } = {};

  jobs.forEach(job => {
    const [datePart] = job.datetime.split(' '); // Extract the "YYYY-MM-DD" part
    const jobDate = new Date(datePart); // Parse the date part

    let periodKey: string = '';

    if (period === 'day') {
      // Group by day (e.g., 2024-09-27)
      periodKey = jobDate.toISOString().split('T')[0];
    } else if (period === 'week') {
      // Group by week (ISO Week Number: YYYY-WW)
      // First, we extract the year of the job (e.g., 2024).
      const weekYear = jobDate.getFullYear();
      // Then, we calculate which week of the year the date falls into.
      // To do this, we:
      // 1. Get the difference in milliseconds between the job date and the first day of the year (Jan 1st).
      // 2. Convert this difference from milliseconds to days by dividing by 86400000 (milliseconds in a day).
      // 3. Add the current day of the week and 1 (because JavaScript's `getDay()` returns 0 for Sunday).
      // 4. Divide by 7 to find the week number, and use `Math.ceil()` to round it up to the nearest whole number.
      const weekNumber = Math.ceil((((jobDate.getTime() - new Date(weekYear, 0, 1).getTime()) / 86400000) + jobDate.getDay() + 1) / 7);
      // We then create the `periodKey` by combining the year and the week number, using the format "YYYY-WW", e.g. "2024-W36".
      periodKey = `${weekYear}-W${weekNumber}`;
    }

    if (!jobGroups[periodKey]) {
      jobGroups[periodKey] = [];
    }
    jobGroups[periodKey].push(job);
  });

  return jobGroups;
}

// Function to calculate average jobs per day or week
async function calculateAverageJobsPerPeriod(session: string, printers: any[], period: 'day' | 'week') {
  const completedJobs = [];

  // Loop through each printer and fetch its jobs
  for (const printer of printers) {
    const printerId = printer.id;
    const jobs = await getPrinterJobs(session, printerId);

    // Filter jobs for completed ones (status_id: 77)
    const completedPrinterJobs = jobs.filter((job: any) => job.status_id === '77');
    completedJobs.push(...completedPrinterJobs);
  }

  // Group jobs by the specified period (day or week)
  const jobsByPeriod = groupJobsByPeriod(completedJobs, period);

  // Calculate average jobs per period
  const periods = Object.keys(jobsByPeriod);
  const totalPeriods = periods.length;
  const totalCompletedJobs = completedJobs.length;
  const averageJobsPerPeriod = totalPeriods > 0 ? totalCompletedJobs / totalPeriods : 0;

  return {
    totalCompletedJobs,
    totalPeriods,
    averageJobsPerPeriod: averageJobsPerPeriod.toFixed(2),
    // jobsByPeriod,
  };
}

// GET request handler for the /jobs route
export async function GET(request: NextRequest) {
  try {
    // Assuming the proxy provides a valid session token
    const session = request.headers.get('x-printer-session');
    
    if (!session) {
      throw new Error('Session is not provided');
    }

    // Fetch printers
    const printersUrl = "https://cloud.3dprinteros.com/apiglobal/get_organization_printers_list";
    const printersResponse = await fetch(printersUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'session': session as string, // Ensure session is a string
      }),
    });

    const printersData = await printersResponse.json();
    if (!printersResponse.ok || !printersData.result) {
      throw new Error('Failed to fetch printers');
    }

    const printers = printersData.message;

    if (!printers || printers.length === 0) {
      throw new Error('No printers available.');
    }

    // Calculate percent successful using the printers list
    const percentSuccessData = await calculatePercentSuccessful(session, printers);

    // Calculate average jobs per day
    const averageJobsPerDayData = await calculateAverageJobsPerPeriod(session, printers, 'day');

    // Calculate average jobs per week
    const averageJobsPerWeekData = await calculateAverageJobsPerPeriod(session, printers, 'week');

    // Return both results
    return NextResponse.json({
      percentSuccessData,
      averageJobsPerDayData,
      averageJobsPerWeekData,
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}