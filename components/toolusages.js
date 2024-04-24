import { useEffect, useState } from 'react';



export default function ToolUsage(props){
   
    const [tools, setTools] = useState([]);

    const key = 'A8GNNU22YD5HXXGZJ2T8'
    const egId = 8
    const start_date = '2022-12-31'
    const end_date = '2023-12-31'

    // const tools_url  = `https://sums.gatech.edu/SUMS_React_Shift_Scheduler/rest/EGInfo/ToolStatus?EGKey=${key}&EGId=${egId}`
    const tools_url =  `https://sums.gatech.edu/SUMS_React_Shift_Scheduler/rest/EGInfo/DailyToolUsages?EGKey=${key}&EGId=${egId}&StartDate=${start_date}&EndDate=${end_date}`

    useEffect(() => {
        // fetching the first 10 pokemon from poke API and showing their base experience
        const fetchToolStatus = async () => {
        
         
            const response = await fetch(tools_url);
            const data = await response.json();
           
            setTools(data)


        };
    
        fetchToolStatus();
      }, []);


return(

    <div class="relative overflow-x-auto h-96 rounded-lg drop-shadow-lg">
    <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
                <th scope="col" class="px-6 py-3">
                    Tool Name
                </th>
                <th scope="col" class="px-6 py-3">
                    Usage
                </th>
               
            </tr>
        </thead>
        <tbody>


        {tools.map(function(data) {
            
      return (
        <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                {data.ToolName}
                </th>
                <td class="px-6 py-4">
                    
                    {data.UsageHours}
                </td>
             
            </tr>
      )
    })}
           
        </tbody>
    </table>
</div>
)



}