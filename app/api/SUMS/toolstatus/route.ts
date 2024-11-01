import { NextRequest, NextResponse } from "next/server";

async function getToolStatus(token: string) {
  const [egKey, egId] = token.split(":");
  const toolStatusUrl = `https://sums.gatech.edu/SUMS_React_Shift_Scheduler/rest/EGInfo/ToolStatus?EGKey=${egKey}&EGId=${egId}`;

  const response = await fetch(toolStatusUrl);

  if (!response.ok) {
    throw new Error("Failed to fetch tool status");
  }

  return response.json();
}

export async function GET(request: NextRequest) {
  try {
    // Step 1: Get token from header
    const token = request.headers.get("x-sums-token");
    if (!token) {
      throw new Error("SUMS token is not provided");
    }

    // Step 2: Fetch tool status using token
    const toolStatus = await getToolStatus(token);

    // Return tool status as JSON
    return NextResponse.json(toolStatus);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
