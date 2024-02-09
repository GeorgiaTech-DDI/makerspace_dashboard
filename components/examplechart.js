// charts.tsx/jsx

'use client' // if you use app dir, don't forget this line

import dynamic from "next/dynamic";
const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });


export default function ExampleChart(props){

    const option = {
      chart: {
        id: "basic-bar"
      },
      xaxis: {
        categories: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998]
      }
      }

    const series = [{
      name: "series-1",
      data: [30, 40, 45, 50, 49, 60, 70, 91]
    }]

    return(


        <div className="h-96 bg-white rounded-lg drop-shadow-lg">

            <ApexChart type={props.type} options={option} series={series} height={'100%'} width={'100%'} />
        </div>
    )
    
}