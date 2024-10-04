"use client";

import { useEffect, useState } from "react";
import Sidebar from "../src/ui/navigation/sidebar";
import LineChartComponent from "../src/ui/visuals/line-chart/line-chart"; // Import the LineChartComponent
import { TooltipProvider } from "@radix-ui/react-tooltip";
import ToolStatusListView from "../src/ui/visuals/list-views/list-view-tool-status";
import PrinterStatusListView from "../src/ui/visuals/list-views/list-view-printer-status";
import MetricCard from "../src/ui/visuals/metric-cards/metric-card";
import IdlePrintersCard from "../src/ui/visuals/metric-cards/idle-printers";

export default function Dashboard() {
  const [period, setPeriod] = useState("day"); // Track whether day or week
  const [dataPoints, setDataPoints] = useState([]); // To store fetched data points
  const [loading, setLoading] = useState(true); // Track loading

  // Helper function to get current date in "YYYY-MM-DD" format
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Month is zero-indexed
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Fetch the percent successful data for the last 7 days or weeks
  useEffect(() => {
    async function fetchMetrics() {
      setLoading(true);

      try {
        const currentDate = getCurrentDate(); // Get the current date
        const response = await fetch(`/api/3DPOS/jobs?period=${period}&date=${currentDate}`, {
          method: "GET",
          headers: {
            "x-printer-session": "your-session-token-here", // Ensure the correct session token is passed
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const metricsArray = await response.json(); // The array of data points
        const formattedData = metricsArray.map((item) => ({
          date: item.period,
          percentSuccessful: parseFloat(item.percentSuccessful),
        }));
        setDataPoints(formattedData); // Save the fetched data to state
      } catch (error) {
        console.error("Error fetching metrics:", error);
      }

      setLoading(false);
    }

    fetchMetrics();
  }, [period]); // Re-fetch whenever the period (day/week) changes

  return (
    <TooltipProvider>
      <div className="grid h-screen w-full pl-[56px]">
        <Sidebar />
        <div className="flex flex-col">
          <header className="sticky top-0 z-10 flex h-[57px] items-center gap-1 border-b bg-background px-4">
            <h1 className="text-xl font-semibold">Georgia Tech Invention Studio Dashboard</h1>
          </header>

          {/* First Row: Metric Cards */}
          <div className="grid md:grid-cols-4 gap-4">
            <MetricCard
              title="Equipment Usage"
              value={85}
              change="-5%"
              trend={[4, 6, 5, 8, 7, 9, 6, 1]}
            />
            <MetricCard
              title="Active Users"
              value={580}
              change="+12%"
              trend={[5, 7, 6, 10, 8, 9, 11, 11]}
            />
            <MetricCard
              title="New Students"
              value={150}
              change="+25%"
              trend={[3, 8, 5, 9, 7, 6, 10, 8]}
            />
            <IdlePrintersCard />
          </div>

          {/* Second Row: List views */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ToolStatusListView />
            <PrinterStatusListView />
          </div>

          {/* Third Row: Line Chart for Percent Successful */}
          <div className="p-4 border rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">
              Percent Successful over the Last 7 {period === "day" ? "Days" : "Weeks"}
            </h3>

            {/* Dropdown to switch between days and weeks */}
            <div className="mb-4">
              <label className="mr-4">Select Period: </label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="border p-2 rounded"
              >
                <option value="day">Last 7 Days</option>
                <option value="week">Last 7 Weeks</option>
              </select>
            </div>

            {loading ? (
              <p>Loading...</p>
            ) : (
              <LineChartComponent
                title={`Percent Successful for Last 7 ${period === "day" ? "Days" : "Weeks"}`}
                data={dataPoints} // The actual data fetched
                xAxisKey="date" // For days or weeks
                yAxisKey="percentSuccessful" // For percent success rate
              />
            )}
          </div>    
        </div>
      </div>
    </TooltipProvider>
  );
}
