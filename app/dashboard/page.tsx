"use client"

import Sidebar from "../src/ui/navigation/sidebar"
import { TooltipProvider } from "@radix-ui/react-tooltip"
import MetricCard from "../src/ui/visuals/metric-card"
import LineChartComponent from '../src/ui/visuals/line-chart';
import ToolStatusListView from "../src/ui/visuals/list-view-tool-status"

export default function Dashboard() {
  const metricData = [
    {
      title: "Equipment Usage",
      value: "85%",
      change: "-5%",
      description: "The equipment usage percentage has decreased slightly this month due to scheduled maintenance and equipment upgrades.",
      trend: [4, 6, 5, 8, 7, 9, 6, 1] // Randomized trend data
    },
    {
      title: "Active Users",
      value: "580",
      change: "+12%",
      description: "The number of active users has increased this month as more students are engaging in projects and workshops.",
      trend: [5, 7, 6, 10, 8, 9, 11, 11] // Randomized trend data
    },
    {
      title: "New Students",
      value: "150",
      change: "+25%",
      description: "A significant influx of new students joined the makerspace, driven by campus-wide promotion and introductory workshops.",
      trend: [3, 8, 5, 9, 7, 6, 10, 8] // Randomized trend data
    },
    {
      title: "Active PIs (Provisional Instructors)",
      value: "32",
      change: "+8%",
      description: "The number of active provisional instructors has grown due to increased demand for guided projects and workshops.",
      trend: [4, 5, 6, 8, 7, 9, 6, 4] // Randomized trend data
    }
  ];

  
  const attendanceData = [
    { month: 'Jan', attendance: 65 },
    { month: 'Feb', attendance: 59 },
    { month: 'Mar', attendance: 80 },
    { month: 'Apr', attendance: 81 },
    { month: 'May', attendance: 56 },
    { month: 'Jun', attendance: 55 },
    { month: 'Jul', attendance: 40 },
    { month: 'Aug', attendance: 60 },
    { month: 'Sep', attendance: 42 },
    { month: 'Oct', attendance: 56 },
    { month: 'Nov', attendance: 71 },
    { month: 'Dec', attendance: 39 },
  ];

  const toolUsageData = [
    { week: 'Sun', UsageHours: 2 },
    { week: 'Mon', UsageHours: 4 },
    { week: 'Tue', UsageHours: 6 },
    { week: 'Wed', UsageHours: 3 },
    { week: 'Thu', UsageHours: 8 },
    { week: 'Fri', UsageHours: 5 },
    { week: 'Sat', UsageHours: 7 },
  ];

  return (
    <TooltipProvider>
      <div className="grid h-screen w-full pl-[56px]">
        <Sidebar />
        <div className="flex flex-col">
          <header className="sticky top-0 z-10 flex h-[57px] items-center gap-1 border-b bg-background px-4">
            <h1 className="text-xl font-semibold">Georgia Tech Invention Studio Dashboard</h1>
          </header>

          <main className="flex-1 p-4 space-y-4">
            {/* First Row: Evenly spaced metric cards with 30% height */}
            <div className="grid md:grid-cols-4 gap-4">
            {metricData.map((metric, index) => (
      <MetricCard
        key={index}
        title={metric.title}
        value={metric.value}
        change={metric.change}
        trend={metric.trend} // Example trend data, you can replace with dynamic data
      />
    ))}

      </div>
        {/* Second Row: Data graphs with 70% height */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

      <LineChartComponent
        title="Attendance Over the Month"
        data={attendanceData}
        xAxisKey="month"
        yAxisKey="attendance"
        // strokeColor is default to GT Gold
        // fillColor is default to GT Navy
      />

      <LineChartComponent
        title="Tool Usage Over the Week"
        data={toolUsageData}
        xAxisKey="week"
        yAxisKey="UsageHours"
        // strokeColor is default to GT Gold
        // fillColor is default to GT Navy
      />

  {/* Table */}
  <ToolStatusListView/>

         </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}
