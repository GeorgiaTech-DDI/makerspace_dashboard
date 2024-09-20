// app/api/printers/route.ts
import { NextResponse } from 'next/server';

// Function to login and get session
async function loginAndGetSession() {
  const loginUrl = "https://cloud.3dprinteros.com/apiglobal/login";
  const username = "sa-vipvx4@gatech.edu";
  const password = "u%Ew$6pB!k2cgT";

  const response = await fetch(loginUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      'username': username,
      'password': password,
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Authentication failed');
  }

  return data.message.session;
}

// Function to get organization printers using session
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

  return data.message;
}

// GET request handler
export async function GET() {
  try {
    // Step 1: Authenticate and get session
    const session = await loginAndGetSession();

    // Step 2: Fetch printers using session
    const printers = await getOrganizationPrinters(session);

    // Return printers as JSON
    return NextResponse.json(printers);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
