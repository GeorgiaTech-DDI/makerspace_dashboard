import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon } from "lucide-react";

const EquipmentUsageCard = () => {
  const [data, setData] = useState<{
    currentHours: string;
    previousHours: string;
    percentChange: string;
    currentDayHours: string;
    trend: number[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/SUMS/tool_usages?mode=trend");
        if (!response.ok) throw new Error("Failed to fetch usage data");
        const jsonData = await response.json();
        setData(jsonData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading || !data) {
    // Loading state with pulsing animation
    return (
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Equipment Usage Hours
          </CardTitle>
          <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex flex-col space-y-1">
              <div className="h-8 w-20 bg-muted rounded animate-pulse" />
              <div className="h-4 w-16 bg-muted rounded animate-pulse" />
              <div className="h-3 w-32 bg-muted rounded animate-pulse" />
            </div>
            <div className="h-[60px] w-[50%] ml-4 flex items-end justify-between">
              {[...Array(7)].map((_, index) => (
                <div
                  key={index}
                  className="w-[8%] h-8 bg-muted animate-pulse"
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Equipment Usage Hours
          </CardTitle>
          <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="pb-2">
          <div className="text-red-500">Error loading data</div>
        </CardContent>
      </Card>
    );
  }

  const isPositive = data.percentChange.startsWith("+");

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Equipment Usage Hours
        </CardTitle>
        <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex flex-col space-y-1">
            <div className="text-3xl font-bold">
              {parseFloat(data.currentHours).toFixed(1)}
            </div>
            <div
              className={`text-sm font-medium ${
                isPositive ? "text-green-500" : "text-red-500"
              }`}
            >
              {isPositive ? (
                <ArrowUpIcon className="inline h-4 w-4" />
              ) : (
                <ArrowDownIcon className="inline h-4 w-4" />
              )}
              {data.percentChange}
            </div>
            <p className="text-xs text-muted-foreground">
              compared to same day last month
            </p>
          </div>
          <div className="h-[60px] w-[50%] ml-4">
            <TrendChart data={data.trend} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

function TrendChart({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;

  return (
    <div className="flex items-end justify-between h-full w-full">
      {data.map((value, index) => (
        <div
          key={index}
          className="bg-primary w-[8%]"
          style={{
            height: `${((value - min) / range) * 100}%`,
          }}
        />
      ))}
    </div>
  );
}

export default EquipmentUsageCard;
