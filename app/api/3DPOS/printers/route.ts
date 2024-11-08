// app/api/3DPOS/printers/route.ts
import { NextRequest, NextResponse } from "next/server";

// Function to get organization printers using session
export async function getOrganizationPrinters(session: string) {
  const printerUrl =
    "https://cloud.3dprinteros.com/apiglobal/get_organization_printers_list";

  const response = await fetch(printerUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      session: session,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch printers");
  }

  return data.message;
}


export const dynamic = 'force-dynamic'; // Required because we're using headers
export const runtime = 'edge'; // Optional: Choose edge or nodejs runtime
// GET request handler
export async function GET(request: NextRequest) {
  try {
    // Step 1: Authenticate and get session
    const session = request.headers.get("x-printer-session");
    if (!session) {
      throw new Error("Session is not provided");
    }
    // Step 2: Fetch printers using session
    const printers = await getOrganizationPrinters(session);

    // Return printers as JSON
    return NextResponse.json(printers);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
