"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { Loader2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface PrinterData {
  printerId: string;
  printerName: string;
  averagePrintTime: string;
}

interface ChartData {
  printerName: string;
  displayName: string;
  [key: string]: string | number;
}

const chartConfig = {
  averagePrintTime: {
    label: "Average Print Time",
  },
} satisfies ChartConfig;

const formatPrinterName = (fullName: string): string => {
  const parts = fullName.split("|");
  if (parts.length > 1) {
    return parts[1].trim();
  }
  return fullName;
};

export function BarChartAvgPrintTime() {
  const [chartData, setChartData] = React.useState<ChartData[]>([]);
  const [activeMonth, setActiveMonth] = React.useState<string>("");
  const [months, setMonths] = React.useState<string[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchData = React.useCallback(async (from: string, to: string) => {
    try {
      const response = await fetch(
        `/api/3DPOS/average-print-time?from=${from}&to=${to}`,
        {
          headers: {
            "x-printer-session": "YOUR_SESSION_TOKEN", // Replace with your actual session token
          },
        },
      );
      if (!response.ok) {
        throw new Error("Failed to fetch average print time data");
      }
      const data: PrinterData[] = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching average print time data:", error);
      setError(
        "Failed to load average print time data. Please try again later.",
      );
      return [];
    }
  }, []);

  React.useEffect(() => {
    const getLastThreeMonths = () => {
      const result = [];
      const today = new Date();
      for (let i = 2; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        result.push(date.toISOString().slice(0, 7)); // YYYY-MM format
      }
      return result;
    };

    const fetchAllData = async () => {
      setIsLoading(true);
      const threeMonths = getLastThreeMonths();
      setMonths(threeMonths);
      setActiveMonth(threeMonths[2]); // Set the most recent month as active

      const allData: { [key: string]: PrinterData[] } = {};

      for (const month of threeMonths) {
        const fromDate = `${month}-01`;

        let toDate = new Date(month);
        toDate.setMonth(toDate.getMonth() + 1);
        toDate.setDate(0); // Last day of the month

        // Ensure toDate is not in the future
        const today = new Date();
        if (toDate > today) {
          toDate = today;
        }

        const data = await fetchData(
          fromDate,
          toDate.toISOString().slice(0, 10),
        );
        allData[month] = data;
      }

      // Combine data from all months
      const combinedData: ChartData[] = [];

      threeMonths.forEach((month) => {
        allData[month].forEach((printer) => {
          let existingPrinter = combinedData.find(
            (p) => p.printerName === printer.printerName,
          );
          if (!existingPrinter) {
            existingPrinter = {
              printerName: printer.printerName,
              displayName: formatPrinterName(printer.printerName),
              [threeMonths[0]]: 0,
              [threeMonths[1]]: 0,
              [threeMonths[2]]: 0,
            };
            combinedData.push(existingPrinter);
          }
          existingPrinter[month] = parseFloat(printer.averagePrintTime);
        });
      });

      setChartData(combinedData);
      setIsLoading(false);
    };

    fetchAllData();
  }, [fetchData]);

  const filteredChartData = React.useMemo(() => {
    return chartData.filter((printer) => printer[activeMonth] > 0);
  }, [chartData, activeMonth]);

  const total = React.useMemo(() => {
    return months.reduce(
      (acc, month) => {
        const monthData = chartData.filter((printer) => printer[month] > 0);
        const monthSum = monthData.reduce(
          (sum, printer) => sum + ((printer[month] as number) || 0),
          0,
        );
        const printerCount = monthData.length;
        acc[month] = printerCount > 0 ? monthSum / printerCount : 0;
        return acc;
      },
      {} as { [key: string]: number },
    );
  }, [chartData, months]);

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Average Print Time - Last 3 Months (minutes)</CardTitle>
          <CardDescription>
            Showing average print times for active printers
          </CardDescription>
        </div>
        <div className="flex">
          {months.map((month) => (
            <button
              key={month}
              data-active={activeMonth === month}
              className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
              onClick={() => setActiveMonth(month)}
            >
              <span className="text-xs text-muted-foreground">
                {new Date(month).toLocaleString("default", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <span className="text-lg font-bold leading-none sm:text-3xl">
                {total[month].toFixed(2)}
              </span>
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        {isLoading ? (
          <div className="flex h-[300px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[300px] w-full"
          >
            <BarChart
              data={filteredChartData}
              margin={{
                left: 12,
                right: 12,
                bottom: 36,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="displayName"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                interval={0}
                tick={{ fontSize: 10, angle: -45, textAnchor: "end" } as any}
              />
              <ChartTooltip
                content={({ active, payload }) =>
                  active && payload?.length ? (
                    <ChartTooltipContent
                      className="w-[200px]"
                      items={[
                        {
                          label: "Printer",
                          value: payload[0].payload.printerName,
                        },
                        {
                          label: "Average Print Time",
                          value: `${payload[0].value} minutes`,
                        },
                      ]}
                    />
                  ) : null
                }
              />
              <Bar dataKey={activeMonth} fill="#B3A369" />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

export default BarChartAvgPrintTime;
