import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UsageData {
  dayUsageHours: string;
  weekUsageHours: string;
  monthUsageHours: string;
}

const ToolUsageCard = () => {
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsageData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/SUMS/tool_usages");

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch tool usage data");
        }

        const data = await response.json();
        setUsageData(data);
      } catch (error: any) {
        console.error("Error fetching tool usage data:", error);
        setError("Failed to load tool usage data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsageData();

    // Optionally, refresh data every hour
    const interval = setInterval(fetchUsageData, 3600000); // 1 hour in milliseconds

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tool Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (error || !usageData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tool Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">
            {error || "No usage data available for the selected date range."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tool Usage</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {/* for now we're avoiding this */}
          {/* <div>
            <span className="font-bold">Today:</span> {usageData.dayUsageHours} hours
          </div> */}
          <div>
            <span className="font-bold">This Week:</span>{" "}
            {usageData.weekUsageHours} hours
          </div>
          <div>
            <span className="font-bold">This Month:</span>{" "}
            {usageData.monthUsageHours} hours
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ToolUsageCard;
