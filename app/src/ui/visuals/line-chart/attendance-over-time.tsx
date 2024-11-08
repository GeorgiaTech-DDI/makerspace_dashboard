"use client";

import React, { useState, useEffect, useCallback } from "react";
import LineChartComponent from "./line-chart";

interface MonthlyAttendance {
  month: string;
  Attendance: number;
}

const AttendanceOverTimeChart = () => {
  const [attendanceData, setAttendanceData] = useState<MonthlyAttendance[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchAttendanceData = useCallback(async () => {
    try {
      // Set date range for the last 6 months
      const today = new Date();
      const sixMonthsAgo = new Date(today);
      sixMonthsAgo.setMonth(today.getMonth() - 6);

      const from = sixMonthsAgo.toISOString().slice(0, 10); // Format as YYYY-MM-DD
      const to = today.toISOString().slice(0, 10);

      const response = await fetch(
        `/api/SUMS/attendance_over_time?from=${from}&to=${to}`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch attendance data");
      }

      const data = await response.json();
      const monthlyData = aggregateByMonth(data.attendanceData); // Aggregate by month
      setAttendanceData(monthlyData);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
      setError("Failed to load attendance data. Please try again later.");
    }
  }, []);

  // Function to aggregate data by month
  const aggregateByMonth = (
    attendanceData: { date: string; uniqueUsers: number }[],
  ): MonthlyAttendance[] => {
    const monthlyData: Record<string, number> = {};

    attendanceData.forEach(({ date, uniqueUsers }) => {
      const monthKey = date.slice(0, 7); // Format as "YYYY-MM"

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = 0;
      }

      monthlyData[monthKey] += uniqueUsers; // Sum unique users per month
    });

    return Object.keys(monthlyData).map((month) => ({
      month,
      Attendance: monthlyData[month],
    }));
  };

  useEffect(() => {
    fetchAttendanceData();
  }, [fetchAttendanceData]);

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <LineChartComponent
      title="Attendance Over Last 6 Months"
      data={attendanceData}
      xAxisKey="month" // Updated to match aggregated data
      yAxisKey="Attendance"
      strokeColor="#B3A369" // GT Gold
      fillColor="rgba(0, 37, 76, 0.5)" // GT Navy
    />
  );
};

export default AttendanceOverTimeChart;
