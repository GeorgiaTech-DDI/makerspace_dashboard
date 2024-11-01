// app/api/SUMS/tool_usages/route.ts

import { NextRequest, NextResponse } from 'next/server';

async function getToolUsages(egKey: string, egId: string, startDate: string, endDate: string) {
  const url = `https://sums.gatech.edu/SUMS_React_Shift_Scheduler/rest/EGInfo/DailyToolUsages?EGKey=${egKey}&EGId=${egId}&StartDate=${encodeURIComponent(startDate)}&EndDate=${encodeURIComponent(endDate)}`;

  const response = await fetch(url);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('API Error:', errorText);
    throw new Error(`Failed to fetch tool usages: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);

  return `${year}-${month}-${day}`;
}

export async function GET(request: NextRequest) {
  try {
    // Get EGKey and EGId from environment variables
    const egKey = process.env.EG_KEY;
    const egId = process.env.EG_ID;

    if (!egKey || !egId) {
      throw new Error('EGKey or EGId is not provided');
    }

    // Get today's date
    const today = new Date();

    // Adjust "today" to yesterday
    const adjustedToday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);

    // Use adjustedToday for day usage
    const dayStartDate = formatDate(adjustedToday);
    const dayEndDate = formatDate(adjustedToday);

    console.log(`Adjusted Day Start Date: ${dayStartDate}, Day End Date: ${dayEndDate}`);

    // Week and month calculations remain the same
    const weekStart = new Date(adjustedToday.getFullYear(), adjustedToday.getMonth(), adjustedToday.getDate() - 6);
    const weekStartDate = formatDate(weekStart);
    const weekEndDate = formatDate(adjustedToday);

    const monthStart = new Date(adjustedToday.getFullYear(), adjustedToday.getMonth(), 1);
    const monthStartDate = formatDate(monthStart);
    const monthEndDate = formatDate(adjustedToday);

    // Fetch data for each period
    const [dayData, weekData, monthData] = await Promise.all([
      getToolUsages(egKey, egId, dayStartDate, dayEndDate),
      getToolUsages(egKey, egId, weekStartDate, weekEndDate),
      getToolUsages(egKey, egId, monthStartDate, monthEndDate),
    ]);

    // Function to aggregate usage hours
    function aggregateUsageHours(data: any[]): number {
      // Exclude non-tool items
      const excludeTools = [
        'Hub Login',
        'EcoMake Login',
        'Metal Room Login',
        'Wood Room Login',
        'Shift Time Clock',
        'SUMS Environment',
        'Request Replacement PI',
        'Test Inventory Tool',
        'CAE Helpdesk',
        'SUMS Environment',
      ];

      // Filter out excluded tools
      const filteredData = data.filter(item => !excludeTools.includes(item.ToolName));

      // Sum up the usage hours
      let totalUsageHours = 0;
      filteredData.forEach(item => {
        totalUsageHours += parseFloat(item.UsageHours);
      });
      return totalUsageHours;
    }

    const dayUsageHours = aggregateUsageHours(dayData);
    const weekUsageHours = aggregateUsageHours(weekData);
    const monthUsageHours = aggregateUsageHours(monthData);

    // Return the aggregated data
    return NextResponse.json({
      dayUsageHours: dayUsageHours.toFixed(2),
      weekUsageHours: weekUsageHours.toFixed(2),
      monthUsageHours: monthUsageHours.toFixed(2),
    });

  } catch (error: any) {
    console.error('Error in /api/SUMS/tool_usages:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
