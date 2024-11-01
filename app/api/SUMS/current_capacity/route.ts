import { NextRequest, NextResponse } from "next/server";

async function getToolStatus(egKey: string, egId: string) {
  const toolStatusUrl = `https://sums.gatech.edu/SUMS_React_Shift_Scheduler/rest/EGInfo/ToolStatus?EGKey=${egKey}&EGId=${egId}`;

  const response = await fetch(toolStatusUrl);

  if (!response.ok) {
    throw new Error("Failed to fetch tool status");
  }

  return response.json();
}

export async function GET(request: NextRequest) {
  try {
    // Step 1: Get EGKey and EGId from environment variables
    const egKey = process.env.EG_KEY;
    const egId = process.env.EG_ID;

    if (!egKey || !egId) {
      throw new Error("EGKey or EGId is not provided");
    }

    // Step 2: Fetch tool status using EGKey and EGId
    const toolStatus = await getToolStatus(egKey, egId);

    // Step 3: Find the 'Hub Login' tool in the tool status data
    const hubLoginTool = toolStatus.find(
      (tool: any) => tool.ToolName === "Hub Login",
    );

    if (!hubLoginTool) {
      throw new Error("Hub Login tool not found in tool status");
    }

    // Step 4: Extract the number of users from the 'Status' field
    const status = hubLoginTool.Status;
    let numberOfUsers = 0;

    // Check if the status contains 'In use by' and extract the number
    const match = status.match(/In use by (\d+)/);
    if (match) {
      numberOfUsers = parseInt(match[1], 10);
    } else {
      // If the status is not 'In use by', assume zero users
      numberOfUsers = 0;
    }

    // Step 5: Return the number of users as JSON
    return NextResponse.json({ current_capacity: numberOfUsers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
