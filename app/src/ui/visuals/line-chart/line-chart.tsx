import React from 'react';
 import {
   LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
 } from 'recharts';

 interface LineChartProps {
     title: string; // The title of line chart
     data: Record<any, any>[]; // Flexible data array
     xAxisKey: string; // The key for the x axis
     yAxisKey: string; // The key for the y axis
     strokeColor?: string; // stroke color for the line
     fillColor?: string; // fill color
   }

 const LineChartComponent: React.FC<LineChartProps> = ({
   title,
   data,
   xAxisKey,
   yAxisKey,
   strokeColor = "#B3A369", // Default to GT Gold
   fillColor = "rgba(0, 37, 76, 0.5)" // Default to GT Navy
 }) => {
   return (
     <div className="p-4 border rounded-lg shadow">
       <h3 className="text-lg font-semibold mb-4">{title}</h3>
       <ResponsiveContainer width="100%" height={300}>
         <LineChart data={data}>
           <CartesianGrid strokeDasharray="3 3" />
           <XAxis dataKey={xAxisKey} />
           <YAxis />
           <Tooltip />
           <Legend />
           <Line type="monotone" dataKey={yAxisKey} stroke={strokeColor} fill={fillColor} />
         </LineChart>
       </ResponsiveContainer>
     </div>
   );
 };

 export default LineChartComponent; 