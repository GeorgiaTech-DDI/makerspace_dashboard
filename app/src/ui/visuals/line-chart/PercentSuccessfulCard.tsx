"use client";

import { useEffect, useState } from "react";
import LineChartComponent from "./line-chart";

export default function PercentSuccessfulCard() {
  const [period, setPeriod] = useState("day"); // Track whether day or week
  const [dataPoints, setDataPoints] = useState([]); // To store fetched data points
  const [loading, setLoading] = useState(true); // Track loading

  // Helper function to get current date in "YYYY-MM-DD" format
  const getCurrentDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`; // Get the current date
  };

  // Fetch the percent successful data for the last 7 days or weeks
  useEffect(() => {
    async function fetchMetrics() {
      setLoading(true);

      try {
        const currentDate = getCurrentDate(); // Get the current date
        const response = await fetch(
          `/api/3DPOS/jobs?period=${period}&date=${currentDate}`,
          {
            method: "GET",
            headers: {
              "x-printer-session": "your-session-token-here",
            },
          },
        );

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
  );
}
