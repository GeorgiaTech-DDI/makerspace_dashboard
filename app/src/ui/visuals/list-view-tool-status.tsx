import { useEffect, useState } from 'react';

// define the interface (or type) for the tool status data
// this helps ensure that each tool object has a 'Status' and 'ToolName' field
interface ToolStatus {
  Status: string;
  ToolName: string;
}

const ToolStatusListView = () => {
  // useState is a React hook that allows you to add state to functional components
  // `toolStatusData` stores the tool status information, initialized as an empty array
  const [toolStatusData, setToolStatusData] = useState<ToolStatus[]>([]);
  
  // state to manage loading and error
  // these will help show loading indicators or error messages to the user
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // useEffect is a hook that lets you run side effects in your component
  // in this case, it fetches data when the component mounts (first renders)
  useEffect(() => {
    const fetchData = async () => {
      // set loading to true when the data fetch starts
      setLoading(true);
      setError(null); // reset any previous error
      try {
        // fetch data from the "tools_url" SUMS API endpoint
        const response = await fetch(
          'https://sums.gatech.edu/SUMS_React_Shift_Scheduler/rest/EGInfo/ToolStatus?EGKey=***REMOVED***&EGId=8'
        );

        // if the response isn't successful (e.g., 404), throw an error
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }

        // parse the JSON response and update the tool status state with the data
        const data = await response.json();
        setToolStatusData(data);
      } catch (error) {
        // if there's an error, set the error state to display it later
        setError('Error fetching tool status data');
      } finally {
        // once the fetch is complete, stop loading
        setLoading(false);
      }
    };

    // call the fetch function immediately when the component mounts
    fetchData();
  }, []); // the empty array ensures this effect runs only once when the component loads

  // if the data is still loading, show a "Loading..." message
  if (loading) {
    return <p>Loading...</p>;
  }

  // if there was an error during fetching, display it in red text
  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  // return the JSX (HTML-like syntax) for rendering the component
  // this part creates the UI for displaying the tool status data
  return (
    <div className="p-4 border rounded-lg shadow">
      {/* the header for the tool status section */}
      <h3 className="text-lg font-semibold mb-4 sticky top-0 bg-white z-10">Tool Status</h3>
      
      {/* a scrollable container for the tool list */}
      <div className="max-h-96 overflow-y-auto">
        {/* a grid container to display each tool in a separate card */}
        <div className="grid grid-cols-1 gap-4">
          {/* loop over the toolStatusData array and create a "card" for each tool */}
          {toolStatusData.map((tool, index) => (
            <div
              key={index} // unique key for each tool to help React optimize rendering
              className="bg-white p-4 rounded-lg shadow-md border flex justify-between items-center"
              aria-label={`Tool: ${tool.ToolName}, Status: ${tool.Status}`} // improves accessibility by helping screen readers identify each tool
            >
              {/* displaying the tool name and status */}
              <div>
                <p className="text-sm font-medium">{tool.ToolName}</p> {/* tool name */}
                {/* tool status, conditionally setting the text color to green if available, red if not */}
                <p className={`text-sm ${tool.Status.includes('Available') ? 'text-green-600' : 'text-red-600'}`}>
                  {tool.Status}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// export the component so it can be used in other parts of the application
export default ToolStatusListView;