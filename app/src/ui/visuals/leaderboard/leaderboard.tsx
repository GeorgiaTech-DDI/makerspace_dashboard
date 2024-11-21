import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils"; // Utility for joining class names

interface LeaderboardEntry {
  email: string;
  firstname: string;
  lastname: string;
  count: number;
}

const JobLeaderboardPodium = () => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(
    [],
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/3DPOS/leaderboard", {
          headers: { "x-printer-session": "your-session-key" },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch leaderboard data");
        }

        const data = await response.json();
        setLeaderboardData(data.leaderboard);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      }
    };

    fetchData();
  }, []);

  // Get valid top entries and others
  const topThree = leaderboardData.slice(0, 3);
  const others = leaderboardData.slice(3);

  return (
    <div className="p-4 border rounded-lg shadow max-h-96 overflow-y-auto">
      <h3 className="text-lg font-semibold mb-4">Job Leaderboard</h3>
      {error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <>
          {/* Podium View for Top 3 */}
          <div className="flex justify-center space-x-4 mb-8">
            {topThree.map((entry, index) => (
              <div
                key={index}
                className={cn(
                  "flex flex-col items-center p-4 w-40 h-40 rounded-lg shadow-md", // Same size for all
                  index === 0
                    ? "bg-yellow-200 text-black"
                    : index === 1
                      ? "bg-gray-200 text-black"
                      : "bg-orange-200 text-black", // Lighter colors and black text
                )}
              >
                <p className="text-lg font-bold text-center mb-auto">
                  {" "}
                  {/* Aligned toward the top */}
                  {index + 1}. {entry.firstname} {entry.lastname}
                </p>
                <p className="text-sm font-medium">Jobs: {entry.count}</p>
              </div>
            ))}
          </div>

          {/* Regular Leaderboard for Others */}
          <div className="grid grid-cols-1 gap-4">
            {others.map((entry, index) => (
              <Card 
                key={entry.email} 
                className="p-4 shadow-md border flex justify-between items-center"
              >
                <CardHeader>
                  <CardTitle>
                    {index + 4}. {entry.firstname} {entry.lastname}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium">
                    Jobs Completed: {entry.count}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default JobLeaderboardPodium;