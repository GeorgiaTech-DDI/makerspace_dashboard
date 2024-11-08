"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "../src/ui/navigation/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Card } from "@/components/ui/card";
import PrinterJobCounts from "../src/ui/visuals/job-counts/printerjobcounts";
import MostCommonReasonCard from "../src/ui/visuals/pie-chart/MostCommonReasonCard";
import AttendanceDataCard from "../src/ui/visuals/line-chart/attendance-over-time";
import BarChartAvgPrintTime from "../src/ui/visuals/bar-charts/bar-chart-avg-print-time";
import PercentSuccessfulCard from "../dashboard/PercentSuccessfulCard";


// Component registry - add new components here
const componentRegistry = {
  jobCounts: {
    id: "jobCounts",
    label: "Printer Job Counts",
    component: PrinterJobCounts,
    defaultSize: "half",
    type: "3DPOS",
  },
  commonReasons: {
    id: "commonReasons",
    label: "Most Common Reasons",
    component: MostCommonReasonCard,
    defaultSize: "half",
    type: "3DPOS",
  },
  attendance: {
    id: "attendance",
    label: "Attendance Over Time",
    component: AttendanceDataCard,
    defaultSize: "half",
    type: "SUMS",
  },
  printTime: {
    id: "printTime",
    label: "Average Print Time",
    component: BarChartAvgPrintTime,
    defaultSize: "full",
    type: "3DPOS",
  },
  percentSuccess: {
    id: "percentSuccess",
    label: "Success Rate",
    component: PercentSuccessfulCard,
    defaultSize: "full",
    type: "3DPOS",
  },
};

export default function PiPage() {
  const [isMounted, setIsMounted] = useState(false);

  const loadSavedPreferences = () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("piPreferences");
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
    return {
      selectedComponents: Object.keys(componentRegistry),
      componentOrder: Object.keys(componentRegistry),
    };
  };

  const [selectedComponents, setSelectedComponents] = useState(
    Object.keys(componentRegistry)
  );
  const [componentOrder, setComponentOrder] = useState(
    Object.keys(componentRegistry)
  );

  useEffect(() => {
    const { selectedComponents: savedSelected, componentOrder: savedOrder } =
      loadSavedPreferences();
    setSelectedComponents(savedSelected);
    setComponentOrder(savedOrder);
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(
        "piPreferences",
        JSON.stringify({
          selectedComponents,
          componentOrder,
        })
      );
    }
  }, [selectedComponents, componentOrder, isMounted]);

  // Add the renderIcon function
  const renderIcon = (type) => {
    switch (type) {
      case "SUMS":
        return "🔧"; // SUMS icon
      case "3DPOS":
        return "🖨️"; // 3DPOS icon
      default:
        return null;
    }
  };

  const renderComponents = () => {
    const orderToUse = isMounted
      ? componentOrder
      : Object.keys(componentRegistry);
    const selectedToUse = isMounted
      ? selectedComponents
      : Object.keys(componentRegistry);

    const fullWidthComponents = [];
    const halfWidthComponents = [];

    orderToUse.forEach((componentId) => {
      const config = componentRegistry[componentId];
      if (!config) return; // Skip if undefined
      if (!selectedToUse.includes(componentId)) return;
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
                <div className="flex items-center space-x-2">
                  <span>{renderIcon(config.type)}</span>
                  <h3 className="text-lg font-semibold">{config.label}</h3>
                </div>
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
                <div className="flex items-center space-x-2">
                  <span>{renderIcon(config.type)}</span>
                  <h3 className="text-lg font-semibold">{config.label}</h3>
                </div>
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
            <h1 className="text-xl font-semibold">PI Dashboard</h1>
          </header>

          <main className="flex-1 p-4 space-y-4">
            {/* Dynamic components */}
            {renderComponents()}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}