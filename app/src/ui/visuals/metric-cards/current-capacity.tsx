import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUpIcon, TrendingDownIcon } from 'lucide-react';

const CurrentCapacity = () => {
  const [capacity, setCapacity] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCapacity = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/SUMS/current_capacity');

        if (!response.ok) {
          throw new Error('Failed to fetch current capacity');
        }

        const data = await response.json();
        setCapacity(data.current_capacity);
      } catch (error) {
        console.error('Error fetching current capacity:', error);
        setError('Failed to load current capacity. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCapacity();

    // Optionally, refresh the capacity every minute
    const interval = setInterval(fetchCapacity, 60000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Current Occupancy</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Current Capacity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Capacity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center">
          <span className="text-4xl font-bold mr-2">{capacity}</span>
          <span className="text-sm text-muted-foreground">
            users in the Invention Studio
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrentCapacity;
