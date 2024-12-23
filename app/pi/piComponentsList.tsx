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
  defaultSize: "half" | "full";
  source?: "SUMS" | "3DPOS";
}

export interface ComponentRegistry {
  [key: string]: DashboardComponent;
}

export const componentRegistry: ComponentRegistry = {
  commonReasons: {
    id: "commonReasons",
    label: "Most Common Reasons",
    component: MostCommonReasonCard,
    defaultSize: "half",
    source: "3DPOS",
  },
  attendance: {
    id: "attendance",
    label: "Attendance Over Time",
    component: AttendanceDataCard,
    defaultSize: "half",
    source: "SUMS",
  },
  printTime: {
    id: "printTime",
    label: "Average Print Time",
    component: BarChartAvgPrintTime,
    defaultSize: "full",
    source: "3DPOS",
  },
  percentSuccess: {
    id: "percentSuccess",
    label: "Success Rate",
    component: PercentSuccessfulCard,
    defaultSize: "full",
    source: "3DPOS",
  },
};

export default componentRegistry;
