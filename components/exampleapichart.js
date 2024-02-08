// charts.tsx/jsx

'use client' // if you use app dir, don't forget this line

import dynamic from "next/dynamic";
const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });


export default function ExampleAPIChart(){

    const option = {
        chart: {
          id: 'apichart',
          type: 'bar',
        }, 
        noData: {
            text: 'Loading...',
        }
      }

    const series = [{
        name: 'series-1',
        data: []
      }]

    
    
    const url = "https://jsonplaceholder.typicode.com/todos";
        const options = {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json;charset=UTF-8",
        },
            body: JSON.stringify({
                a: 20,
                b: 10,
            }),
        };
        fetch(url, options).then((response) => response.json()).then((data) => {console.log(data);
    });
    // var url = 'http://my-json-server.typicode.com/apexcharts/apexcharts.js/yearly';
    // getJSON(url, function(response) {
    //     chart.updateSeries([{
    //       name: 'Sales',
    //       data: response
    //     }])
    //   });
    // getSales();61
    
    return(


        <div className="bg-white w-96 h-96 rounded-lg drop-shadow-lg m-3">

            <ApexChart type="bar" options={option} series={series} height={'100%'} width={'100%'} />
        </div>
    )
    
}