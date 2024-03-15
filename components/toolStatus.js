import { useEffect, useState } from 'react';



export default function ToolStatus(props){
   
    const [tools, setTools] = useState([]);

    const key = 'A8GNNU22YD5HXXGZJ2T8'
    const egId = 8

    const tools_url  = `https://sums.gatech.edu/SUMS_React_Shift_Scheduler/rest/EGInfo/ToolStatus?EGKey=${key}&EGId=${egId}`


    useEffect(() => {
        // fetching the first 10 pokemon from poke API and showing their base experience
        const fetchToolStatus = async () => {
        
         
            const response = await fetch(tools_url);
            const data = await response.json();
            console.log(data)
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
                    Current Status
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
                    
                    {data.Status}
                </td>
             
            </tr>
      )
    })}
           
        </tbody>
    </table>
</div>
)



}