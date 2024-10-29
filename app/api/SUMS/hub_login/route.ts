// api/SUMS/hub_login/route.ts

import { NextResponse } from 'next/server';

const EG_KEY = process.env.EG_KEY;
const EG_ID = process.env.EG_ID;

export async function GET() {
  try {
    if (!EG_KEY || !EG_ID) {
      throw new Error('EG_KEY or EG_ID is not set in environment variables.');
    }

    // Calculate today's date in 'YYYY-MM-DD' format
    const today = new Date();

    // Format the date as 'YYYY-MM-DD'
    const formattedDate = today.toISOString().split('T')[0];

    // Use today's date for both StartDate and EndDate
    const startDate = formattedDate;
    const endDate = formattedDate;

    // Construct the API URL with the new endpoint
    const apiUrl = `https://sums.gatech.edu/SUMS_React_Shift_Scheduler/rest/EGInfo/IndividualToolUsages?EGKey=${EG_KEY}&EGId=${EG_ID}&StartDate=${startDate}&EndDate=${endDate}`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('SUMS API Error:', errorText);
      throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Process the data
    const count = processHubLogins(data);

    return NextResponse.json({ hubLoginCount: count });
  } catch (error: any) {
    console.error('Error in /api/SUMS/hub_login:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function processHubLogins(data: any): number {
  let count = 0;

  // Check if UsageList exists and is an array
  if (!Array.isArray(data.UsageList)) {
    console.error('Invalid data format: UsageList is not an array');
    return count;
  }

  // Find the entry where ToolName is "Hub Login"
  const hubLoginEntry = data.UsageList.find((item: any) => item.ToolName === 'Hub Login');

  if (!hubLoginEntry || !Array.isArray(hubLoginEntry.InUseBy)) {
    console.error('No Hub Login data found.');
    return count;
  }

  // Process each InUseBy entry
  hubLoginEntry.InUseBy.forEach((entry: any) => {
    // Ensure StartDateTime exists
    if (!entry.StartDateTime) {
      return;
    }

    // Parse StartDateTime as a Date object
    const startDateTime = new Date(entry.StartDateTime);

    // Get the day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const dayOfWeek = startDateTime.getDay();

    // Check if day is Monday (1) through Thursday (4)
    if (dayOfWeek < 1 || dayOfWeek > 4) {
      return;
    }

    // Get hours and minutes
    const hours = startDateTime.getHours();
    const minutes = startDateTime.getMinutes();

    // Convert time to minutes since midnight
    const timeInMinutes = hours * 60 + minutes;

    // Define time ranges in minutes since midnight
    const regularStart = 10 * 60; // 10:00 AM
    const regularEnd = 17 * 60;   // 5:00 PM

    const afterHoursStart = 17 * 60; // 5:00 PM
    const afterHoursEnd = 19 * 60;   // 7:00 PM

    // Check if time falls within regular hours or after hours
    if (
      (timeInMinutes >= regularStart && timeInMinutes <= regularEnd) ||
      (timeInMinutes >= afterHoursStart && timeInMinutes <= afterHoursEnd)
    ) {
      count++;
    }
  });

  return count;
}
