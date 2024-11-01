export interface LineGraphDto {
  labels: string[]; // Labels for the X-axis, could represent months, categories, etc.
  datasets: {
    label: string; // The label for each dataset, e.g., "Attendance", "Sales", etc.
    data: number[]; // The data points corresponding to the labels
    fillColor?: string; // Optional: fill color for the area under the line
    strokeColor?: string; // Optional: stroke color for the line
  }[];
  xAxis: {
    scaleLabel: string; // Label for the X-axis, e.g., "Time", "Months"
    scaleType: "linear" | "logarithmic" | "time" | "category"; // Scale type for the X-axis
  };
  yAxis: {
    scaleLabel: string; // Label for the Y-axis, e.g., "Value", "Attendance"
    scaleType: "linear" | "logarithmic" | "category"; // Scale type for the Y-axis
  };
}

export function parseLineGraphData(responseData: any): LineGraphDto {
  return {
    labels: responseData.labels || [],
    datasets: responseData.datasets.map((dataset: any) => ({
      label: dataset.label || "",
      data: dataset.data || [],
      fillColor: dataset.fillColor || "",
      strokeColor: dataset.strokeColor || "",
    })),
    xAxis: {
      scaleLabel: responseData.xAxis.scaleLabel || "",
      scaleType: responseData.xAxis.scaleType || "linear",
    },
    yAxis: {
      scaleLabel: responseData.yAxis.scaleLabel || "",
      scaleType: responseData.yAxis.scaleType || "linear",
    },
  };
}
