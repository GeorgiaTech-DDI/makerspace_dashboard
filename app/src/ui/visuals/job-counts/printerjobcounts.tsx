import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface JobMetrics {
  period: string;
  percentSuccessful: string;
  totalJobs: number;
  completedJobs: number;
  cancelledJobs: number;
}

const PrinterJobCounts = () => {
  const [metrics, setMetrics] = useState<JobMetrics[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const today = new Date().toISOString().split("T")[0];
        const response = await fetch(
          `/api/3DPOS/jobs?period=day&date=${today}`,
          {
            headers: {
              "x-printer-session": "8",
            },
          },
        );

        if (!response.ok) throw new Error("Failed to fetch metrics");
        const data = await response.json();
        setMetrics(data);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchMetrics();
    const fetchInterval = setInterval(fetchMetrics, 300000); // Refresh every 5 minutes

    return () => clearInterval(fetchInterval);
  }, []);

  // Rotate through metrics every 10 seconds
  useEffect(() => {
    if (metrics.length === 0) return;
    const rotationInterval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % metrics.length);
    }, 10000);

    return () => clearInterval(rotationInterval);
  }, [metrics.length]);

  if (error) return <div className="text-red-600">Error: {error}</div>;
  if (!metrics.length) return <div>Loading printer statistics...</div>;

  const currentMetric = metrics[currentIndex];

  return (
    <div className="space-y-4">
      <Card className="shadow-lg">
        <CardHeader className="pb-2">
          <CardTitle className="flex justify-between items-center">
            <span>Printer Statistics</span>
            <Badge
              variant={
                parseInt(currentMetric.percentSuccessful) > 80
                  ? "default"
                  : parseInt(currentMetric.percentSuccessful) > 60
                    ? "secondary"
                    : "destructive"
              }
            >
              {currentMetric.percentSuccessful} Success Rate
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{currentMetric.totalJobs}</p>
              <p className="text-sm text-muted-foreground">Total Jobs</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {currentMetric.completedJobs}
              </p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {currentMetric.cancelledJobs}
              </p>
              <p className="text-sm text-muted-foreground">Cancelled</p>
            </div>
          </div>

          {/* Chart */}
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="totalJobs"
                  stroke="#8884d8"
                  name="Total"
                />
                <Line
                  type="monotone"
                  dataKey="completedJobs"
                  stroke="#82ca9d"
                  name="Completed"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Period Indicator */}
          <div className="flex justify-center mt-2 gap-1">
            {metrics.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 w-1.5 rounded-full ${
                  idx === currentIndex ? "bg-primary" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrinterJobCounts;