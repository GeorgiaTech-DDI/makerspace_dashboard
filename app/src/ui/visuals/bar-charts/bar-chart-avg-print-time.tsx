import React, { useState, useEffect } from 'react';
import {
  BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

// Define the interface for the component props
interface BarChartAvgPrintTimeProps {
  title: string;    // Title of the bar chart
  barColor?: string; // Optional prop for bar color
  width?: string | number; // Optional width for the container
  height?: string | number; // Optional height for the container
}

const BarChartAvgPrintTime: React.FC<BarChartAvgPrintTimeProps> = ({
  title,
  barColor = "#B3A369", // Default color for bars
  width = "100%",
  height = 300,
}) => {
  const [labels, setLabels] = useState<string[]>([]);
  const [data, setData] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch average print time data from the API using fetch
    const fetchAveragePrintTime = async () => {
      try {
        const response = await fetch('/api/average-print-time');
        
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        const averagePrintTimes = await response.json();

        // Process data into labels and values
        const labels = averagePrintTimes.map((printer: any) => printer.printerName);
        const data = averagePrintTimes.map((printer: any) => printer.averagePrintTime);

        setLabels(labels);
        setData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching average print time data:', error);
        setLoading(false);
      }
    };

    fetchAveragePrintTime();
  }, []);

  // Combine labels and data into a format usable by Recharts
  const chartData = labels.map((label, index) => ({
    label: label,
    value: data[index],
  }));

  return (
    <div className="p-4 border rounded-lg shadow">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      {loading ? (
        <p>Loading data...</p>
      ) : (
        <ResponsiveContainer width={width} height={height}>
          <RechartsBarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="label" /> {/* Using the 'label' key for x-axis */}
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill={barColor} /> {/* Using the 'value' key for bar values */}
          </RechartsBarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default BarChartAvgPrintTime;
