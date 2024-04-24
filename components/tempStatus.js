import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const ApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function ExampleChart(props) {
  const [series, setSeries] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const machineData = async () => {
      const response = await fetch('/api/saw?date_min=2024/02/01');
      const data = await response.json();
      console.log(data);
      const temperatures = data.map(d => parseFloat(d.temp));
      const dates = data.map(d => d.recorded_at);
      setSeries([{ name: "Temperature", data: temperatures }]);
      setCategories(dates);
    };

    machineData();
  }, []);

  const options = {
    chart: {
      id: 'basic-bar',
      zoom: {
        enabled: true,
        type: 'x',
      },
    },
    stroke: {
      curve: 'smooth',
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      type: 'datetime',
      categories: categories,
      tickPlacement: 'on',
    },
    tooltip: {
      x: {
        format: 'dd MMM yyyy HH:mm:ss',
      },
    },
  };

  return (
    <div className="bg-white h-96 rounded-lg drop-shadow-lg">
      <ApexChart type={props.type} options={options} series={series} height={'100%'} width={'100%'} />
    </div>
  );
}