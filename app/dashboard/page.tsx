"use client"

import Sidebar from "../src/ui/navigation/sidebar"
import {
  BarChart, LineChart, PieChart, Bar, Line, Pie, ResponsiveContainer, XAxis, YAxis,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  CartesianGrid,
  Legend
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table"
import { TooltipProvider } from "@radix-ui/react-tooltip"
import { ArrowUpIcon, ArrowDownIcon, TrendingUpIcon, TrendingDownIcon, Radar } from "lucide-react"
import MetricCard from "../src/ui/visuals/metric-cards/metric-card"
import ToolStatusListView from "../src/ui/visuals/list-views/list-view-tool-status"
import IdlePrintersCard from "../src/ui/visuals/metric-cards/idle-printers"
import PrinterStatusListView from "../src/ui/visuals/list-views/list-view-printer-status"
import CurrentCapacity from "../src/ui/visuals/metric-cards/current-capacity"
import BarChartAvgPrintTime from  "../src/ui/visuals/bar-charts/bar-chart-avg-print-time"
import ToolUsageCard from "../src/ui/visuals/metric-cards/tool-usage-card"
import PercentSuccessfulCard from "./PercentSuccessfulCard"
import MostCommonReasonCard from "../src/ui/visuals/pie-chart/MostCommonReasonCard"

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
  ];

  
  const data = [
    { month: 'Jan', value: 65 },
    { month: 'Feb', value: 59 },
    { month: 'Mar', value: 80 },
    { month: 'Apr', value: 81 },
    { month: 'May', value: 56 },
    { month: 'Jun', value: 55 },
    { month: 'Jul', value: 40 },
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
                  value={parseInt(metric.value)}
                  change={metric.change}
                  trend={metric.trend}
                />
              ))}
              <IdlePrintersCard />

              <ToolUsageCard />

              {/* Include CurrentCapacity component */}
              <CurrentCapacity />

            </div>
  
            {/* Second Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Second Row: List views (ToolStatusListView and PrinterStatusListView) */}
              <ToolStatusListView />
              <PrinterStatusListView />
              {/* Second Row: Most Common Reasons Card */}
            <MostCommonReasonCard />
            </div>
  
            {/* Third Row: Attendance Line Chart */}
            <div className="p-4 border rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Attendance Over Time</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#B3A369" // GT Gold
                    fill="rgba(0, 37, 76, 0.5)" // GT Navy with opacity
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Fourth Row: Average Print Time Bar Chart */}
            <BarChartAvgPrintTime />
              

            {/* Fifth Row: Percent Successful Card */}
            <PercentSuccessfulCard />

          </main>
        </div>
      </div>
    </TooltipProvider>
  )
  
}