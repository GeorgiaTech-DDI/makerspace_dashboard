"use client";

import React, { useState, useEffect } from "react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Settings2, ChevronUp, ChevronDown } from "lucide-react";
import { useForm } from "react-hook-form";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { GripVertical } from "lucide-react";
import {
  BarChart,
  LineChart,
  PieChart,
  Bar,
  Line,
  Pie,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

import Sidebar from "../src/ui/navigation/sidebar";
import ToolStatusListView from "../src/ui/visuals/list-views/list-view-tool-status";
import PrinterStatusListView from "../src/ui/visuals/list-views/list-view-printer-status";
import JobLeaderboardPodium from "../src/ui/visuals/leaderboard/leaderboard";
import PrinterJobCounts from "../src/ui/visuals/job-counts/printerjobcounts";
import BarChartAvgPrintTime from "../src/ui/visuals/bar-charts/bar-chart-avg-print-time";
import PercentSuccessfulCard from "./PercentSuccessfulCard";
import MostCommonReasonCard from "../src/ui/visuals/pie-chart/MostCommonReasonCard";
import EquipmentUsageCard from "../src/ui/visuals/header-visuals/equipment-usage";
import MetricCard from "../src/ui/visuals/metric-cards/metric-card";
import CurrentCapacity from "../src/ui/visuals/metric-cards/current-capacity";
import AttendanceDataCard from "../src/ui/visuals/line-chart/attendance-over-time";

// Sample metric data
const metricData = [
  {
    title: "Active Users",
    value: "580",
    change: "+12%",
    description:
      "The number of active users has increased this month as more students are engaging in projects and workshops.",
    trend: [5, 7, 6, 10, 8, 9, 11, 11],
  },
  {
    title: "New Students",
    value: "150",
    change: "+25%",
    description:
      "A significant influx of new students joined the makerspace, driven by campus-wide promotion and introductory workshops.",
    trend: [3, 8, 5, 9, 7, 6, 10, 8],
  },
];

// Component registry - add new components here
const componentRegistry = {
  toolStatus: {
    id: "toolStatus",
    label: "Tool Status List",
    component: ToolStatusListView,
    defaultSize: "half",
  },
  printerStatus: {
    id: "printerStatus",
    label: "Printer Status List",
    component: PrinterStatusListView,
    defaultSize: "half",
  },
  leaderboard: {
    id: "leaderboard",
    label: "Job Leaderboard",
    component: JobLeaderboardPodium,
    defaultSize: "half",
  },
  jobCounts: {
    id: "jobCounts",
    label: "Printer Job Counts",
    component: PrinterJobCounts,
    defaultSize: "half",
  },
  commonReasons: {
    id: "commonReasons",
    label: "Most Common Reasons",
    component: MostCommonReasonCard,
    defaultSize: "half",
  },
  attendance: {
    id: "attendance",
    label: "Attendance Over Time",
    component: AttendanceDataCard,
    defaultSize: "half",
  },
  printTime: {
    id: "printTime",
    label: "Average Print Time",
    component: BarChartAvgPrintTime,
    defaultSize: "full",
  },
  percentSuccess: {
    id: "percentSuccess",
    label: "Success Rate",
    component: PercentSuccessfulCard,
    defaultSize: "full",
  },
};

const DynamicDashboard = () => {
  const [isMounted, setIsMounted] = useState(false);

  // Load saved preferences from localStorage on initial render
  const loadSavedPreferences = () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("dashboardPreferences");
      if (saved) {
        try {
          const { selectedComponents, componentOrder } = JSON.parse(saved);
          return {
            selectedComponents:
              selectedComponents || Object.keys(componentRegistry),
            componentOrder: componentOrder || Object.keys(componentRegistry),
          };
        } catch (e) {
          console.error("Error loading saved preferences:", e);
        }
      }
    }
    // Default order that matches the server-side render
    return {
      selectedComponents: Object.keys(componentRegistry),
      componentOrder: Object.keys(componentRegistry),
    };
  };

  const [selectedComponents, setSelectedComponents] = useState(
    Object.keys(componentRegistry), // Start with default order for SSR
  );
  const [componentOrder, setComponentOrder] = useState(
    Object.keys(componentRegistry), // Start with default order for SSR
  );

  // Initialize form with default values
  const form = useForm({
    defaultValues: {
      components: Object.keys(componentRegistry), // Start with default order for SSR
    },
  });

  // Load preferences after mount
  useEffect(() => {
    const { selectedComponents: savedSelected, componentOrder: savedOrder } =
      loadSavedPreferences();
    setSelectedComponents(savedSelected);
    setComponentOrder(savedOrder);
    form.reset({ components: savedSelected });
    setIsMounted(true);
  }, []);

  // Save preferences to localStorage whenever they change
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(
        "dashboardPreferences",
        JSON.stringify({
          selectedComponents,
          componentOrder,
        }),
      );
    }
  }, [selectedComponents, componentOrder, isMounted]);

  const handleSettingsSubmit = (data) => {
    setSelectedComponents(data.components);
  };

  const moveComponent = (fromIndex: number, toIndex: number) => {
    const newOrder = [...componentOrder];
    const [moved] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, moved);
    setComponentOrder(newOrder);
  };

  const renderComponents = () => {
    // If not mounted yet, render in default order to match SSR
    const orderToUse = isMounted
      ? componentOrder
      : Object.keys(componentRegistry);
    const selectedToUse = isMounted
      ? selectedComponents
      : Object.keys(componentRegistry);

    const fullWidthComponents = [];
    const halfWidthComponents = [];

    orderToUse.forEach((componentId) => {
      if (!selectedToUse.includes(componentId)) return;

      const config = componentRegistry[componentId];
      if (config.defaultSize === "full") {
        fullWidthComponents.push(config);
      } else {
        halfWidthComponents.push(config);
      }
    });

    return (
      <>
        <div className="grid md:grid-cols-2 gap-4">
          {halfWidthComponents.map((config) => {
            const Component = config.component;
            return (
              <div key={config.id} className="transition-opacity duration-200">
                <Component />
              </div>
            );
          })}
        </div>
        <div className="space-y-4">
          {fullWidthComponents.map((config) => {
            const Component = config.component;
            return (
              <div key={config.id} className="transition-opacity duration-200">
                <Component />
              </div>
            );
          })}
        </div>
      </>
    );
  };

  return (
    <TooltipProvider>
      <div className="grid h-screen w-full pl-[56px]">
        <Sidebar />
        <div className="flex flex-col">
          <header className="sticky top-0 z-10 flex h-[57px] items-center gap-1 border-b bg-background px-4">
            <h1 className="text-xl font-semibold flex-1">
              Georgia Tech Invention Studio Dashboard
            </h1>
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings2 className="h-5 w-5" />
                </Button>
              </DrawerTrigger>
              <DrawerContent className="bg-background">
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" />
                <div className="relative mx-auto w-full max-w-2xl bg-background">
                  <DrawerHeader>
                    <DrawerTitle>Dashboard Settings</DrawerTitle>
                    <DrawerDescription>
                      Choose which components to display and arrange their
                      order.
                    </DrawerDescription>
                  </DrawerHeader>

                  <div className="p-4">
                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(handleSettingsSubmit)}
                        className="space-y-4"
                      >
                        <div className="space-y-2">
                          {componentOrder.map((id, index) => (
                            <div
                              key={id}
                              className="flex items-center space-x-4 p-3 rounded-lg border bg-card"
                            >
                              <FormField
                                control={form.control}
                                name="components"
                                render={({ field }) => (
                                  <FormItem className="flex flex-1 items-center space-x-2">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(id)}
                                        onCheckedChange={(checked) => {
                                          if (checked) {
                                            field.onChange([
                                              ...field.value,
                                              id,
                                            ]);
                                          } else {
                                            field.onChange(
                                              field.value?.filter(
                                                (v) => v !== id,
                                              ),
                                            );
                                          }
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-normal flex-1">
                                      {componentRegistry[id].label}
                                    </FormLabel>
                                  </FormItem>
                                )}
                              />
                              <div className="flex space-x-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  disabled={index === 0}
                                  onClick={() =>
                                    moveComponent(index, index - 1)
                                  }
                                >
                                  <ChevronUp className="h-4 w-4" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  disabled={index === componentOrder.length - 1}
                                  onClick={() =>
                                    moveComponent(index, index + 1)
                                  }
                                >
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>

                        <DrawerFooter className="px-0">
                          <Button type="submit">Save Changes</Button>
                          <DrawerClose asChild>
                            <Button variant="outline">Cancel</Button>
                          </DrawerClose>
                        </DrawerFooter>
                      </form>
                    </Form>
                  </div>
                </div>
              </DrawerContent>
            </Drawer>
          </header>

          <main className="flex-1 p-4 space-y-4">
            {/* Fixed metric cards row */}
            <div className="grid md:grid-cols-4 gap-4">
              <EquipmentUsageCard />
              {metricData.map((metric, index) => (
                <MetricCard
                  key={index}
                  title={metric.title}
                  value={parseInt(metric.value)}
                  change={metric.change}
                  trend={metric.trend}
                />
              ))}
              <CurrentCapacity />
            </div>

            {/* Dynamic components */}
            {renderComponents()}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default DynamicDashboard;
