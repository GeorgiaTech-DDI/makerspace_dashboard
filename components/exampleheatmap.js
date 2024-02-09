// charts.tsx/jsx

'use client' 

import dynamic from "next/dynamic";
const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });


export default function ExampleHeatMap(props){

    const option = {
      title: {
        text: "Visitor Frequency",
        align: 'left',
        margin: 10,
        offsetX: 0,
        offsetY: 0,
        floating: false,
        style: {
          fontSize:  '14px',
          fontWeight:  'bold',
          fontFamily:  undefined,
          color:  '#263238'
      }

      },

      chart: {
        id: "heatmap"
      },
      xaxis: {
        categories: ["Jan", "", "", "", "Feb", "", "", ""]
      },
      colors: ["#008FFB"],
      plotOptions: {
        heatmap: {
          colorScale: {
            ranges: [{
                from: 0,
                to: 30,
                color: '#006D32',
                name: 'low',
              },
              {
                from: 30,
                to: 60,
                color: '#26A641',
                name: 'medium',
              },
              {
                from: 60,
                to: 99,
                color: '#39D353',
                name: 'high',
              }
            ]
          }
        }
      }
      }

    const series = [{
        name: "Fri",
        data: [30, 40, 40, 50, 40, 60, 70, 90]
    }, {
        name: "Thurs", 
        data: [80, 10, 60, 50, 20, 90, 20, 70]
    }, {
        name: "Wed",
        data: [30, 70, 50, 10, 70, 20, 90, 40]
    }, {
        name: "Tues", 
        data: [80, 40, 80, 60, 50, 90, 10, 30]
    }, {
        name: "Mon",
        data: [60, 20, 90, 80, 30, 60, 10, 50]

    }]



    const titleOptions = {
      text: "Visitor Frequency",
      align: 'left',
      margin: 10,
      offsetX: 0,
      offsetY: 0,
      floating: false,
      style: {
        fontSize:  '14px',
        fontWeight:  'bold',
        fontFamily:  undefined,
        color:  '#263238'
    }
  }






    return(


        <div className="bg-white h-96 drop-shadow-lg">
         

            <ApexChart type={props.type} options={option} series={series} height={'100%'} width={'100%'} />
        </div>
    )
    
}