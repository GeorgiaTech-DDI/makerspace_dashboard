import { NextRequest, NextResponse } from "next/server";

interface UserSession {
  Name: string;
  EndDateTime?: string;
  StartDateTime: string;
}

interface DownTime {
  EndDateTime: string;
  StartDateTime: string;
}

interface Usage {
  InUseBy: UserSession[];
  ToolName?: string;
}

interface ToolUsageResponse {
  DownList: DownTime[];
  UsageList: Usage[];
}

function getCurrentTime(): Date {
  return new Date();
}

function isWithinOperatingHours(date: Date): boolean {
  return true; // from feedback, just display hub data

  const atlantaDate = new Date(
    date.toLocaleString("en-US", { timeZone: "America/New_York" }),
  );
  const hours = atlantaDate.getHours();
  const minutes = atlantaDate.getMinutes();
  const day = atlantaDate.getDay();

  const timeAsDecimal = hours + minutes / 60;

  if (day === 0 || day === 6) return false;

  if (timeAsDecimal >= 9 && timeAsDecimal <= 18) return true;

  if (day >= 1 && day <= 4 && timeAsDecimal >= 17 && timeAsDecimal <= 19)
    return true;

  return false;
}

async function getToolUsages(token: string) {
  const [egKey, egId] = token.split(":");

  // Get current date in Atlanta timezone
  const atlantaDate = new Date().toLocaleString("en-US", {
    timeZone: "America/New_York",
  });
  const date = new Date(atlantaDate);

  // Format date as YYYY-MM-DD
  const today =
    date.getFullYear() +
    "-" +
    String(date.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(date.getDate()).padStart(2, "0");

  const toolUsageUrl = `https://sums.gatech.edu/SUMS_React_Shift_Scheduler/rest/EGInfo/IndividualToolUsages?EGKey=${egKey}&EGId=${egId}&StartDate=${today}&EndDate=${today}`;

  try {
    const response = await fetch(toolUsageUrl);

    if (!response.ok) {
      let errorDetail;
      try {
        errorDetail = await response.text();
      } catch (e) {
        errorDetail = "Could not read error response";
      }
      throw new Error(
        `Failed to fetch tool usages: ${response.status} ${response.statusText}. Details: ${errorDetail}`,
      );
    }

    const data = await response.json();
    // console.log('Successfully parsed response data');
    // console.log('Response structure:', {
    //   hasDownList: !!data.DownList,
    //   hasUsageList: !!data.UsageList,
    //   usageListLength: data.UsageList?.length
    // });

    return data;
  } catch (error) {
    console.error("Error in getToolUsages");
    throw error;
  }
}

function getActiveUsers(
  users: UserSession[] | null | undefined,
): UserSession[] {
  console.log("Processing users:", {
    receivedUsers: !!users,
    userCount: users?.length,
  });

  if (!users || !Array.isArray(users)) {
    console.log("No valid users array provided");
    return [];
  }

  const now = getCurrentTime();

  return users.filter((user) => {
    if (!user || !user.StartDateTime) {
      console.log("Skipping invalid user entry:", user);
      return false;
    }

    try {
      const startTime = new Date(user.StartDateTime);
      const endTime = user.EndDateTime ? new Date(user.EndDateTime) : null;

      if (isNaN(startTime.getTime())) {
        // console.log('Invalid start time for user:', user.Name);
        return false;
      }
      if (endTime && isNaN(endTime.getTime())) {
        // console.log('Invalid end time for user:', user.Name);
        return false;
      }

      if (endTime) {
        const isActive = startTime <= now && endTime > now;
        // console.log('User with end time:', {
        //   name: user.Name,
        //   isActive,
        //   startTime: startTime.toISOString(),
        //   endTime: endTime.toISOString()
        // });
        return isActive;
      }

      const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);
      const isCurrentSession = startTime <= now && startTime >= twelveHoursAgo;
      const isWithinHours = isWithinOperatingHours(now);

      // console.log('User without end time:', {
      //   name: user.Name,
      //   isCurrentSession,
      //   isWithinHours,
      //   startTime: startTime.toISOString()
      // });

      return isCurrentSession && isWithinHours;
    } catch (error) {
      console.error("Error processing user session:");
      return false;
    }
  });
}

export async function GET(request: NextRequest) {
  try {
    // console.log('Received GET request');

    const token = request.headers.get("x-sums-token");
    if (!token) {
      console.log("No token provided in headers");
      throw new Error("SUMS token is not provided");
    }

    const toolUsages: ToolUsageResponse = await getToolUsages(token);

    const hubLoginUsage = toolUsages.UsageList.find(
      (usage: Usage) => usage.ToolName === "Hub Login",
    );

    if (!hubLoginUsage) {
      console.log("Hub Login tool not found in UsageList");
      return NextResponse.json({
        current_capacity: 0,
        active_users: [],
        message: "Hub Login tool not found in tool usages",
      });
    }

    const activeUsers = getActiveUsers(hubLoginUsage.InUseBy);
    const numberOfUsers = activeUsers.length;

    return NextResponse.json({
      current_capacity: numberOfUsers,
      active_users: activeUsers.map((user) => ({
        name: user.Name,
        start_time: user.StartDateTime,
        end_time: user.EndDateTime || null,
      })),
    });
  } catch (error: any) {
    console.error("Error in GET request:", {
      message: error.message,
      stack: error.stack,
    });

    return NextResponse.json(
      {
        error: error.message,
        current_capacity: 0,
        active_users: [],
      },
      { status: 500 },
    );
  }
}
