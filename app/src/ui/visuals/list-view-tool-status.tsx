import { useEffect, useState } from 'react';

interface ToolStatus {
  Status: string;
  ToolName: string;
}

const ToolStatusListView = () => {
  const [toolStatusData, setToolStatusData] = useState<ToolStatus[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          'https://sums.gatech.edu/SUMS_React_Shift_Scheduler/rest/EGInfo/ToolStatus?EGKey=***REMOVED***&EGId=8'
        );
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        setToolStatusData(data);
      } catch (error) {
        setError('Error fetching tool status data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="p-4 border rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4 sticky top-0 bg-white z-10">Tool Status</h3>
      <div className="max-h-96 overflow-y-auto">
        <div className="grid grid-cols-1 gap-4">
          {toolStatusData.map((tool, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-lg shadow-md border flex justify-between items-center"
              aria-label={`Tool: ${tool.ToolName}, Status: ${tool.Status}`}
            >
              <div>
                <p className="text-sm font-medium">{tool.ToolName}</p>
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

export default ToolStatusListView;