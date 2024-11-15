"use client";

import * as React from "react";
import { Pie, PieChart, Cell, Tooltip, ResponsiveContainer } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#FF8042", "#0088FE"];

// Configuration for the chart labels
const chartConfig = {
  mostCommonReasons: {
    label: "Most Common Cancellation Reasons",
  },
};

const MostCommonReasonCard = () => {
  const [chartData, setChartData] = React.useState([]);
  const [error, setError] = React.useState(""); // Initialize error as an empty string

  const fetchData = React.useCallback(async () => {
    try {
      const response = await fetch(`/api/3DPOS/most-common-reasons`);
      if (!response.ok) {
        throw new Error("Failed to fetch reasons data");
      }
      const data = await response.json();
      return data.mostCommonReasons;
    } catch (error) {
      console.error("Error fetching reasons data:", error);
      setError("Failed to load reasons data. Please try again later.");
      return [];
    }
  }, []);

  React.useEffect(() => {
    const fetchAllData = async () => {
      const data = await fetchData();
      setChartData(data);
    };

    fetchAllData();
  }, [fetchData]);

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>
            Most Common Cancellation Reasons - Last 3 Months
          </CardTitle>
          <CardDescription>
            Showing the distribution of cancellation reasons
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[300px] w-full"
        >
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="percentage"
                nameKey="reason"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label={({ reason, percentage }) => `${reason}: ${percentage}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default MostCommonReasonCard;
