// charts.tsx/jsx

'use client' // if you use app dir, don't forget this line

import dynamic from "next/dynamic";
const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });


export default function ExampleBarChart(){

    

    const option = {
        chart: {
          id: 'apexchart-example'
        },
        xaxis: {
          categories: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999]
        }
      }

    const series = [{
        name: 'series-1',
        data: [30, 40, 35, 50, 49, 60, 70, 91, 125]
      }]

      

    return(


        <div className="bg-white w-96 h-96 rounded-lg drop-shadow-lg m-1">

            <ApexChart type="line" options={option} series={series} height={'100%'} width={'100%'} />
        </div>
    )
    
}