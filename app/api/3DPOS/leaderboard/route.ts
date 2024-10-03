// app/api/3DPOS/jobs/leaderboard/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Helper function to get finished jobs from the API and aggregate them for the leaderboard
async function getMonthlyLeaderboard(session: string) {
  const jobsUrl = "https://cloud.3dprinteros.com/apiglobal/get_finished_jobs_report";
  
  // Get current month date range
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

  // Fetch finished jobs for the current month
  const response = await fetch(jobsUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      'session': session,
      'from': firstDay,
      'to': lastDay,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch finished jobs');
  }

  // Aggregate jobs by user
  const jobCountByUser: { [email: string]: { firstname: string, lastname: string, count: number } } = {};
  data.message.forEach((job: any) => {
    const { email, firstname, lastname } = job;
    if (!jobCountByUser[email]) {
      jobCountByUser[email] = { firstname, lastname, count: 0 };
    }
    jobCountByUser[email].count += 1;
  });

  // Convert aggregated data to an array and sort by job count (leaderboard)
  const leaderboard = Object.entries(jobCountByUser)
    .map(([email, { firstname, lastname, count }]) => ({ email, firstname, lastname, count }))
    .sort((a, b) => b.count - a.count)
    .splice(0, 11)

  return leaderboard;
}

// GET request handler for the leaderboard
export async function GET(request: NextRequest) {
  try {
    // Step 1: Authenticate and get session
    const session = request.headers.get('x-printer-session');
    if (!session) {
      throw new Error('Session is not provided');
    }

    // Get the leaderboard for the current month
    const leaderboard = await getMonthlyLeaderboard(session);

    // Return the leaderboard as JSON
    return NextResponse.json({ result: true, leaderboard });
  } catch (error: any) {
    return NextResponse.json({ result: false, message: error.message }, { status: 500 });
  }
}