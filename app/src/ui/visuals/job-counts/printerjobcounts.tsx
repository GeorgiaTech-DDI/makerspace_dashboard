import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PrinterJobData {
  printer_id: string;
  in_queue: number;
  in_progress: number;
  failed: number;
  finished: number;
  aborted: number;
}

const PrinterJobCounts = () => {
  const [jobData, setJobData] = useState<PrinterJobData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobCounts = async () => {
      try {
        const session = 'YOUR_SESSION_TOKEN'; // Replace this with actual session token
        const response = await fetch(`/api/3DPOS/printer-job-counts`, {
          headers: {
            'x-printer-session': session,
          },
        });
        
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }

        const printers = Object.keys(data).map((printer_id) => ({
          printer_id,
          ...data[printer_id],
        }));

        setJobData(printers);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch printer job counts');
      }
    };

    fetchJobCounts();
  }, []);

  // Prepare data for the two line charts (daily and weekly views)
  const dailyChartData = [
    { name: 'Day 1', in_queue: 5, in_progress: 2, failed: 1, finished: 7, aborted: 0, printer_id: 'Printer_A' },
    { name: 'Day 2', in_queue: 8, in_progress: 1, failed: 0, finished: 5, aborted: 1, printer_id: 'Printer_B' },
    { name: 'Day 3', in_queue: 6, in_progress: 3, failed: 2, finished: 6, aborted: 0, printer_id: 'Printer_C' },
    { name: 'Day 4', in_queue: 7, in_progress: 4, failed: 1, finished: 8, aborted: 0, printer_id: 'Printer_D' },
    { name: 'Day 5', in_queue: 4, in_progress: 1, failed: 0, finished: 9, aborted: 1, printer_id: 'Printer_E' },
  ];

  const weeklyChartData = [
    { name: 'Week 1', in_queue: 25, in_progress: 10, failed: 5, finished: 35, aborted: 2, printer_id: 'Printer_F' },
    { name: 'Week 2', in_queue: 28, in_progress: 12, failed: 3, finished: 30, aborted: 4, printer_id: 'Printer_G' },
    { name: 'Week 3', in_queue: 22, in_progress: 9, failed: 6, finished: 34, aborted: 1, printer_id: 'Printer_H' },
    { name: 'Week 4', in_queue: 27, in_progress: 8, failed: 4, finished: 29, aborted: 0, printer_id: 'Printer_I' },
    { name: 'Week 5', in_queue: 30, in_progress: 7, failed: 2, finished: 31, aborted: 3, printer_id: 'Printer_J' },
  ];

  // Custom Tooltip to show printer_id
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip bg-white p-2 shadow-md border rounded">
          <p className="label">{`${label}`}</p>
          <p>{`In Queue: ${payload[0].value}`}</p>
          <p>{`In Progress: ${payload[1].value}`}</p>
          <p>{`Failed: ${payload[2].value}`}</p>
          <p>{`Finished: ${payload[3].value}`}</p>
          <p>{`Aborted: ${payload[4].value}`}</p>
          <p>{`Printer ID: ${payload[0].payload.printer_id}`}</p> {/* Printer ID displayed here */}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-8">
      {error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <>
          {/* Card for Daily Job Counts */}
          <Card className="p-4 shadow-md border w-full">
            <CardHeader>
              <CardTitle>Daily Printer Job Counts (Last 5 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full" style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} /> {/* Custom Tooltip */}
                    <Legend />
                    <Line type="monotone" dataKey="in_queue" stroke="#8884d8" name="In Queue" />
                    <Line type="monotone" dataKey="in_progress" stroke="#82ca9d" name="In Progress" />
                    <Line type="monotone" dataKey="failed" stroke="#ff7300" name="Failed" />
                    <Line type="monotone" dataKey="finished" stroke="#387908" name="Finished" />
                    <Line type="monotone" dataKey="aborted" stroke="#ff0000" name="Aborted" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Card for Weekly Job Counts */}
          <Card className="p-4 shadow-md border w-full">
            <CardHeader>
              <CardTitle>Weekly Printer Job Counts (Last 5 Weeks)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full" style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} /> {/* Custom Tooltip */}
                    <Legend />
                    <Line type="monotone" dataKey="in_queue" stroke="#8884d8" name="In Queue" />
                    <Line type="monotone" dataKey="in_progress" stroke="#82ca9d" name="In Progress" />
                    <Line type="monotone" dataKey="failed" stroke="#ff7300" name="Failed" />
                    <Line type="monotone" dataKey="finished" stroke="#387908" name="Finished" />
                    <Line type="monotone" dataKey="aborted" stroke="#ff0000" name="Aborted" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default PrinterJobCounts;