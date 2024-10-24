import { NextRequest, NextResponse } from 'next/server';

type ReasonData = {
  count: number;
  category: string;
};

async function getCustomReport(session: string, from: string, to: string) {
  const url = "https://cloud.3dprinteros.com/apiglobal/get_custom_report";
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      'session': session,
      'from': from,
      'to': to,
      'type': 'json',
      'fields': 'this is ignored',
      'all_fields': '1',  // Set to 1 to include all fields
    })
  });

  const data = await response.json();
  
  if (!data.result) {
    console.error('API Error:', data.message);
    throw new Error(data.message || 'Failed to fetch custom report');
  }
  
  return data.message;
}

function aggregateReasons(reportData: any[]) {
  const reasons: { [key: string]: ReasonData } = {};
  
  // Skip the first two rows (headers and data types)
  for (let i = 2; i < reportData.length; i++) {
    const row = reportData[i];    
    const reason = row[19];  // Assuming the reason is in the 20th column (index 19), adjust if needed
    if (!reason) {
      continue;
    }
    
    const category = categorizeReason(reason);
    
    if (!reasons[category]) {
      reasons[category] = { count: 0, category };
    }
    reasons[category].count += 1;
  }

  return Object.values(reasons)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);  // Return top 10 reasons
}

function categorizeReason(reason: string): string {
  // can be adjusted and expanded as needed
  if (reason.includes('ME 2110')) return 'ME 2110';
  if (reason.includes('Personal Project')) return 'Personal Project';
  if (reason.includes('Research Project')) return 'Research Project';
  if (reason.includes('ME Capstone Project')) return 'ME Capstone Project';
  if (reason.includes('VIP')) return 'VIP';
  if (reason.includes('Other Academic Course')) return 'Other Academic Course';
  if (reason.includes('Project for Club/Lab/Other Org')) return 'Club/Lab/Org Project';
  if (reason.includes('Training/Studio Improvement')) return 'Training/Studio Improvement';
  if (reason.includes('ME 1670')) return 'ME 1670';
  return 'Other';
}

export async function GET(request: NextRequest) {
  try {
    const session = request.headers.get('x-printer-session');
    if (!session) {
      console.error('Session not provided');
      throw new Error('Session is not provided');
    }

    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from') || getDefaultFromDate();
    const to = searchParams.get('to') || getDefaultToDate();

    console.log('Fetching report for date range:', from, 'to', to);
    const reportData = await getCustomReport(session, from, to);
    console.log('Report data received, rows:', reportData.length);
    
    const commonReasons = aggregateReasons(reportData);
    console.log('Common reasons:', commonReasons);

    return NextResponse.json(commonReasons);
  } catch (error: any) {
    console.error('Error in GET request:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function getDefaultFromDate(): string {
  const date = new Date();
  date.setDate(date.getDate() - 31);
  return date.toISOString().split('T')[0];
}

function getDefaultToDate(): string {
  return new Date().toISOString().split('T')[0];
}