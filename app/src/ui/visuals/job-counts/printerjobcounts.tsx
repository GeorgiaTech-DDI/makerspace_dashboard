import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { shuffle } from 'lodash'; // imported lodash for shuffling

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
  const [currentData, setCurrentData] = useState<PrinterJobData | null>(null);
  const [shuffledData, setShuffledData] = useState<PrinterJobData[]>([]);

  useEffect(() => {
    const fetchJobCounts = async () => {
      try {
        const session = 'YOUR_SESSION_TOKEN';
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
        setShuffledData(shuffle(printers)); // Shuffle initially
        setCurrentData(printers[0]); // Set the first card data
      } catch (err: any) {
        setError(err.message || 'Failed to fetch printer job counts');
      }
    };

    fetchJobCounts();

    // Shuffle the data every 12 seconds
    const shuffleInterval = setInterval(() => {
      setShuffledData(shuffle(jobData));
    }, 12000);

    return () => clearInterval(shuffleInterval);
  }, [jobData]);

  // Prepare data for the two line charts (daily and weekly views)
  const dailyChartData = [
    { name: 'Day 1', in_queue: 5, in_progress: 2, failed: 1, finished: 7, aborted: 0, printer_id: 'Printer_A' },
    { name: 'Day 2', in_queue: 8, in_progress: 1, failed: 0, finished: 5, aborted: 1, printer_id: 'Printer_B' },
    { name: 'Day 3', in_queue: 6, in_progress: 3, failed: 2, finished: 6, aborted: 0, printer_id: 'Printer_C' },
    { name: 'Day 4', in_queue: 7, in_progress: 4, failed: 1, finished: 8, aborted: 0, printer_id: 'Printer_D' },
    { name: 'Day 5', in_queue: 4, in_progress: 1, failed: 0, finished: 9, aborted: 1, printer_id: 'Printer_E' },
  ];

  const handleHighlight = (printer_id: string) => {
    setCurrentData(jobData.find((printer) => printer.printer_id === printer_id) || null);
  };

  return (
    <div className="space-y-8">
      {error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <>
          {/* Card for Daily Job Counts */}
          <div className="flex">
            {/* Line Chart */}
            <Card className="p-4 shadow-md border w-3/4">
              <CardHeader>
                <CardTitle>Daily Printer Job Counts (Last 5 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full" style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailyChartData} onMouseMove={(e) => e.activeTooltipIndex !== undefined && handleHighlight(dailyChartData[e.activeTooltipIndex].printer_id)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
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

            {/* Information Card */}
            {currentData && (
              <Card className="p-4 shadow-md border w-1/4 ml-4">
                <CardHeader>
                  <CardTitle>Printer Info: {currentData.printer_id}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{`In Queue: ${currentData.in_queue}`}</p>
                  <p>{`In Progress: ${currentData.in_progress}`}</p>
                  <p>{`Failed: ${currentData.failed}`}</p>
                  <p>{`Finished: ${currentData.finished}`}</p>
                  <p>{`Aborted: ${currentData.aborted}`}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Card for Weekly Job Counts */}
          <Card className="p-4 shadow-md border w-full">
            <CardHeader>
              <CardTitle>Weekly Printer Job Counts (Last 5 Weeks)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full" style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
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