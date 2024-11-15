import { NextRequest, NextResponse } from "next/server";

interface UserSession {
  Name: string;
  EndDateTime?: string;
  StartDateTime: string;
}

interface Usage {
  InUseBy: UserSession[];
  ToolName?: string;
}

interface ToolUsageResponse {
  UsageList: Usage[];
}

interface CacheEntry {
  data: any;
  timestamp: number;
}

// Cache configuration
const CACHE_TTL = 1000 * 60 * 30; // 30 minutes
const cache: Map<string, CacheEntry> = new Map();

// Semester date ranges
const SEMESTERS = {
  SPRING: { startMonth: 0, endMonth: 4 }, // Jan - May
  SUMMER: { startMonth: 4, endMonth: 7 }, // May - Aug
  FALL: { startMonth: 7, endMonth: 11 }, // Aug - Dec
};

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getCurrentSemester(date: Date): { type: string; year: number } {
  const month = date.getMonth();
  const year = date.getFullYear();

  if (month >= SEMESTERS.SPRING.startMonth && month <= SEMESTERS.SPRING.endMonth) {
    return { type: 'SPRING', year };
  } else if (month >= SEMESTERS.SUMMER.startMonth && month <= SEMESTERS.SUMMER.endMonth) {
    return { type: 'SUMMER', year };
  } else if (month >= SEMESTERS.FALL.startMonth && month <= SEMESTERS.FALL.endMonth) {
    return { type: 'FALL', year };
  } else {
    return { type: 'SPRING', year: year + 1 };
  }
}

function getSemesterDateRange(semester: { type: string; year: number }) {
  const semesterDates = SEMESTERS[semester.type as keyof typeof SEMESTERS];
  return {
    start: new Date(semester.year, semesterDates.startMonth, 1),
    end: new Date(semester.year, semesterDates.endMonth + 1, 0),
  };
}

async function getToolUsages(token: string, startDate: string, endDate: string) {
  const [egKey, egId] = token.split(":");
  const toolUsageUrl = `https://sums.gatech.edu/SUMS_React_Shift_Scheduler/rest/EGInfo/IndividualToolUsages?EGKey=${egKey}&EGId=${egId}&StartDate=${startDate}&EndDate=${endDate}`;

  const cacheKey = `${startDate}-${endDate}`;
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const response = await fetch(toolUsageUrl);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch tool usages: ${response.status} ${response.statusText}`
      );
    }
    const data = await response.json();
    
    // Cache the result
    cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });
    
    return data;
  } catch (error) {
    console.error("Error in getToolUsages:", error);
    throw error;
  }
}

function getNewUsers(currentUsers: Set<string>, previousUsers: Set<string>): number {
  const newUsers = new Set(
    [...currentUsers].filter(user => !previousUsers.has(user))
  );
  return newUsers.size;
}

function extractUniqueUsers(data: ToolUsageResponse): Set<string> {
  const users = new Set<string>();
  const hubLoginUsage = data.UsageList.find(u => u.ToolName === "Hub Login");
  
  if (hubLoginUsage?.InUseBy) {
    hubLoginUsage.InUseBy.forEach(user => {
      if (user.Name && user.StartDateTime) {
        users.add(user.Name);
      }
    });
  }
  
  return users;
}

export const dynamic = "force-dynamic";
export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("x-sums-token");
    if (!token) {
      throw new Error("SUMS token is not provided");
    }

    const url = new URL(request.url);
    const mode = url.searchParams.get("mode") || "default";
    const today = new Date();
    const adjustedToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - 1
    );

    if (mode === "trend") {
      const trendData = [];
      const currentSemester = getCurrentSemester(adjustedToday);
      
      // Get data for last 7 months
      for (let i = 6; i >= 0; i--) {
        const monthStart = new Date(
          adjustedToday.getFullYear(),
          adjustedToday.getMonth() - i,
          1
        );
        const monthEnd = i === 0
          ? adjustedToday
          : new Date(
              adjustedToday.getFullYear(),
              adjustedToday.getMonth() - i + 1,
              0
            );

        // Get current month data
        const currentData = await getToolUsages(
          token,
          formatDate(monthStart),
          formatDate(monthEnd)
        );

        // Get previous semester data for comparison
        const previousSemesterStart = getSemesterDateRange({
          type: currentSemester.type,
          year: currentSemester.year - 1
        }).start;
        
        const previousData = await getToolUsages(
          token,
          formatDate(previousSemesterStart),
          formatDate(monthStart)
        );

        const currentUsers = extractUniqueUsers(currentData);
        const previousUsers = extractUniqueUsers(previousData);
        const newUsersCount = getNewUsers(currentUsers, previousUsers);

        trendData.push(newUsersCount);
      }

      // Calculate current vs previous day comparison
      const previousMonthDate = new Date(adjustedToday);
      previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);

      const [currentDayData, previousMonthDayData] = await Promise.all([
        getToolUsages(token, formatDate(adjustedToday), formatDate(adjustedToday)),
        getToolUsages(token, formatDate(previousMonthDate), formatDate(previousMonthDate))
      ]);

      const currentDayUsers = extractUniqueUsers(currentDayData);
      const previousDayUsers = extractUniqueUsers(previousMonthDayData);
      
      const currentDayNewUsers = getNewUsers(
        currentDayUsers,
        previousDayUsers
      );
      
      const previousDayNewUsers = trendData[trendData.length - 2];
      
      const percentChange = previousDayNewUsers === 0
        ? 0
        : ((currentDayNewUsers - previousDayNewUsers) / previousDayNewUsers) * 100;

      return NextResponse.json({
        currentNewUsers: trendData[trendData.length - 1].toFixed(2),
        previousNewUsers: previousDayNewUsers.toFixed(2),
        percentChange: (percentChange > 0 ? "+" : "") + percentChange.toFixed(1) + "%",
        currentDayNewUsers: currentDayNewUsers.toFixed(2),
        trend: trendData
      });

    } else {
      // Default mode - current semester data
      const currentSemester = getCurrentSemester(adjustedToday);
      const { start: semesterStart } = getSemesterDateRange(currentSemester);
      
      const dayStartDate = formatDate(adjustedToday);
      const dayEndDate = formatDate(adjustedToday);

      const weekStart = new Date(
        adjustedToday.getFullYear(),
        adjustedToday.getMonth(),
        adjustedToday.getDate() - 6,
      );
      const weekStartDate = formatDate(weekStart);
      const weekEndDate = formatDate(adjustedToday);

      const semesterStartDate = formatDate(semesterStart);
      const semesterEndDate = formatDate(adjustedToday);

      // Get previous semester data for comparison
      const previousSemesterStart = getSemesterDateRange({
        type: currentSemester.type,
        year: currentSemester.year - 1
      }).start;
      
      const previousSemesterData = await getToolUsages(
        token,
        formatDate(previousSemesterStart),
        semesterStartDate
      );

      const previousUsers = extractUniqueUsers(previousSemesterData);

      const [dayData, weekData, semesterData] = await Promise.all([
        getToolUsages(token, dayStartDate, dayEndDate),
        getToolUsages(token, weekStartDate, weekEndDate),
        getToolUsages(token, semesterStartDate, semesterEndDate),
      ]);

      const dayUsers = extractUniqueUsers(dayData);
      const weekUsers = extractUniqueUsers(weekData);
      const semesterUsers = extractUniqueUsers(semesterData);

      return NextResponse.json({
        dayNewUsers: getNewUsers(dayUsers, previousUsers),
        weekNewUsers: getNewUsers(weekUsers, previousUsers),
        semesterNewUsers: getNewUsers(semesterUsers, previousUsers),
      });
    }

  } catch (error: any) {
    console.error("Error in GET request:", error);
    return NextResponse.json(
      {
        error: error.message,
        currentNewUsers: "0",
        previousNewUsers: "0",
        percentChange: "0%",
        currentDayNewUsers: "0",
        trend: [0, 0, 0, 0, 0, 0, 0]
      },
      { status: 500 }
    );
  }
}