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
    const reason = row[22];  // Changed from 19 to 22 to get the Feedback column
    
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
    .slice(0, 10);
}

function categorizeReason(reason: string): string {
  // Strip any trailing semicolons and whitespace
  const cleanReason = reason.replace(/;+$/, '').trim();
  
  if (cleanReason.includes('ME 2110')) return 'ME 2110';
  if (cleanReason.includes('Personal Project')) return 'Personal Project';
  if (cleanReason.includes('Research Project')) return 'Research Project';
  if (cleanReason.includes('ME Capstone Project')) return 'ME Capstone Project';
  if (cleanReason.includes('VIP')) return 'VIP';
  if (cleanReason.includes('Other Academic Course')) return 'Other Academic Course';
  if (cleanReason.includes('Project for Club/Lab/Other Org')) return 'Club/Lab/Org Project';
  if (cleanReason.includes('Training/Studio Improvement')) return 'Training/Studio Improvement';
  if (cleanReason.includes('ME 1670')) return 'ME 1670';
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
    
    // Debug: Log exact dates being used
    console.log('Using date range:', { from, to });
    
    const reportData = await getCustomReport(session, from, to);
    
    // Debug: Log data structure
    console.log('Report data structure:', {
      length: reportData.length,
      sampleRow: reportData[2],
      columns: reportData[0]
    });
    
    const commonReasons = aggregateReasons(reportData);
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