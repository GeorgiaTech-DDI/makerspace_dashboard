// removing , doesn't work

import { useEffect, useState } from "react";

// Assuming MetricCard is imported correctly
import MetricCard from "./metric-card";
import { title } from "process";
export default function IdlePrintersCard() {
  const [idleCount, setIdleCount] = useState<number>(0);
  const [trend, setTrend] = useState<number[]>([0, 2, 1, 3, 2, 5, 7]); // Example trend data
  const [change, setChange] = useState<string>("+10%"); // Example change data

  useEffect(() => {
    // Fetch the printer data from the API
    const fetchPrinters = async () => {
      try {
        const response = await fetch("/api/printers");
        const data = await response.json();

        // Filter out idle printers
        const idlePrinters = data.filter(
          (printer: any) => printer.state === "idle",
        );
        setIdleCount(idlePrinters.length);
      } catch (error) {
        console.error("Failed to fetch printers", error);
      }
    };

    fetchPrinters();
  }, []);

  // Render your MetricCard with idle printer count
  return MetricCard({
    title: "Available Printers",
    value: idleCount,
    change: change,
    trend: trend,
  });
}
