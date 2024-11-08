import ToolStatusListView from "../src/ui/visuals/list-views/list-view-tool-status";
import PrinterStatusListView from "../src/ui/visuals/list-views/list-view-printer-status";
import JobLeaderboardPodium from "../src/ui/visuals/leaderboard/leaderboard";
import PrinterJobCounts from "../src/ui/visuals/job-counts/printerjobcounts";
import BarChartAvgPrintTime from "../src/ui/visuals/bar-charts/bar-chart-avg-print-time";
import PercentSuccessfulCard from "../src/ui/visuals/line-chart/PercentSuccessfulCard";
import MostCommonReasonCard from "../src/ui/visuals/pie-chart/MostCommonReasonCard";
import AttendanceDataCard from "../src/ui/visuals/line-chart/attendance-over-time";

export interface DashboardComponent {
  id: string;
  label: string;
  component: React.ComponentType;
  defaultSize: 'half' | 'full';
}

export interface ComponentRegistry {
  [key: string]: DashboardComponent;
}

export const componentRegistry: ComponentRegistry = {
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

export default componentRegistry;